const gql = require('graphql-tag');

module.exports = {
  name: 'collide-article',
  typeDefs: gql`
  scalar JSON

  input ArticleInput {
    id: ID!
    version: Int
  }

  type Query {
    article (input: ArticleInput): Article
  }

  type Article {
    state: String
    creationDate: String
    headlinePlain: String
  }
`,
  resolvers: {
    Query: {
      article: () => {
        return {
          state: 'checkedin',
          headlinePlain: 'remote headline',
          creationDate: '2018-06-24T00:34:45.253Z',
        };
      },
    },
  },
};
