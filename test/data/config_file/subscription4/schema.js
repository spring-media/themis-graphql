const gql = require('graphql-tag');

module.exports = gql`
  type Query {
    allInfo: AllInfo
  }

  type Subscription {
    allInfo: AllInfo
  }

  type AllInfo {
    f1: String
  }
`;
