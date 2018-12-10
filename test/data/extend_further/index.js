const extendTypes = require('./extend-schema');
const extendResolvers = require('./extend-resolvers');
const mocks = require('./mocks');

module.exports = {
  name: 'extended-article',
  extendTypes,
  extendResolvers,
  mocks,
};
