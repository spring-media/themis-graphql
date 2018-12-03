const gql = require('graphql-tag');

module.exports = gql`
  type Query {
    user: User
  }

  type User {
    id: String
  }
`;
