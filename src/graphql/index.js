const { graphqlExpress, graphiqlExpress } = require('apollo-server-express')
const createSchema = require('./schema')
const bodyParser = require('body-parser')
const { formatError } = require('apollo-errors')

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
      formatError,
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
