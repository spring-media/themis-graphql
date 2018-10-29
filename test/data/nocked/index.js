const typeDefs = require('./schema');
const resolvers = require('./resolvers');

module.exports = {
  namespace: 'Nocked',
  typeDefs,
  resolvers,
  mocks: {},
};
