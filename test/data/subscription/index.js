const typeDefs = require('./schema');
const resolvers = require('./resolvers');

module.exports = {
  name: 'subscription',
  typeDefs,
  resolvers,
  mocks: {},
};
