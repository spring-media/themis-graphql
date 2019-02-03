const gql = require('graphql-tag');
const authors = [{ id: 1, name: 'One Author' }];
const books = [{ id: 1, title: 'One Book', author: 1 }];

module.exports = {
  name: 'author',
  typeDefs: gql`
    type Query {
      author: Author
    }

    type Author {
      id: Int!
      name: String
    }
  `,
  resolvers: {
    Query: {
      author: () => authors.find(author => (author.id === 1)),
    },
  },
  extendTypes: gql`
    extend type Author {
      books: [Book]
    }

    extend type Book {
      author: Author
    }
  `,
  extendResolvers: {
    Book: {
      author: book => authors.find(author => author.books.includes(book.id)),
    },
    Author: {
      books: author => {
        return books.filter(book => book.author === author.id);
      },
    },
  },
  dependencies: ['book'],
};
