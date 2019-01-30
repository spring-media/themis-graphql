const gql = require('graphql-tag');
const { delegateToSchema } = require('graphql-tools');

module.exports = {
  name: 'error-remote-and-local',
  mocks: {},
  typeDefs: gql`
    type Query {
      alsoError: LocalFullObject
    }

    type LocalFullObject {
      id: ID,
      fieldA: String,
      fieldB: String,
    }
  `,
  resolvers: {
    Query: {
      alsoError: async (_, args, context, info) => {
        await delegateToSchema({
          schema: context.schemas['error-remote'],
          operation: 'query',
          fieldName: 'partialError',
          args,
          context,
          info,
        });

        throw new Error('Local Error');
      },
    },
  },
};
