const gql = require('graphql-tag');

module.exports = gql`
  type Query {
    own: Own
  }

  type Own {
    someField: String
  }
`;
