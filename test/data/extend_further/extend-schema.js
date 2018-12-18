const gql = require('graphql-tag');

module.exports = gql`
  extend type Own {
    further: String
  }
`;
