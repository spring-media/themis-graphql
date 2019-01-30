const { gql } = require('../src');

module.exports = {
  name: 'bye',
  typeDefs: gql`
    type Query {
      bye: String
    }
  `,
  resolvers: {
    Query: {
      bye: () => 'world'
    }
  }
}