const path = require('path')
const express = require('express')
const { initializeGraphql } = require('./graphql')
const valideEnv = require('./validate-env')

valideEnv();

async function start () {
  const app = express()

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
