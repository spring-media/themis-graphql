const gql = require('graphql-tag');
const { delegateToSchema } = require('graphql-tools');

module.exports = {
  name: 'error-remote-on-delegate',
  typeDefs: gql`
    type Query {
      remoteError: String
    }
  `,
  resolvers: {
    Query: {
      remoteError: (_, args, context, info) =>
        delegateToSchema({
          schema: context.schemas['error-remote'],
          operation: 'query',
          fieldName: 'customError',
          args,
          context,
          info,
        }),
    },
  },
};
