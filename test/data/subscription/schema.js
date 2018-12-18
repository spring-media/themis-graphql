const gql = require('graphql-tag');

module.exports = gql`
  type Query {
    wallet: Wallet
  }

  type Wallet {
    id: ID
    value: Int
  }

  type Subscription {
    wallet: Wallet
  }
`;
