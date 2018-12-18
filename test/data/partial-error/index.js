const gql = require('graphql-tag');

module.exports = {
  name: 'error',
  typeDefs: gql`
  type Query {
    partialError: FullObject
  }

  type FullObject {
    id: ID,
    fieldA: String,
    fieldB: String,
  }
`,
  resolvers: {
    Query: {
      partialError: () => {
        return {
          id: '3k324jkl23j4',
          fieldA: { text: 'stuff' },
          fieldB: null,
        };
      },
    },
    FullObject: {
      fieldA: p => p.fieldA.text,
      fieldB: p => p.fieldB.text,
    },
  },
  mocks: {},
};
