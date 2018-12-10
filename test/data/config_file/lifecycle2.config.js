const logger = require('../../../src/logger');

module.exports = {
  datasources: [
    './test/data/hook1',
    './test/data/hook2',
  ],
  onStartup () {
    logger.info('startup hoek');
  },
  onShutdown () {
    logger.info('shutdown hoek');
  },
};
