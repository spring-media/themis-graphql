const gql = require('graphql-tag');

module.exports = gql`
  extend type Article {
    additionalField: String
    sharedType: Own
  }
`;
