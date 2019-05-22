const express = require('express');
const { createServer } = require('http');
const { nockMiddleware, replayNocks } = require('express-nock');
const expressWinston = require('express-winston');
const crypto = require('crypto');
const requestId = require('./request-id');
const logger = require('./logger');
const { spreadIf, insertIfValue } = require('./utils');
const { ApolloServer } = require('apollo-server-express');
const { express: voyagerMiddleware } = require('graphql-voyager/middleware');
const { loadSchema } = require('./load-schema');
const formatError = require('./format-error');

const wrapMiddleware = middleware => {
  return (...args) => {
    const next = args[args.length - 1];

    Promise.resolve().then(() => middleware(...args)).catch(ex => next(ex));
  };
};

const applyMiddlewares = (app, middlewares) => {
  if (Array.isArray(middlewares)) {
    middlewares.forEach(fnOrArr => {
      if (Array.isArray(fnOrArr)) {
        return app.use(...fnOrArr
          .map(maybeFn => typeof maybeFn === 'function' ? wrapMiddleware(maybeFn) : maybeFn)
        );
      }
      return app.use(wrapMiddleware(fnOrArr));
    });
  }
};

const setupNockMode = (app, nockMode, nockPath, record) => {
  if (nockMode) {
    if (record) {
      const hashFn = ({ body }) => crypto.createHash('md5').update(JSON.stringify(body)).digest('hex');

      app.use(nockMiddleware({ nockPath, hashFn }));
      return;
    }
    replayNocks({ nockPath });
  }
};

const setupVoyager = (app, voyager, graphQLPath) => {
  if (voyager) {
    app.use('/voyager', voyagerMiddleware({ endpointUrl: graphQLPath }));
  }
};

async function initServer ({
  mockMode = false,
  nockMode = false,
  nockRecord = false,
  nockPath = '__query_nocks__',
  useFileSchema = true,
  datasourcePaths = [],
  introspection,
  graphQLPath = '/api/graphql',
  subscriptions = {},
  middleware = {},
  context: configContext = [],
  debug = false,
  tracing = false,
  engineApiKey,
  onStartup,
  onShutdown,
  cacheControl,
  voyager,
  playground,
} = {}) {
  const app = express();
  const server = createServer(app);

  if (subscriptions !== false) {
    Object.assign(subscriptions, {
      path: '/ws/subscriptions',
      keepAlive: 15000,
      ...Object.keys(subscriptions).reduce((p, k) =>
        subscriptions[k] ? { ...p, [k]: subscriptions[k] } : p, {}),
    });
  }

  if (debug) {
    const createReqResLog = require('./logger/log-req-res');

    app.use(createReqResLog(logger));
  }

  app.use(requestId.middleware());

  app.use(expressWinston.logger({
    winstonInstance: logger,
    statusLevels: true,
  }));

  applyMiddlewares(app, middleware.before);

  setupNockMode(app, nockMode, nockPath, nockRecord);
  setupVoyager(app, voyager, graphQLPath);

  const {
    schema,
    context = [],
    accessViaContext,
    startupFns,
    shutdownFns,
  } = await loadSchema({
    datasourcePaths,
    mockMode,
    useFileSchema: nockMode || useFileSchema,
    filterSubscriptions: subscriptions === false,
  });
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
    playground,
    ...spreadIf(hasSubscriptions, {
      subscriptions,
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

  server.on('close', () => {
    apolloServer.stop();
  });

  applyMiddlewares(app, middleware.after);

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
    subscriptionsPath: subscriptions.path,
    graphQLPath,
    startup,
    shutdown,
  };
}

module.exports = {
  initServer,
};
