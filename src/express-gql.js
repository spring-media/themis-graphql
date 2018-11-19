const { ApolloServer } = require('apollo-server-express');
const { loadSchema } = require('./load-schema');
const { formatError } = require('apollo-errors');
const logger = require('./logger');

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
  const { schema, context = {} } = await loadSchema({ datasourcePaths, mockMode, productionMode });
  const server = new ApolloServer({
    schema,
    context,
    formatError: err => {
      err.extensions.exception.errors.forEach(ex => {
        logger.error(ex.stack || ex.message || ex);
      });

      return formatError(err);
    },
    debug: process.env.NODE_ENV === 'development',
    tracing,
    cacheControl,
    introspection,
  });

  server.applyMiddleware({ app, path: graphQLPath });

  return app;
};

module.exports = { initializeGraphql };
