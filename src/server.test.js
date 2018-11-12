jest.mock('./logger');
const logger = require('./logger');
const { initServer } = require('./server');
const request = require('supertest');
const path = require('path');

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

describe('Error', () => {
  it('logs resolver errors', async () => {
    const server = await initServer({
      datasourcePaths: [
        path.resolve(__dirname, '../test/data/error'),
      ],
    });

    const res = await request(server)
      .post('/api/graphql')
      .send({
        query: 'query { error }',
      })
      .expect(200);

    const expected = {
      data: {
        error: null,
      },
      errors: [{
        message: 'resolver error in datasource',
        locations: [{ line: 1, column: 9 }],
        path: ['error'],
        extensions: {
          code: 'INTERNAL_SERVER_ERROR',
          exception: {
            errors: [{
              message: 'resolver error in datasource',
              locations: [],
              path: ['error'],
            }],
          },
        },
      }],
    };

    expect(logger.error).toHaveBeenCalledWith({
      message: 'resolver error in datasource',
      stack: expect.stringMatching('Error: resolver error in datasource\n'),
    });
    expect(res.body).toMatchObject(expect.objectContaining(expected));
  });
});
