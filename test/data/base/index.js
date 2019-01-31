const gql = require('graphql-tag');

module.exports = {
  name: 'base',
  typeDefs: gql`
    interface BaseArticle {
      id: ID!
    }
  `,
  resolvers: {},
};
