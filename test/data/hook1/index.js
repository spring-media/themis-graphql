const typeDefs = require('./schema');
const resolvers = require('./resolvers');
const logger = require('../../../src/logger');

module.exports = {
  name: 'simple',
  typeDefs,
  resolvers,
  mocks: {},
  onStartup () {
    logger.info('startup hoek');
  },
  onShutdown () {
    logger.info('shutdown hoek');
  },
};
