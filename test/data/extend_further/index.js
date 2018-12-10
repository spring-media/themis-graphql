const extendTypes = require('./extend-schema');
const extendResolvers = require('./extend-resolvers');
const mocks = require('./mocks');

module.exports = {
  name: 'extended-further',
  extendTypes,
  extendResolvers,
  mocks,
};
