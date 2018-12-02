const typeDefs = require('./schema');
const resolvers = require('./resolvers');

module.exports = {
  name: 'error',
  namespace: 'ErrorSource',
  typeDefs,
  resolvers,
  mocks: {},
};
