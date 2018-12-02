const typeDefs = require('./schema');
const resolvers = require('./resolvers');
const extendTypes = require('./extend-schema');
const extendResolvers = require('./extend-resolvers');
const mocks = require('./mocks');

module.exports = {
  namespace: 'Article',
  typeDefs,
  resolvers,
  extendTypes,
  extendResolvers,
  mocks,
};
