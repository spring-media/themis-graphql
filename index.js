const { initServer } = require('./src/server');
const logger = require('./src/logger');

initServer().then(server => {
  server.listen(process.env.PORT || 8787, () => {
    const { address, port } = server.address();

    logger.info(`RED GQL Aggregation Server running at ${address}:${port}`);
  });
})
;
