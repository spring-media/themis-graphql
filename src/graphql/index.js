const { graphqlExpress, graphiqlExpress } = require('apollo-server-express')
const createSchema = require('./schema')
const bodyParser = require('body-parser')
const { formatError } = require('apollo-errors')
const logger = require('./../logger')

/**
 * Initializes Graphql
 *
 * @param  {Object} app Express instance
 * @return {Object} app
 */
const initializeGraphql = async (app, { graphQLPath, graphiQLPath }) => {
  const schema = await createSchema()
  
  app.use(graphQLPath,
    bodyParser.json(),
    graphqlExpress((req, res) => ({
      formatError: err => {
        const params = { message, locations, state } = err;

        const query = req.body && req.body.query
        
        logger.error(`message: "${err.message}", QUERY: "${query}"`);
        
        return formatError(params);
      },
      schema,
      context: {},
      debug: process.env.NODE_ENV === 'development',
      tracing: true,
      cacheControl: true
    }))
  )

  // Add graphiql in dev mode
  if (process.env.NODE_ENV !== 'production') {
    app.use(graphiQLPath,
      graphiqlExpress({
        endpointURL: graphQLPath
      })
    )
  }

  return app
}

module.exports = { initializeGraphql }
