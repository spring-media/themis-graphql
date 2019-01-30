const typeDefs = require('./schema');
const resolvers = require('./resolvers');

module.exports = {
  name: 'context',
  typeDefs,
  resolvers,
  mocks: {},
  context: () => ({
    setByModule: 'yay context',
  }),
};
