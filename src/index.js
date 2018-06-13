const path = require('path')
const express = require('express')
const { initializeGraphql } = require('./graphql')
const valideEnv = require('./validate-env')
const expressWinston = require('express-winston')
const logger = require('./logger')

valideEnv();

async function start () {
  const app = express()

  app.use(expressWinston.logger({
    winstonInstance: logger,
    statusLevels: true
  }));

  // Initialize graphql
  await initializeGraphql(app, {
    graphQLPath: '/api/graphql',
    graphiQLPath: '/api/graphiql'
  })

  app.listen(process.env.PORT || 8787, () => {
    console.log('RED GQL Aggregation Server running...')
  })
}

start();
