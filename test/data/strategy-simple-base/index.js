const gql = require('graphql-tag');

module.exports = {
  name: 'strategy-simple-base',
  typeDefs: gql`
    scalar JSON

    interface BaseArticle {
      title: String
    }
  `,
  resolvers: {},
};
