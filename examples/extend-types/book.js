const { gql } = require('../../src');
const books = require('./data/books').map((b, i) => ({ ...b, id: i }));;

module.exports = {
  name: 'book',
  typeDefs: gql`
    type Query {
      book(id: Int!): Book
      books(ids: [Int!]!): [Book]
    }

    type Book {
      id: Int!
      title: String
      description: String
    }
  `,
  resolvers: {
    Query: {
      book: (_, args) => books.find(book => (book.id === args.id)),
      books: (_, args) => books.filter((book) => args.ids.includes(book.id))
    }
  }
};