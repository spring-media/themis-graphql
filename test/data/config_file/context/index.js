const typeDefs = require('./schema');
const resolvers = require('./resolvers');

module.exports = {
  name: 'user',
  typeDefs,
  resolvers,
  mocks: {},
};
