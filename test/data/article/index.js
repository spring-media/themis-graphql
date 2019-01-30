const typeDefs = require('./schema');
const resolvers = require('./resolvers');
const mocks = require('./mocks');

module.exports = {
  name: 'article',
  typeDefs,
  resolvers,
  mocks,
};
