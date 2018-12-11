const logger = require('./logger');

const mountServer = async ({
  server,
  hasSubscriptions,
  subscriptionsPath,
  graphQLPath,
  startup,
  shutdown,
}) => {
  await startup();

  server.listen(process.env.PORT || 8484, () => {
    const { address, port } = server.address();

    logger.info(`GraphQL Server running at ${address}:${port}${graphQLPath}`);
    if (hasSubscriptions) {
      logger.info(`GraphQL Subscriptions Server running at ${address}:${port}${subscriptionsPath}`);
    }
  });

  const attemptGracefulShutdown = async () => {
    logger.info('Shutting down...');
    await shutdown();
    server.close();
  };

  process.on('SIGINT', attemptGracefulShutdown);
  process.on('SIGTERM', attemptGracefulShutdown);
};

module.exports = {
  mountServer,
};
