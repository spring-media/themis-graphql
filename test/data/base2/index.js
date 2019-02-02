const gql = require('graphql-tag');

module.exports = {
  name: 'base2',
  typeDefs: gql`
    type AnotherBaseType {
      id: ID!
      name: String
    }
  `,
  resolvers: {
    AnotherBaseType: {
      name: () => 'Imported Resolver',
    },
  },
};
