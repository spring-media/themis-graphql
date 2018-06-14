const path = require('path')
const express = require('express')
const { createServer } = require('http')
const { initializeGraphql } = require('./graphql')
const valideEnv = require('./validate-env')
const expressWinston = require('express-winston')
const logger = require('./logger')

valideEnv();

(async function start () {
  const app = express()
  const server = createServer(app)

  if (process.env.LOG_LEVEL === 'debug') {
    const createReqResLog = require('./logger/log-req-res')
    app.use(createReqResLog(logger))
  }

  app.use(expressWinston.logger({
    winstonInstance: logger,
    statusLevels: true
  }));

  // Initialize graphql
  await initializeGraphql(app, {
    graphQLPath: '/api/graphql',
    graphiQLPath: '/api/graphiql'
  })
  
  app.use((err, req, res, next) => {
    console.error(err)
    next(err)
  })

  server.listen(process.env.PORT || 8787, (...rest) => {
    const { address, port } = server.address()
    logger.info(`RED GQL Aggregation Server running at ${address}:${port}`)
  })
})()
