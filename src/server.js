const express = require('express');
const { createServer } = require('http');
const { initializeGraphql } = require('./graphql');
const valideEnv = require('./validate-env');
const expressWinston = require('express-winston');
const logger = require('./logger');

valideEnv();

async function initServer ({
  mockMode = false,
} = {}) {
  const app = express();
  const server = createServer(app);

  if (process.env.LOG_LEVEL === 'debug') {
    const createReqResLog = require('./logger/log-req-res');

    app.use(createReqResLog(logger));
  }

  app.use(expressWinston.logger({
    winstonInstance: logger,
    statusLevels: true,
  }));

  // Initialize graphql
  await initializeGraphql(app, {
    mockMode,
    graphQLPath: '/api/graphql',
    graphiQLPath: '/api/graphiql',
    tracing: process.env.GQL_TRACING === 'true' || false,
    cacheControl: process.env.GQL_CACHE_CONTROL === 'true' || false,
  });

  app.use((err, req, res, next) => {
    logger.error(err);
    next(err);
  });

  return server;
}

module.exports = {
  initServer,
};
