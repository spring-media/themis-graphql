const { ApolloServer } = require('apollo-server-express');
const { loadSchema } = require('./load-schema');
const formatError = require('./format-error');
const { spreadIf } = require('./utils');

const initializeGraphql = async (app, {
  graphQLPath,
  graphQLSubscriptionsPath,
  tracing,
  keepAlive,
  cacheControl,
  mockMode,
  datasourcePaths,
  productionMode,
  introspection,
  context: configContext,
  debug,
}) => {
  const {
    schema,
    context = [],
    accessViaContext,
  } = await loadSchema({ datasourcePaths, mockMode, productionMode });

  const combinedContext = context.concat(configContext);
  const hasSubscriptionType = Boolean(schema.getSubscriptionType());
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
    ...spreadIf(hasSubscriptionType, {
      subscriptions: {
        path: graphQLSubscriptionsPath,
        onConnect: () => {},
        keepAlive,
      },
    }),
  };
  const server = new ApolloServer(serverOptions);

  if (hasSubscriptionType) {
    server.installSubscriptionHandlers(app);
  }
  server.applyMiddleware({ app, path: graphQLPath });

  return app;
};

module.exports = { initializeGraphql };
