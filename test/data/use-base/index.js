const gql = require('graphql-tag');

module.exports = {
  name: 'use-base',
  typeDefs: gql`
    type Query {
      article: Article
      imported: BaseType
      custom: CustomType
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
      imported: () => ({
        id: 'imported1',
      }),
      custom: () => 'addendum',
    },
  },
  dependencies: [
    'base',
  ],
  importTypes: {
    base: [ 'BaseArticle', 'BaseType', 'CustomType' ],
  },
};
