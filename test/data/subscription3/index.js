const typeDefs = require('./schema');
const resolvers = require('./resolvers');

module.exports = {
  name: 'subscription3',
  typeDefs,
  resolvers,
  onConnect () {
    return {
      f2: 'second',
    };
  },
  dependencies: [
    'subscription2',
  ],
  importTypes: {
    subscription2: ['AllInfo'],
  },
};
