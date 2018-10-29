const express = require('express');
const { createServer } = require('http');
const { initializeGraphql } = require('./express-gql');
const { nockMiddleware, replayNocks } = require('./nock-queries');
const expressWinston = require('express-winston');
const path = require('path');
const logger = require('./logger');

// eslint-disable-next-line complexity
async function initServer ({
  mockMode = false,
  nockMode = false,
  nockRecord = false,
  nockPath = path.join(process.cwd(), '/__query_nocks__'),
  productionMode = true,
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

  if (nockMode) {
    if (nockRecord) {
      app.use(nockMiddleware({ nockPath }));
    } else {
      productionMode = true;
      replayNocks({ nockPath });
    }
  }

  await initializeGraphql(app, {
    datasourcePaths,
    mockMode,
    nockMode,
    nockRecord,
    productionMode,
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
