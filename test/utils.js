const { spawn } = require('./spawn');
const path = require('path');
const { ApolloClient } = require('apollo-client');
const { InMemoryCache } = require('apollo-cache-inmemory');
const { HttpLink } = require('apollo-link-http');
const { split } = require('apollo-link');
const { WebSocketLink } = require('apollo-link-ws');
const { getMainDefinition } = require('apollo-utilities');
const fetch = require('node-fetch');

const cliReady = (instance, PORT) => {
  return new Promise(resolve => {
    instance.stdout.on('data', data => {
      if (new RegExp(`running at :::${PORT}`).test(data.toString())) {
        resolve();
      }
    });
  });
};

const spawnCLI = (args, {
  PORT = 54325,
  cwd,
  indexPath,
  onStdOut,
  onStdErr,
} = {}) => {
  return new Promise(async (resolve, reject) => {
    let resolved = false;
    const index = indexPath ? path.join(indexPath, 'index') : 'index';
    const instance = spawn('node', [
      index,
      ...args,
    ], {
      env: {
        ...process.env,
        PORT,
        LOG_LEVEL: 'info',
      },
      cwd,
      detached: true,
    });

    instance.stderr.on('data', data => {
      const err = data.toString();

      if (process.env.LOG_LEVEL === 'debug') {
        console.log('Spawn:', err);
      }

      if (onStdErr) {
        onStdErr(data);
      }

      if (!resolved) {
        resolved = true;
        reject(err);
      }
    });

    instance.stdout.on('data', data => {
      if (process.env.LOG_LEVEL === 'debug') {
        console.log('Spawn:', data.toString());
      }
      if (onStdOut) {
        onStdOut(data);
      }
    });

    cliReady(instance, PORT).then(() => {
      resolved = true;
      resolve(instance);
    });
  });
};

const createClient = ({ port }) => {
  const wsLink = new WebSocketLink({
    uri: `ws://127.0.0.1:${port}/ws/subscriptions`,
  });

  const httpLink = new HttpLink({
    uri: `http://127.0.0.1:${port}/api/graphql`,
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

  return client;
};

module.exports = {
  cliReady,
  spawnCLI,
  createClient,
};
