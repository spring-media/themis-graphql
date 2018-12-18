const gql = require('graphql-tag');

module.exports = gql`
  scalar JSON

  input ArticleInput {
    id: ID!
    version: Int
  }

  type Query {
    article (input: ArticleInput): Article
  }

  type Article {
    state: String
    creationDate: String
    headlinePlain: String
  }
`;
