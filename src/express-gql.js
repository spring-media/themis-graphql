const { graphqlExpress, graphiqlExpress } = require('apollo-server-express');
const { loadSchema } = require('./load-schema');
const bodyParser = require('body-parser');
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
  graphQLPath, graphiQLPath, tracing, cacheControl, mockMode, datasourcePaths,
}) => {
  const { schema, context = {} } = await loadSchema({ datasourcePaths, mockMode });

  app.use(graphQLPath,
    bodyParser.json(),
    graphqlExpress(req => ({
      formatError: formatErrorWithLog(req),
      schema,
      context,
      debug: process.env.NODE_ENV === 'development',
      tracing,
      cacheControl,
    }))
  );

  // Add graphiql in dev mode
  if (process.env.NODE_ENV !== 'production') {
    app.use(graphiQLPath,
      graphiqlExpress({
        endpointURL: graphQLPath,
      })
    );
  }

  return app;
};

module.exports = { initializeGraphql };
