const { graphqlExpress, graphiqlExpress } = require('apollo-server-express');
const createSchema = require('./schema');
const bodyParser = require('body-parser');
const { formatError } = require('apollo-errors');
const logger = require('./../logger');

/**
 * Initializes Graphql
 *
 * @param  {Object} app Express instance
 * @return {Object} app
 */
const initializeGraphql = async (app, {
  graphQLPath, graphiQLPath, tracing, cacheControl,
}) => {
  const schema = await createSchema();

  app.use(graphQLPath,
    bodyParser.json(),
    graphqlExpress(req => ({
      formatError: err => {
        const { message, locations, state } = err;
        const params = { message, locations, state };

        const { query, variables, operationName } = req.body;

        logger.error(`message: "${err.message}", QUERY: "${query}", VARIABLES: ${JSON.stringify(variables, null, 2)}, OPERATION: "${operationName}"`);
        if (process.env.LOG_LEVEL === 'debug') {
          const stack = err.extensions && err.extensions.exception && err.extensions.exception.stacktrace;
          const stackStr = stack.join('\n');

          logger.debug(stackStr);
        }

        return formatError(params);
      },
      schema,
      context: {},
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
