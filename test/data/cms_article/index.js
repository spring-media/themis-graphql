const typeDefs = require('./schema');
const resolvers = require('./resolvers');
const mocks = require('./mocks');

module.exports = {
  namespace: 'Article',
  typeDefs,
  resolvers,
  mocks,
};
