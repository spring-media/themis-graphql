const express = require('express');
const { createServer } = require('http');
const { initializeGraphql } = require('./graphql');
const valideEnv = require('./validate-env');
const expressWinston = require('express-winston');
const logger = require('./logger');

valideEnv();

async function initServer () {
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
    graphQLPath: '/api/graphql',
    graphiQLPath: '/api/graphiql',
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
