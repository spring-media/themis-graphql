const { initServer } = require('./server');
const request = require('supertest');
const path = require('path');
const testEndpoint = require('../test/test-endpoint');
const nock = require('nock');
const rimraf = require('rimraf');
const fs = require('fs');
const { buildSchema } = require('./build-schema');
const { spawn } = require('child_process');

describe('Server --nock', () => {
  let testServer = null;
  let gqlServer = null;

  beforeEach(() => {
    testServer = testEndpoint.listen('54321');
  });

  afterEach(() => {
    testServer.close();
    if (gqlServer) {
      gqlServer.close();
    }
  });

  it('can record and replay external requests', async () => {
    gqlServer = await initServer({
      nockMode: true,
      nockRecord: true,
      datasourcePaths: [
        path.resolve(__dirname, '../test/data/nocked'),
      ],
    });

    const query = {
      query: `query fetch($id: ID!) {
        someObject(id: $id) {
          id
          state
          creationDate
        }
      }`,
      variables: {
        id: 'one',
      },
    };

    const res1 = await request(gqlServer)
      .post('/api/graphql')
      .send(query)
      .expect(200);

    gqlServer.close();
    testServer.close();

    gqlServer = await initServer({
      nockMode: true,
      datasourcePaths: [
        path.resolve(__dirname, '../test/data/nocked'),
      ],
    });
    gqlServer.listen(12345);

    nock.enableNetConnect(/\:12345/);

    const res2 = await request(gqlServer)
      .post('/api/graphql')
      .send(query)
      .expect(200);

    nock.enableNetConnect();

    expect(res2.text).toBe(res1.text);
  });

  it('can replay recorded requests as persisted nock scopes', async () => {
    gqlServer = await initServer({
      nockMode: true,
      nockRecord: true,
      datasourcePaths: [
        path.resolve(__dirname, '../test/data/nocked'),
      ],
    });

    const query = {
      query: `query fetch($id: ID!) {
        someObject(id: $id) {
          id
          state
          creationDate
        }
      }`,
      variables: {
        id: 'two',
      },
    };

    const res1 = await request(gqlServer)
      .post('/api/graphql')
      .send(query)
      .expect(200);

    gqlServer.close();
    testServer.close();

    gqlServer = await initServer({
      nockMode: true,
      datasourcePaths: [
        path.resolve(__dirname, '../test/data/nocked'),
      ],
    });
    gqlServer.listen(12345);

    nock.enableNetConnect(/\:12345/);

    await request(gqlServer)
      .post('/api/graphql')
      .send(query)
      .expect(200);

    const res2 = await request(gqlServer)
      .post('/api/graphql')
      .send(query)
      .expect(200);

    nock.enableNetConnect();

    expect(res2.text).toBe(res1.text);
  });

  it('can replay recorded gql requests as persisted nock scopes', async () => {
    const remoteServer = spawn('node', [
      'index',
      path.resolve(__dirname, '../test/data/cms_article'),
    ], {
      env: {
        ...process.env,
        PORT: 54325,
      },
      detached: true,
    });

    await new Promise(resolve => {
      // eslint-disable-next-line max-nested-callbacks
      remoteServer.stdout.on('data', data => {
        if (/running at :::54325/.test(data.toString())) {
          resolve();
        }
      });
    });

    const datasourcePaths = [
      path.resolve(__dirname, '../test/data/article'),
      path.resolve(__dirname, '../test/data/nocked_cms'),
    ];

    await buildSchema({
      datasourcePaths,
    });

    gqlServer = await initServer({
      nockMode: true,
      nockRecord: true,
      datasourcePaths,
    });

    const query = {
      query: `query {
        article(input: { id: "some" }) {
          headlinePlain
          state
          creationDate
        }
      }`,
    };

    const res1 = await request(gqlServer)
      .post('/api/graphql')
      .send(query)
      .expect(200);

    gqlServer.close();
    await new Promise(resolve => {
      remoteServer.on('close', () => resolve());
      process.kill(-remoteServer.pid, 'SIGINT');
    });

    gqlServer = await initServer({
      nockMode: true,
      datasourcePaths,
    });
    gqlServer.listen(12345);

    nock.enableNetConnect(/\:12345/);

    await request(gqlServer)
      .post('/api/graphql')
      .send(query)
      .expect(200);

    const res2 = await request(gqlServer)
      .post('/api/graphql')
      .send(query)
      .expect(200);

    nock.enableNetConnect();

    expect(res2.text).toBe(res1.text);
  });

  it('can record to a custom path (relative to process.cwd)', async () => {
    const nockPath = 'test/tmp/custom/nockPath';
    const fullPath = path.join(process.cwd(), nockPath);

    await new Promise((resolve, reject) => rimraf(fullPath, err => err ? reject(err) : resolve())); // eslint-disable-line

    gqlServer = await initServer({
      nockMode: true,
      nockRecord: true,
      nockPath,
      datasourcePaths: [
        path.resolve(__dirname, '../test/data/nocked'),
      ],
    });

    const query = {
      query: `query fetch($id: ID!) {
        someObject(id: $id) {
          id
          state
          creationDate
        }
      }`,
      variables: {
        id: 'one',
      },
    };

    await request(gqlServer)
      .post('/api/graphql')
      .send(query)
      .expect(200);

    const nockFileName = path.join(fullPath, '7a5e59791650d41d36d002d87916930b.json');

    expect(fs.existsSync(nockFileName)).toBeTruthy();
  });
});
