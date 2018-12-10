const typeDefs = require('./schema');
const resolvers = require('./resolvers');

module.exports = {
  name: 'simple',
  typeDefs,
  resolvers,
  mocks: {},
};
