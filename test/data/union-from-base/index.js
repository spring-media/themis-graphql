const gql = require('graphql-tag');

module.exports = {
  name: 'use-base2',
  typeDefs: gql`
    type Query {
      unified: OneOf
    }
    union OneOf = BaseType | AnotherBaseType
  `,
  resolvers: {
    Query: {
      unified: () => ({
        id: 'one',
        title: 'Extended Base Article',
      }),
    },
    OneOf: {
      __resolveType: ({ title }) => title ? 'BaseType' : 'AnotherBaseType',
    },
  },
  dependencies: [
    'base', 'base2',
  ],
  importTypes: {
    base: ['BaseType'],
    base2: ['AnotherBaseType'],
  },
};
