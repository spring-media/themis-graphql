const express = require('express');
const { createServer } = require('http');
const { initializeGraphql } = require('./express-gql');
const { nockMiddleware, replayNocks } = require('express-nock');
const expressWinston = require('express-winston');
const crypto = require('crypto');
const logger = require('./logger');

// eslint-disable-next-line complexity
async function initServer ({
  mockMode = false,
  nockMode = false,
  nockRecord = false,
  nockPath = '__query_nocks__',
  useFileSchema = true,
  datasourcePaths = [],
  introspection,
  graphQLPath = '/api/graphql',
  graphQLSubscriptionsPath = '/ws/subscriptions',
  middleware,
  context = [],
  keepAlive = 15000,
  debug = false,
} = {}) {
  if (datasourcePaths.length === 0) {
    throw new Error('Need at least one target path with datasources.');
  }

  const app = express();
  const server = createServer(app);

  if (process.env.LOG_LEVEL === 'debug') {
    const createReqResLog = require('./logger/log-req-res');

    app.use(createReqResLog(logger));
  }

  app.use(expressWinston.logger({
    winstonInstance: logger,
    statusLevels: true,
  }));

  if (middleware) {
    if (Array.isArray(middleware.before)) {
      middleware.before.forEach(fn => app.use(fn));
    }
  }

  if (nockMode) {
    if (nockRecord) {
      const hashFn = ({ body }) => crypto.createHash('md5').update(JSON.stringify(body)).digest('hex');

      app.use(nockMiddleware({ nockPath, hashFn }));
    } else {
      // NOTE: To replay nocks we need to set useFileSchema to use saved remote schema
      useFileSchema = true; // eslint-disable-line
      replayNocks({ nockPath });
    }
  }

  const cacheControl = {
    defaultMaxAge: parseInt(process.env.GQL_CACHE_CONTROL_MAX_AGE, 10) || 15,
  };

  const gqlOptions = {
    datasourcePaths,
    mockMode,
    nockMode,
    nockRecord,
    useFileSchema,
    graphQLPath,
    graphQLSubscriptionsPath,
    tracing: process.env.GQL_TRACING === 'true' || false,
    cacheControl,
    introspection,
    context,
    keepAlive,
    debug,
  };

  if (process.env.APOLLO_ENGINE_API_KEY) {
    gqlOptions.engine = {
      apiKey: process.env.APOLLO_ENGINE_API_KEY,
    };
  }

  await initializeGraphql(app, gqlOptions);

  if (middleware) {
    if (Array.isArray(middleware.after)) {
      middleware.after.forEach(fn => app.use(fn));
    }
  }

  app.use((err, req, res, next) => {
    logger.error(err);
    next(err);
  });

  app.get('/health', (req, res) => {
    return res.send('OK');
  });

  return server;
}

module.exports = {
  initServer,
};
