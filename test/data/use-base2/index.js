const gql = require('graphql-tag');

module.exports = {
  name: 'use-base2',
  typeDefs: gql`
    type Query {
      article: Article
    }
    type Article implements BaseArticle {
      id: ID!
      title: String
      shared: CommonBaseType
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
    'base3',
    'common',
  ],
  importTypes: {
    base3: ['BaseArticle'],
    common: ['CommonBaseType'],
  },
};
