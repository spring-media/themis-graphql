const { ApolloServer } = require('apollo-server-express');
const { loadSchema } = require('./load-schema');
const { formatError } = require('apollo-errors');
const logger = require('./logger');

const logStack = err => {
  const stack = err.extensions && err.extensions.exception && err.extensions.exception.stacktrace;
  const stackStr = (stack || []).join('\n');

  if (stackStr) {
    logger.debug(stackStr);
  }
};

const formatErrorWithLog = req => err => {
  const { message, locations, state } = err;
  const params = { message, locations, state };

  const { query, variables, operationName } = req.body;

  logger.error(`message: "${err.message}", QUERY: "${query}", VARIABLES: ${JSON.stringify(variables, null, 2)}, OPERATION: "${operationName}"`);
  if (logger.level === 'debug') {
    logStack(err);
  }

  return formatError(params);
};

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
    formatError: formatErrorWithLog,
    debug: process.env.NODE_ENV === 'development',
    tracing,
    cacheControl,
  });

  server.applyMiddleware({ app, path: graphQLPath });

  return app;
};

module.exports = { initializeGraphql };
