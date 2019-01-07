const { gql, tools: { delegateToSchema } } = require('../../src');
const authors = require('./data/authors').map((a, i) => ({ ...a, id: i }));

module.exports = {
  name: 'author',
  typeDefs: gql`
    type Query {
      author(id: Int!): Author
    }

    type Author {
      id: Int!
      name: String
    }
  `,
  resolvers: {
    Query: {
      author: (_, args) => {
        const author = authors.find(author => (author.id === args.id))
        console.log('QUERY AUTHOR', author)
        return author
      },
    },
    // Author: {
    //   name: (author) => {
    //     console.log('AUTHOR NAME', author)
    //     return author.name
    //   }
    // }
  },
  extendTypes: gql`
    extend type Book {
      author: Author
    }

    extend type Author {
      books: [Book]
    }
  `,
  extendResolvers: {
    Book: {
      author: (book) => console.log('BOOK AUTHOR', book) || authors.find(author => (author.books.includes(book.id)))
    },
    Author: {
      books: (author, _, context, info) => console.log('AUTHOR', author, info) || delegateToSchema({
        schema: context.schemas.book,
        operation: 'query',
				fieldName: 'books',
        context,
        info,
        args: {
          ids: author.books
        }
      }),
      name: (author) => {
        console.log('AUTHOR NAME 2', author)
        return author.name
      }
    }
  },
  dependencies: ['book']
}