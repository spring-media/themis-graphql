jest.mock('./logger');
const logger = require('./logger');
const { initServer } = require('./server');
const request = require('supertest');
const path = require('path');
const { spawn } = require('../test/spawn');
const { spawnCLI } = require('../test/utils');

describe('Server', () => {
  describe('Error', () => {
    beforeEach(() => {
      logger.error.mockReset();
    });

    afterEach(async () => {
      await spawn.anakin();
    });

    it('logs resolver errors', async () => {
      const { server } = await initServer({
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

      server.close();

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

      expect(logger.error).toHaveBeenCalledWith(expect.stringMatching('Error: resolver error in datasource\n'));
      expect(res.body).toMatchObject(expect.objectContaining(expected));
    });

    it('logs remote link network errors', async () => {
      const { server } = await initServer({
        datasourcePaths: [
          path.resolve(__dirname, '../test/data/unavailable-remote'),
        ],
        useFileSchema: true,
      });

      const res = await request(server)
        .post('/api/graphql')
        .send({
          query: 'query { simple }',
        })
        .expect(200);

      server.close();

      const expected = {
        data: {
          simple: null,
        },
        errors: [{
          message: expect.stringContaining('[Remote Network Error in "cms (http://definitely-not-available.internal/api/graphql)"]'),
          locations: [{ line: 1, column: 9 }],
          path: ['simple'],
          extensions: {
            code: 'INTERNAL_SERVER_ERROR',
            exception: {
              errors: [{
                message: expect.stringContaining('[Remote Network Error in "cms (http://definitely-not-available.internal/api/graphql)"]'),
                locations: [],
                path: ['simple'],
              }],
            },
          },
        }],
      };

      expect(logger.error).toHaveBeenCalledWith(
        expect.stringContaining(
          '[Remote Network Error in "cms (http://definitely-not-available.internal/api/graphql)"]'
        )
      );
      expect(res.body).toMatchObject(expect.objectContaining(expected));
    });

    it('logs remote link graphql errors', async () => {
      await spawnCLI([
        path.resolve(__dirname, '../test/data/error'),
      ], {
        PORT: 53412,
      });

      const { server } = await initServer({
        datasourcePaths: [
          path.resolve(__dirname, '../test/data/error-remote'),
        ],
        useFileSchema: false,
      });

      const res = await request(server)
        .post('/api/graphql')
        .send({
          query: 'query { error }',
        })
        .expect(200);

      server.close();

      const expected = {
        data: {
          error: null,
        },
        errors: [{
          message: expect.stringContaining('[Remote GraphQL Error in "error-remote (http://127.0.0.1:53412/api/graphql)"]'),
          locations: [{ line: 1, column: 9 }],
          path: ['error'],
          extensions: {
            code: 'INTERNAL_SERVER_ERROR',
            exception: {
              errors: [{
                message: expect.stringContaining('[Remote GraphQL Error in "error-remote (http://127.0.0.1:53412/api/graphql)"]'),
                locations: [],
                path: ['error'],
              }],
            },
          },
        }],
      };

      expect(logger.error).toHaveBeenCalledWith(
        expect.stringContaining(
          '[Remote GraphQL Error in "error-remote (http://127.0.0.1:53412/api/graphql)"]'
        )
      );
      expect(res.body).toMatchObject(expect.objectContaining(expected));
    });

    it('logs remote link graphql errors (with failing local resolver)', async () => {
      await spawnCLI([
        path.resolve(__dirname, '../test/data/partial-error'),
      ], {
        PORT: 53412,
      });

      const { server } = await initServer({
        datasourcePaths: [
          path.resolve(__dirname, '../test/data/error-remote'),
          path.resolve(__dirname, '../test/data/error-remote-and-local'),
        ],
        useFileSchema: false,
      });

      const res = await request(server)
        .post('/api/graphql')
        .send({
          query: `query {
            alsoError {
              id
              fieldA
              fieldB
            }
          }`,
        })
        .expect(200);

      server.close();

      const expected = {
        data: {
          alsoError: null,
        },
        errors: [{
          message: expect.stringContaining('Local Error'),
          locations: [{ line: 2, column: 13 }],
          path: ['alsoError'],
          extensions: {
            code: 'INTERNAL_SERVER_ERROR',
            exception: {
              errors: [{
                message: expect.stringContaining('Local Error'),
                locations: [],
                path: ['alsoError'],
              }],
            },
          },
        }],
      };

      expect(logger.error).toHaveBeenCalledWith(expect.stringContaining('Local Error'));
      expect(logger.error).toHaveBeenCalledWith(
        expect.stringContaining(
          '[Remote GraphQL Error in "error-remote (http://127.0.0.1:53412/api/graphql)"]'
        )
      );
      expect(res.body).toMatchObject(expect.objectContaining(expected));
    });

    it('logs validation errors', async () => {
      const { server } = await initServer({
        datasourcePaths: [
          path.resolve(__dirname, '../test/data/error'),
        ],
      });

      const res = await request(server)
        .post('/api/graphql')
        .send({
          query: 'query { imageStuff }',
        })
        .expect(400);

      server.close();

      const expected = {
        errors: [{
          message: 'Cannot query field "imageStuff" on type "Query".',
          locations: [{ line: 1, column: 9 }],
          extensions: {
            code: 'GRAPHQL_VALIDATION_FAILED',
          },
        }],
      };

      expect(logger.error).toHaveBeenCalledWith(expect.stringMatching('Cannot query field "imageStuff" on type "Query".'));
      expect(res.body).toMatchObject(expect.objectContaining(expected));
    });
  });
});
