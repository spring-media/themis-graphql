const { gql } = require('../../src');
const authors = require('./data/authors').map((a, i) => ({ ...a, id: i }));

module.exports = {
  name: 'author',
  context: () => ({
    getAuthor: id => authors.find(author => (author.id === id)),
    getAuthors: ids => authors.filter(author => ids.includes(author.id)),
  }),
  typeDefs: gql`
    type Query {
      author(id: Int!): Author
      authors(ids: [Int!]!): [Author]
    }

    type Author {
      id: Int!
      name: String
    }
  `,
  resolvers: {
    Query: {
      author: (_, args, ctx) => ctx.getAuthor(args.id),
      authors: (_, args, ctx) => ctx.getAuthors(args.ids),
    },
  },
  extendTypes: gql`
    extend type Book {
      authors: [Author]
    }

    extend type Author {
      books: [Book]
    }
  `,
  extendResolvers: {
    Book: {
      authors: async (book, args, ctx) => ctx.getAuthors(ctx.getBook(book.id).authors),
    },
    Author: {
      books: async (author, _, ctx) => ctx.getBooks(author.id),
    },
  },
  dependencies: ['book'],
};
