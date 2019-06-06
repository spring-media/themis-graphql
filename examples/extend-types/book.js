const { gql } = require('../../src');
const books = require('./data/books').map((b, i) => ({ ...b, id: i }));

module.exports = {
  name: 'book',
  context: () => ({
    getBook: id => books.find(book => (book.id === id)),
    getBooks: authorId => books.filter(book => book.authors.includes(authorId)),
  }),
  typeDefs: gql`
    type Query {
      book(id: Int!): Book
      books(authorId: Int!): [Book]
    }

    type Book {
      id: Int!
      title: String
      description: String
    }
  `,
  resolvers: {
    Query: {
      book: (_, args, ctx) => ctx.getBook(args.id),
      books: (_, args, ctx) => ctx.getBooks(args.authorId),
    },
  },
};
