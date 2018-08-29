const express = require('express');
const { createServer } = require('http');
const { initializeGraphql } = require('./express-gql');
const expressWinston = require('express-winston');
const logger = require('./logger');

async function initServer ({
  mockMode = false,
  datasourcePaths = [],
} = {}) {
  if (datasourcePaths.length === 0) {
    throw new Error('Need at least one target path with datasources.');
  }

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

  await initializeGraphql(app, {
    datasourcePaths,
    mockMode,
    graphQLPath: '/api/graphql',
    tracing: process.env.GQL_TRACING === 'true' || false,
    cacheControl: process.env.GQL_CACHE_CONTROL === 'true' || false,
  });

  app.use((err, req, res, next) => {
    logger.error(err);
    next(err);
  });

  app.get('/health', (req, res) => {
  	return res.send('OK');
  });

  return server;
}

module.exports = {
  initServer,
};
