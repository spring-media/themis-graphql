const { ApolloServer } = require('apollo-server-express');
const { loadSchema } = require('./load-schema');
const formatError = require('./format-error');
const { spreadIf } = require('./utils');

const initializeGraphql = async (app, server, {
  graphQLPath,
  graphQLSubscriptionsPath,
  tracing,
  keepAlive,
  cacheControl,
  mockMode,
  datasourcePaths,
  useFileSchema,
  introspection,
  context: configContext,
  debug,
}) => {
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
        // onConnect: () => {},
        keepAlive,
      },
    }),
  };
  const apolloServer = new ApolloServer(serverOptions);

  if (hasSubscriptions) {
    apolloServer.installSubscriptionHandlers(server);
  }
  apolloServer.applyMiddleware({ app, path: graphQLPath });

  return { app, hasSubscriptions, startupFns, shutdownFns };
};

module.exports = { initializeGraphql };
