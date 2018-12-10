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
          message: expect.stringContaining('[Remote Datasource Network Error in "cms (test/data/unavailable-remote)"]'),
          locations: [{ line: 1, column: 9 }],
          path: ['simple'],
          extensions: {
            code: 'INTERNAL_SERVER_ERROR',
            exception: {
              errors: [{
                message: expect.stringContaining('[Remote Datasource Network Error in "cms (test/data/unavailable-remote)"]'),
                locations: [],
                path: ['simple'],
              }],
            },
          },
        }],
      };

      expect(logger.error).toHaveBeenCalledWith(
        expect.stringContaining(
          '[Remote Datasource Network Error in "cms (test/data/unavailable-remote)"]'
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
          message: expect.stringContaining('[Remote Datasource GraphQL Error in "cms (test/data/error-remote)"]'),
          locations: [{ line: 1, column: 9 }],
          path: ['error'],
          extensions: {
            code: 'INTERNAL_SERVER_ERROR',
            exception: {
              errors: [{
                message: expect.stringContaining('[Remote Datasource GraphQL Error in "cms (test/data/error-remote)"]'),
                locations: [],
                path: ['error'],
              }],
            },
          },
        }],
      };

      expect(logger.error).toHaveBeenCalledWith(
        expect.stringContaining(
          '[Remote Datasource GraphQL Error in "cms (test/data/error-remote)"]'
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
