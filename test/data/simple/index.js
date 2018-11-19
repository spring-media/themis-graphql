const typeDefs = require('./schema');
const resolvers = require('./resolvers');

module.exports = {
  namespace: 'Simple',
  typeDefs,
  resolvers,
  mocks: {},
};
