const gql = require('graphql-tag');
const { GraphQLScalarType } = require('graphql');


module.exports = {
  name: 'base',
  typeDefs: gql`
    scalar CustomType

    type BaseType {
      id: ID!
      title: String
    }

    type Mutation {
      baseMutation: String
    }

    interface BaseArticle {
      id: ID!
    }
  `,
  resolvers: {
    Mutation: {
      baseMutation: () => 'base result',
    },
    BaseType: {
      title: () => 'Imported Resolver',
    },
    CustomType: new GraphQLScalarType({
      description: 'some custom type',
      name: 'CustomType',
      serialize (value) {
        return 'custom type value ' + value;
      },
      parseValue (value) {
        return value;
      },
      parseLiteral (ast) {
        return ast.value;
      },
    }),
  },
};
