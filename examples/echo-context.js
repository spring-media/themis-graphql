const { gql } = require('../src');

module.exports = {
  name: 'hello',
  typeDefs: gql`
    scalar JSON
    type Query {
      context: JSON
    }
  `,
  resolvers: {
    Query: {
      context: (_, a, ctx) => ctx,
    },
  },
};
