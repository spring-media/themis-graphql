const gql = require('graphql-tag');

module.exports = gql`
  type Query {
    someObject (id: ID!): SomeObject
  }

  type SomeObject {
    id: ID!
    state: String
    creationDate: String
  }
`;
