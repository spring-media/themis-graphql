const { initServer } = require('./server');
const request = require('supertest');
const path = require('path');
const { spawn } = require('../test/spawn');
const { spawnCLI } = require('../test/utils');

describe('Server', () => {
  afterEach(async () => {
    await spawn.anakin();
  });

  it('populates the schema with remote data (context schema access, no remote mount)', async () => {
    await spawnCLI([
      path.resolve(__dirname, '../test/data/cms_article'),
    ], {
      PORT: 51234,
    });

    const { server } = await initServer({
      modulePaths: [
        path.resolve(__dirname, '../test/data/article'),
        path.resolve(__dirname, '../test/data/cms'),
      ],
    });

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
          headlinePlain: 'remote headline',
          state: expect.any(String),
          creationDate: expect.any(String),
        }),
      },
    };

    expect(res.body).toMatchObject(expect.objectContaining(expected));
  });

  it('returns custom resolver errors from the remote as expected', async () => {
    await spawnCLI([path.resolve(__dirname, '../test/data/error-custom')], {
      PORT: 53412,
    });

    const { server } = await initServer({
      modulePaths: [
        path.resolve(__dirname, '../test/data/error-remote'),
        path.resolve(__dirname, '../test/data/error-remote-on-delegate'),
      ],
      useFileSchema: false,
    });

    const res = await request(server)
      .post('/api/graphql')
      .send({
        query: `query {
          remoteError
        }`,
      })
      .expect(200);

    server.close();

    const expected = {
      data: {
        remoteError: null,
      },
      errors: [
        {
          extensions: {
            code: 'BAD_USER_INPUT',
            exception: {
              invalidArgs: ['foo'],
            },
            invalidArgs: ['foo'],
          },
          locations: [],
          message:
            '[Remote GraphQL Error in "error-remote (http://127.0.0.1:53412/api/graphql)"]: custom resolver error in module',
          path: ['customError'],
        },
      ],
    };

    expect(res.body).toMatchObject(expect.objectContaining(expected));
  });
});

describe('Context', () => {
  it('lets module extend the query context', async () => {
    const { server } = await initServer({
      modulePaths: [
        path.resolve(__dirname, '../test/data/context'),
      ],
    });

    const res = await request(server)
      .post('/api/graphql')
      .send({
        query: `query {
          additionalContext
        }`,
      })
      .expect(200);

    server.close();

    const expected = {
      data: {
        additionalContext: 'yay context',
      },
    };

    expect(res.body).toMatchObject(expect.objectContaining(expected));
  });
});

describe('Transforms', () => {
  afterEach(async () => {
    await spawn.anakin();
  });

  it('applies transformations to a remote schema', async () => {
    await spawnCLI([
      path.resolve(__dirname, '../test/data/cms_article'),
    ], {
      PORT: 51324,
    });

    const { server } = await initServer({
      modulePaths: [
        path.resolve(__dirname, '../test/data/transformed-remote'),
      ],
      useFileSchema: false,
    });

    const res = await request(server)
      .post('/api/graphql')
      .send({
        query: `query {
          teaser {
            id
          }
        }`,
      })
      .expect(400);

    server.close();

    const expected = {
      errors: [
        {
          extensions: {
            code: 'GRAPHQL_VALIDATION_FAILED',
                },
          locations: [
            {
              column: 11,
              line: 2,
            },
          ],
          message: 'Cannot query field "teaser" on type "Query".',
        },
      ],
    };

    expect(res.body).toMatchObject(expect.objectContaining(expected));
  });

  it('applies transformations to a local schema', async () => {
    const { server } = await initServer({
      modulePaths: [
        path.resolve(__dirname, '../test/data/transformed-local'),
      ],
      useFileSchema: false,
    });

    const res = await request(server)
      .post('/api/graphql')
      .send({
        query: `query {
          teaser {
            id
          }
        }`,
      })
      .expect(400);

    server.close();

    const expected = {
      errors: [
        {
          extensions: {
            code: 'GRAPHQL_VALIDATION_FAILED',
                },
          locations: [
            {
              column: 11,
              line: 2,
            },
          ],
          message: 'Cannot query field "teaser" on type "Query".',
        },
      ],
    };

    expect(res.body).toMatchObject(expect.objectContaining(expected));
  });
});

