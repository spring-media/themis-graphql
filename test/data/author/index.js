const gql = require('graphql-tag');
const authors = [{ id: 1, name: 'One Author', books: [1] }];
const books = [{ id: 1, title: 'One Book' }];

module.exports = {
  name: 'author',
  typeDefs: gql`
    type Query {
      author: Author
    }

    type Author {
      id: Int!
      name: String
      books: [Book]
    }
  `,
  resolvers: {
    Query: {
      author: () => authors.find(author => (author.id === 1)),
    },
    Author: {
      books: author => books.filter(book => author.books.includes(book.id)),
    },
  },
  extendTypes: gql`
    extend type Book {
      author: Author
    }
  `,
  extendResolvers: {
    Book: {
      author: book => authors.find(author => author.books.includes(book.id)),
    },
  },
  dependencies: ['book'],
  importTypes: {
    'book': ['Book'],
  },
};
