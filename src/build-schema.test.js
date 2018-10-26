const path = require('path');
const { initServer } = require('./server');
const request = require('supertest');
const { buildSchema } = require('./build-schema');

describe('Build Schema', () => {
  it.nock('stores the remote schema into local dist folder for production use', async () => {
    const datasourcePath = path.resolve(__dirname, '../test/data/cms');

    await buildSchema({
      datasourcePaths: [datasourcePath],
    });

    const builtSchema = require(path.join(datasourcePath, 'dist/_remote_schema.json'));

    const expected = {
      data: {
        __schema: {
          directives: expect.any(Array),
          mutationType: expect.any(Object),
          queryType: expect.any(Object),
          subscriptionType: expect.any(Object),
          types: expect.any(Array),
        },
      },
    };

    expect(builtSchema).toMatchObject(expect.objectContaining(expected));
  });

  it.nock('stores the remote schema into custom local path', async () => {
    const datasourcePath = path.resolve(__dirname, '../test/data/cms.1');

    await buildSchema({
      datasourcePaths: [datasourcePath],
    });

    const builtSchema = require(path.join(datasourcePath, 'customDist/schema.json'));

    const expected = {
      data: {
        __schema: {
          directives: expect.any(Array),
          mutationType: expect.any(Object),
          queryType: expect.any(Object),
          subscriptionType: expect.any(Object),
          types: expect.any(Array),
        },
      },
    };

    expect(builtSchema).toMatchObject(expect.objectContaining(expected));
  });

  it.nock('can stores a pretty json schema', async () => {
    const datasourcePath = path.resolve(__dirname, '../test/data/cms.2');

    await buildSchema({
      datasourcePaths: [datasourcePath],
      pretty: true,
    });

    const builtSchema = require(path.join(datasourcePath, 'customDist/schema.json'));

    const expectedSchema = require(path.join(datasourcePath, 'cms.2_pretty_schema.json'));

    expect(builtSchema).toMatchObject(expectedSchema);
  });

  it.nock('uses built schema from custom path', async () => {
    const datasourcePath = path.resolve(__dirname, '../test/data/cms.1');

    await buildSchema({
      datasourcePaths: [datasourcePath],
    });

    const server = await initServer({
      datasourcePaths: [
        path.resolve(__dirname, '../test/data/article'),
        path.resolve(__dirname, '../test/data/cms.1'),
      ],
      productionMode: true,
    });

    const res = await request(server)
      .post('/api/graphql')
      .send({
        query: `query fetchBuiltArticle($input: ArticleInput) {
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
    server.close();
  }, {
    enableNetConnect: ['127.0.0.1'],
  });
});
