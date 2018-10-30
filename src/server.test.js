const { initServer } = require('./server');
const request = require('supertest');
const path = require('path');
const testEndpoint = require('../test/test-endpoint');
const nock = require('nock');

describe('Server', () => {
  let server = null;

  beforeAll.nock(async () => {
    server = await initServer({
      datasourcePaths: [
        path.resolve(__dirname, '../test/data/article'),
        path.resolve(__dirname, '../test/data/cms'),
      ],
    });
  });

  afterAll(() => {
    server.close();
  });

  it.nock('populates the schema with remote data', async () => {
    const res = await request(server)
      .post('/api/graphql')
      .send({
        query: `query fetchArticle($input: ArticleInput) {
          article(input: $input) {
            state
            creationDate
            headlinePlain
          }
        }`,
        variables: {
          input: {
            id: '5b5f24ca91a89200015a2e89',
          },
        },
      })
      .expect(200);

    const expected = {
      data: {
        article: expect.objectContaining({
          headlinePlain: 'WURDE VERHAFTET!!!!',
          state: expect.any(String),
          creationDate: expect.any(String),
        }),
      },
    };

    expect(res.body).toMatchObject(expect.objectContaining(expected));
  }, {
    enableNetConnect: ['127.0.0.1'],
  });
});

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
    gqlServer.listen(12345)

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
    gqlServer.listen(12345)

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
});
