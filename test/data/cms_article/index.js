const typeDefs = require('./schema');
const resolvers = require('./resolvers');
const mocks = require('./mocks');

module.exports = {
  name: 'cms-article',
  typeDefs,
  resolvers,
  mocks,
};
