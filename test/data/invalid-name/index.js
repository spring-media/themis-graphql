const typeDefs = require('./schema');
const resolvers = require('./resolvers');

module.exports = {
  name: 'invalid name', // because space
  typeDefs,
  resolvers,
  mocks: {},
};
