const { spawn } = require('../test/spawn');
const { spawnCLI, createClient } = require('../test/utils');
const { gql } = require('apollo-server-express');
const path = require('path');

describe('Server', () => {
  describe('Subscriptions', () => {
    afterEach(async () => {
      await spawn.anakin();
    });

    it('enables subscription when given in schema', async done => {
      await spawnCLI([
        path.resolve(__dirname, '../test/data/subscription'),
      ], {
        PORT: 54301,
      });

      const client = createClient({ port: 54301 });

      client.subscribe({
        query: gql`subscription {
          wallet {
            id
            value
          }
        }`,
      }).subscribe(res => {
        expect(res).toMatchObject(expect.objectContaining({
          data: {
            wallet: {
              id: 'baf86a8bf86af8',
              value: expect.any(Number),
              __typename: 'Wallet',
            },
          },
        }));
        done();
      });
    });

    it('can handle remote subscriptions', async done => {
      await spawnCLI([
        path.resolve(__dirname, '../test/data/subscription'),
      ], {
        PORT: 54302,
      });

      await spawnCLI([
        path.resolve(__dirname, '../test/data/remote-subscription'),
      ], {
        PORT: 54303,
      });

      const client = createClient({ port: 54303 });

      client.subscribe({
        query: gql`subscription {
          wallet {
            id
            value
          }
        }`,
      }).subscribe(res => {
        expect(res).toMatchObject(expect.objectContaining({
          data: {
            wallet: {
              id: 'baf86a8bf86af8',
              value: expect.any(Number),
              __typename: 'Wallet',
            },
          },
        }));
        done();
      });
    });

    it('can use multiple onConnect callbacks', async done => {
      await spawnCLI([
        path.resolve(__dirname, '../test/data/subscription2'),
        path.resolve(__dirname, '../test/data/subscription3'),
      ], {
        PORT: 54301,
      });

      const client = createClient({ port: 54301 });

      client.subscribe({
        query: gql`subscription {
          allInfo {
            f1
            f2
          }
        }`,
      }).subscribe(res => {
        expect(res).toMatchObject(expect.objectContaining({
          data: {
            allInfo: {
              'f1': 'first',
              'f2': 'second',
              '__typename': 'AllInfo',
            },
          },
        }));
        done();
      });
    });
  });
});
