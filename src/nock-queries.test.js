const { initServer } = require('./server');
const request = require('supertest');
const path = require('path');
const testEndpoint = require('../test/test-endpoint');
const nock = require('nock');
const rimraf = require('rimraf');
const fs = require('fs');
const { spawn } = require('../test/spawn');
const { spawnCLI } = require('../test/utils');

describe('Server --nock', () => {
  let testServer = null;
  let gql = null;

  beforeEach(() => {
    testServer = testEndpoint.listen('54321');
  });

  afterEach(async () => {
    testServer.close();
    if (gql) {
      gql.server.close();
    }
    await spawn.anakin();
  });

  it('can record and replay external requests', async () => {
    gql = await initServer({
      nockMode: true,
      nockRecord: true,
      modulePaths: [
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

    const res1 = await request(gql.server)
      .post('/api/graphql')
      .send(query)
      .expect(200);

    gql.server.close();
    testServer.close();

    gql = await initServer({
      nockMode: true,
      modulePaths: [
        path.resolve(__dirname, '../test/data/nocked'),
      ],
    });
    gql.server.listen(12345);

    nock.enableNetConnect(/\:12345/);

    const res2 = await request(gql.server)
      .post('/api/graphql')
      .send(query)
      .expect(200);

    nock.enableNetConnect();

    expect(res1.text).toMatch(/{"data":{"someObject":{"id":"one","state":"occupied","creationDate":".*"}}}/);
    expect(res2.text).toMatch(/{"data":{"someObject":{"id":"one","state":"occupied","creationDate":".*"}}}/);
  });

  it('can replay recorded requests as persisted nock scopes', async () => {
    gql = await initServer({
      nockMode: true,
      nockRecord: true,
      modulePaths: [
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

    const res1 = await request(gql.server)
      .post('/api/graphql')
      .send(query)
      .expect(200);

    gql.server.close();
    testServer.close();

    gql = await initServer({
      nockMode: true,
      modulePaths: [
        path.resolve(__dirname, '../test/data/nocked'),
      ],
    });
    gql.server.listen(12345);

    nock.enableNetConnect(/\:12345/);

    await request(gql.server)
      .post('/api/graphql')
      .send(query)
      .expect(200);

    const res2 = await request(gql.server)
      .post('/api/graphql')
      .send(query)
      .expect(200);

    nock.enableNetConnect();

    expect(res1.text).toMatch(/{"data":{"someObject":{"id":"two","state":"occupied","creationDate":".*"}}}/);
    expect(res2.text).toMatch(/{"data":{"someObject":{"id":"two","state":"occupied","creationDate":".*"}}}/);
  });

  it('can replay recorded gql requests as persisted nock scopes', async () => {
    const remoteServer = await spawnCLI([
      path.resolve(__dirname, '../test/data/cms_article'),
    ]);

    const modulePaths = [
      path.resolve(__dirname, '../test/data/article'),
      path.resolve(__dirname, '../test/data/nocked_cms'),
    ];

    gql = await initServer({
      nockMode: true,
      nockRecord: true,
      modulePaths,
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

    const res1 = await request(gql.server)
      .post('/api/graphql')
      .send(query)
      .expect(200);

    gql.server.close();
    await spawn.killChild(remoteServer, 'SIGINT');

    gql = await initServer({
      nockMode: true,
      modulePaths,
    });
    gql.server.listen(12345);

    nock.enableNetConnect(/\:12345/);

    await request(gql.server)
      .post('/api/graphql')
      .send(query)
      .expect(200);

    const res2 = await request(gql.server)
      .post('/api/graphql')
      .send(query)
      .expect(200);

    nock.enableNetConnect();

    expect(res1.text).toMatch(/{"data":{"article":{"headlinePlain":"remote headline","state":"checkedin","creationDate":".*"}}}/);
    expect(res2.text).toMatch(/{"data":{"article":{"headlinePlain":"remote headline","state":"checkedin","creationDate":".*"}}}/);
  });

  it('can record to a custom path (relative to process.cwd)', async () => {
    const nockPath = 'test/tmp/custom/nockPath';
    const fullPath = path.join(process.cwd(), nockPath);

    await new Promise((resolve, reject) => rimraf(fullPath, err => err ? reject(err) : resolve())); // eslint-disable-line

    gql = await initServer({
      nockMode: true,
      nockRecord: true,
      nockPath,
      modulePaths: [
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

    await request(gql.server)
      .post('/api/graphql')
      .send(query)
      .expect(200);

    const nockFileName = path.join(fullPath, '7a5e59791650d41d36d002d87916930b.json');

    expect(fs.existsSync(nockFileName)).toBeTruthy();
  });
});
