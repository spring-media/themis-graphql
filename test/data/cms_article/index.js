const gql = require('graphql-tag');

module.exports = {
  name: 'cms-article',
  typeDefs: gql`
    input ArticleInput {
      id: ID!
      version: Int
    }

    type Query {
      article (input: ArticleInput): Article
      teaser: Teaser
    }

    type Article {
      state: String
      creationDate: String
      headlinePlain: String
    }

    type Teaser {
      id: ID
      title: String
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
      teaser: () => {
        return {
          id: 'one',
          title: 'remote title',
        };
      },
    },
  },
};
