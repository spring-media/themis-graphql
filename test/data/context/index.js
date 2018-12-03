const typeDefs = require('./schema');
const resolvers = require('./resolvers');

module.exports = {
  name: 'context',
  namespace: 'Context',
  typeDefs,
  resolvers,
  mocks: {},
  context: () => ({
    setByDatasource: 'yay context',
  }),
};
