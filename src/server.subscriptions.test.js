const { ApolloClient } = require('apollo-client');
const { InMemoryCache } = require('apollo-cache-inmemory');
const { split } = require('apollo-link');
const { HttpLink } = require('apollo-link-http');
const { WebSocketLink } = require('apollo-link-ws');
const { getMainDefinition } = require('apollo-utilities');
const { spawn } = require('../test/spawn');
const { spawnCLI } = require('../test/utils');
const fetch = require('node-fetch');
const { gql } = require('apollo-server-express');
const path = require('path');

describe('Server', () => {
  describe('Subscriptions', () => {
    afterEach(async () => {
      await spawn.anakin();
    });

    it('enables subscription when given in schema', async () => {
      await spawnCLI([
        path.resolve(__dirname, '../test/data/subscription'),
      ], {
        PORT: 54301,
      });

      const wsLink = new WebSocketLink({
        uri: 'ws://127.0.0.1:54301/ws/subscriptions',
      });

      const httpLink = new HttpLink({
        uri: 'http://127.0.0.1:54301/api/graphql',
        fetch,
      });

      const link = split(
        // split based on operation type
        ({ query }) => {
          const { kind, operation } = getMainDefinition(query);

          return kind === 'OperationDefinition' && operation === 'subscription';
        },
        wsLink,
        httpLink
      );

      const cache = new InMemoryCache();
      const client = new ApolloClient({
        link,
        cache,
      });

      client.subscribe({
        query: gql`subscription {
          changedUser {
            id
          }
        }`,
      }).subscribe(res => {
        console.log('Subscribption action', res);
      });
    });
  });
});
