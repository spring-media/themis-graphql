const express = require('express');
const { createServer } = require('http');
const { nockMiddleware, replayNocks } = require('express-nock');
const expressWinston = require('express-winston');
const uuidv4 = require('uuid/v4');
const crypto = require('crypto');
const logger = require('./logger');
const { spreadIf, insertIfValue } = require('./utils');
const { ApolloServer } = require('apollo-server-express');
const { express: voyagerMiddleware } = require('graphql-voyager/middleware');
const { loadSchema } = require('./load-schema');
const logError = require('./log-error');

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

const addRequestIdMiddleware = (req, res, next) => {
  res.locals.requestId = req.header('X-Request-ID') || uuidv4();
  next();
};

const addRequestLoggerMiddleware = (req, res, next) => {
  res.locals.logger = logger.child({ requestId: res.locals.requestId });
  next();
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
  mergeStrategy = 'complex',
  mockMode = false,
  nockMode = false,
  nockRecord = false,
  nockPath = '__query_nocks__',
  useFileSchema = true,
  modulePaths = [],
  introspection,
  graphQLPath = '/api/graphql',
  subscriptions = {},
  middleware = {},
  context: configContext = [],
  onConnect: configOnConnect = [],
  onDisconnect: configOnDisconnect = [],
  debug = false,
  tracing = false,
  engineApiKey,
  onStartup,
  onShutdown,
  cacheControl,
  voyager,
  playground,
  formatError,
  mergedSchemaTransforms,
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

  app.use(addRequestIdMiddleware);
  app.use(addRequestLoggerMiddleware);

  if (debug) {
    const createReqResLog = require('./logger/log-req-res');

    app.use(createReqResLog());
  }

  app.use(expressWinston.logger({
    winstonInstance: logger,
    statusLevels: true,
    dynamicMeta: (req, res) => ({ requestId: res.locals.requestId }),
  }));

  applyMiddlewares(app, middleware.before);

  setupNockMode(app, nockMode, nockPath, nockRecord);
  setupVoyager(app, voyager, graphQLPath);

  const {
    schema,
    context = [],
    onConnect = [],
    onDisconnect = [],
    startupFns,
    shutdownFns,
  } = await loadSchema({
    mergeStrategy,
    modulePaths,
    mockMode,
    useFileSchema: nockMode || useFileSchema,
    filterSubscriptions: subscriptions === false,
    mergedSchemaTransforms,
  });
  const combinedContext = context.concat(configContext);

  const combinedOnConnect = onConnect.concat(configOnConnect);

  subscriptions.onConnect = async (...args) => {
    const onConnectResolved = await Promise.all(combinedOnConnect.map(fn => fn(...args)));

    return onConnectResolved.reduce((ctx, onConnectData) => ({ ...ctx, ...onConnectData }), {});
  };

  const combinedOnDisconnect = onDisconnect.concat(configOnDisconnect);

  subscriptions.onDisconnect = async (...args) => {
    const onDisconnectResolved = await Promise.all(combinedOnDisconnect.map(fn => fn(...args)));

    return onDisconnectResolved.reduce((ctx, onDisconnectData) => ({ ...ctx, ...onDisconnectData }), {});
  };

  const hasSubscriptions = Boolean(schema.getSubscriptionType());
  const serverOptions = {
    schema,
    context: ({ req, res, connection }) => ({
      ...combinedContext.reduce((ctx, fn) => ({
        ...ctx,
        ...fn({ req, res, connection }),
        ...spreadIf(connection && connection.context, () => connection.context),
      }), {}),
    }),
    formatError: err => {
      logError(err);
      if (formatError) {
        return formatError(err);
      }
      return err;
    },
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
    (res.locals.logger || logger).error(err);
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
