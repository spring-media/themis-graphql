const gql = require('graphql-tag');

module.exports = {
  name: 'simple',
  typeDefs: gql`
    type Query {
      simple: String
    }
  `,
  resolvers: {
    Query: {
      simple: () => {
        return 'Hello';
      },
    },
  },
  mocks: {},
};
