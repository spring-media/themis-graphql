const logger = require('../../../src/logger');

module.exports = {
  modules: [
    './test/data/simple',
  ],
  onStartup () {
    logger.info('startup hoek');
  },
  onShutdown () {
    logger.info('shutdown hoek');
  },
};
