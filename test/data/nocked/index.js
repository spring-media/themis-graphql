const typeDefs = require('./schema');
const resolvers = require('./resolvers');

module.exports = {
  name: 'nocked',
  typeDefs,
  resolvers,
  mocks: {},
};
