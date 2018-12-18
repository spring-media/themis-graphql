const typeDefs = require('./schema');
const resolvers = require('./resolvers');
const mocks = require('./mocks');
const validateContext = require('./validate-context');

module.exports = {
  name: 'article',
  typeDefs,
  resolvers,
  mocks,
  validateContext,
};
