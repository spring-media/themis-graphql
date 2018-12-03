const typeDefs = require('./schema');
const resolvers = require('./resolvers');

module.exports = {
  name: 'user',
  namespace: 'User',
  typeDefs,
  resolvers,
  mocks: {},
};
