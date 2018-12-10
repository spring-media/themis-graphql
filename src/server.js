const express = require('express');
const { createServer } = require('http');
const { nockMiddleware, replayNocks } = require('express-nock');
const expressWinston = require('express-winston');
const crypto = require('crypto');
const logger = require('./logger');
const { spreadIf, insertIfValue } = require('./utils');
const { ApolloServer } = require('apollo-server-express');
const { loadSchema } = require('./load-schema');
const formatError = require('./format-error');

const applyMiddlewares = (app, middlewares) => {
  if (Array.isArray(middlewares)) {
    middlewares.forEach(fnOrArr => {
      if (Array.isArray(fnOrArr)) {
        return app.use(...fnOrArr);
      }
      return app.use(fnOrArr);
    });
  }
};

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
  context: configContext = [],
  keepAlive = 15000,
  debug = false,
  tracing = false,
  engineApiKey,
  onStartup,
  onShutdown,
  cacheControl,
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
    applyMiddlewares(app, middleware.before);
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

  const {
    schema,
    context = [],
    accessViaContext,
    startupFns,
    shutdownFns,
  } = await loadSchema({ datasourcePaths, mockMode, useFileSchema });

  const combinedContext = context.concat(configContext);
  const hasSubscriptions = Boolean(schema.getSubscriptionType());

  const serverOptions = {
    schema,
    context: (...args) => ({
      ...combinedContext.reduce((ctx, fn) => ({
        ...ctx,
        ...fn(...args),
      }), {}),
      ...accessViaContext,
    }),
    formatError,
    debug,
    tracing,
    cacheControl,
    introspection,
    ...spreadIf(hasSubscriptions, {
      subscriptions: {
        path: graphQLSubscriptionsPath,
        // TODO: configurable onConnect: () => {},
        keepAlive,
      },
    }),
    ...spreadIf(engineApiKey, {
      engine: {
        apiKey: engineApiKey,
      },
    }),
  };
  const apolloServer = new ApolloServer(serverOptions);

  if (hasSubscriptions) {
    apolloServer.installSubscriptionHandlers(server);
  }

  apolloServer.applyMiddleware({ app, path: graphQLPath });

  if (middleware) {
    applyMiddlewares(app, middleware.after);
  }

  app.use((err, req, res, next) => {
    logger.error(err);
    next(err);
  });

  const startup = () => Promise.all([
    ...startupFns,
    ...insertIfValue(onStartup),
  ].map(fn => fn(server)));

  const shutdown = () => Promise.all([
    ...shutdownFns,
    ...insertIfValue(onShutdown),
  ].map(fn => fn(server)));

  return {
    app,
    server,
    hasSubscriptions,
    graphQLSubscriptionsPath,
    graphQLPath,
    startup,
    shutdown,
  };
}

module.exports = {
  initServer,
};
