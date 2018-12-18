const typeDefs = require('./schema');
const resolvers = require('./resolvers');
const extendTypes = require('./extend-schema');
const extendResolvers = require('./extend-resolvers');
const mocks = require('./mocks');

module.exports = {
  name: 'extended-article',
  typeDefs,
  resolvers,
  extendTypes,
  extendResolvers,
  mocks,
};
