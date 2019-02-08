
const gql = require('graphql-tag');

module.exports = {
  name: 'teaser',
  typeDefs: gql`
    type Query {
      teaser: Teaser
    }
    type Teaser {
      kicker: String
    }
  `,
  resolvers: {
    Query: {
      teaser: () => ({}),
    },
    Teaser: {
      kicker: () => 'Base Kicker',
    },
  },
  extendTypes: gql`
    extend type Article {
      teaser(identifier: String!): Teaser
    }
  `,
  extendResolvers: {
    Article: {
      teaser: {
        fragment: '...on Article { id }',
        resolve: (_, { identifier }, context, info) => {
          return info.mergeInfo.delegateToSchema({
            schema: context.schemas.teaser,
            operation: 'query',
            fieldName: 'teaser',
            args: {
              identifier,
            },
            context,
            info,
          });
        },
      },
    },
  },
};
