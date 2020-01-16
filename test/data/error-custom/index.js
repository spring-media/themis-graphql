const typeDefs = require('./schema');
const resolvers = require('./resolvers');

module.exports = {
  name: 'error-custom',
  typeDefs,
  resolvers,
  mocks: {},
};
