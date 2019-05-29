const gql = require('graphql-tag');

module.exports = {
  name: 'strategy-simple-article',
  typeDefs: gql`
    type Article implements BaseArticle {
      title: String
      meta: JSON
    }

    type Query {
      article: Article
    }
  `,
  resolvers: {},
};
