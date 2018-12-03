const { ApolloServer } = require('apollo-server-express');
const { loadSchema } = require('./load-schema');
const formatError = require('./format-error');

/**
 * Initializes Graphql
 *
 * @param  {Object} app Express instance
 * @return {Object} app
 */
const initializeGraphql = async (app, {
  graphQLPath,
  tracing,
  cacheControl,
  mockMode,
  datasourcePaths,
  productionMode,
  introspection,
}) => {
  const {
    schema,
    context = [],
    accessViaContext,
  } = await loadSchema({ datasourcePaths, mockMode, productionMode });
  const server = new ApolloServer({
    schema,
    context: (...args) => ({
      ...context.reduce((ctx, fn) => ({
        ...ctx,
        ...fn(...args),
      }), {}),
      ...accessViaContext,
    }),
    formatError,
    debug: process.env.NODE_ENV === 'development',
    tracing,
    cacheControl,
    introspection,
  });

  server.applyMiddleware({ app, path: graphQLPath });

  return app;
};

module.exports = { initializeGraphql };
