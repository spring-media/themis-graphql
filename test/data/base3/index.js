const gql = require('graphql-tag');

module.exports = {
  name: 'base3',
  typeDefs: gql`
    type AnotherBaseType {
      id: ID!
      shared: CommonBaseType
    }

    interface BaseArticle {
      id: ID!
    }
  `,
  resolvers: {
    AnotherBaseType: {
      id: () => 'what?',
      shared: () => ({
        id: 'stuff',
        name: 'else',
      }),
    },
  },
  dependencies: ['common'],
  importTypes: {
    common: ['CommonBaseType'],
  },
};
