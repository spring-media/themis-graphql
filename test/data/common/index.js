const gql = require('graphql-tag');

module.exports = {
  name: 'common',
  typeDefs: gql`
    type CommonBaseType {
      id: ID!
      name: String
    }
  `,
  resolvers: {

  },
};
