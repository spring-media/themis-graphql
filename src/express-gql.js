const { ApolloServer } = require('apollo-server-express');
const { loadSchema } = require('./load-schema');
const { formatError } = require('apollo-errors');

/**
 * Initializes Graphql
 *
 * @param  {Object} app Express instance
 * @return {Object} app
 */
const initializeGraphql = async (app, {
  graphQLPath, tracing, cacheControl, mockMode, datasourcePaths,
}) => {
  const { schema, context = {} } = await loadSchema({ datasourcePaths, mockMode });
  const server = new ApolloServer({
    schema,
    context,
    formatError,
    debug: process.env.NODE_ENV === 'development',
    tracing,
    cacheControl,
  });

  server.applyMiddleware({ app, path: graphQLPath });

  return app;
};

module.exports = { initializeGraphql };
