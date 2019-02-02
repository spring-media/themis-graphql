const gql = require('graphql-tag');

module.exports = {
  name: 'base',
  typeDefs: gql`
    type BaseType {
      id: ID!
      title: String
    }

    type Mutation {
      baseMutation: String
    }

    interface BaseArticle {
      id: ID!
    }
  `,
  resolvers: {
    Mutation: {
      baseMutation: () => 'base result',
    },
    BaseType: {
      title: () => 'Imported Resolver',
    },
  },
};
