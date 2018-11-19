const typeDefs = require('./schema');
const resolvers = require('./resolvers');

module.exports = {
  namespace: 'ErrorSource',
  typeDefs,
  resolvers,
  mocks: {},
};
