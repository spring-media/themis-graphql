const typeDefs = require('./schema');
const resolvers = require('./resolvers');
const mocks = require('./mocks');

module.exports = {
  name: 'article',
  namespace: 'Article',
  typeDefs,
  resolvers,
  mocks,
};
