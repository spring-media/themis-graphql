const gql = require('graphql-tag');

module.exports = {
  name: 'use-base',
  typeDefs: gql`
    type Query {
      article: Article
    }
    type Article implements BaseArticle {
      id: ID!
      title: String
    }
  `,
  resolvers: {
    Query: {
      article: () => ({
        id: 'one',
        title: 'Extended Base Article',
      }),
    },
  },
  dependencies: [
    'base',
  ],
  importInterfaces: [
    'base',
  ],
};
