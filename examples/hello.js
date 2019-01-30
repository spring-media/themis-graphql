const { gql } = require('../src');

module.exports = {
  name: 'hello',
  typeDefs: gql`
    type Query {
      hello: String
    }
  `,
  resolvers: {
    Query: {
      hello: () => 'world'
    }
  }
}