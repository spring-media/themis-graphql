const express = require('express');
const { createServer } = require('http');
const { initializeGraphql } = require('./express-gql');
const { nockMiddleware, replayNocks } = require('./nock-queries');
const expressWinston = require('express-winston');
const path = require('path');
const logger = require('./logger');

// eslint-disable-next-line complexity
async function initServer ({
  mockMode = false,
  nockMode = false,
  nockRecord = false,
  nockPath,
  productionMode = true,
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
    const resolvedNockPath = nockPath ? path.resolve(nockPath) : path.join(process.cwd(), '/__query_nocks__');

    if (nockRecord) {
      app.use(nockMiddleware({ nockPath: resolvedNockPath }));
    } else {
      // NOTE: To replay nocks we need to set productionMode to use saved remote schema
      // to be in offline mode, maybe the parameter for initializeGraphql can be renamed
      // to `useFileSchema`
      productionMode = true; // eslint-disable-line
      replayNocks({ nockPath: resolvedNockPath });
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
    productionMode,
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
