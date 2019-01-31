const gql = require('graphql-tag');

module.exports = {
  name: 'base',
  typeDefs: gql`
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
  },
};
