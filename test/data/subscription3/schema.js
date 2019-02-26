const gql = require('graphql-tag');

module.exports = gql`
  type Query {
    allInfo: AllInfo
  }

  type Subscription {
    anotherSub: AllInfo
  }
`;
