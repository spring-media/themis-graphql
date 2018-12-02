const typeDefs = require('./schema');
const resolvers = require('./resolvers');

module.exports = {
  name: 'simple',
  namespace: 'Simple',
  typeDefs,
  resolvers,
  mocks: {},
};
