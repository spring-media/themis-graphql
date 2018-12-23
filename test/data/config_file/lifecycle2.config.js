const logger = require('../../../src/logger');

module.exports = {
  modules: [
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
