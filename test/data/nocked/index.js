const typeDefs = require('./schema');
const resolvers = require('./resolvers');

module.exports = {
  name: 'nocked',
  namespace: 'Nocked',
  typeDefs,
  resolvers,
  mocks: {},
};
