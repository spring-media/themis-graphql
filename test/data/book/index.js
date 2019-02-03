const gql = require('graphql-tag');
const books = [{ id: 1, title: 'One Book' }];

module.exports = {
  name: 'book',
  typeDefs: gql`
    type Query {
      book: Book
    }

    type Book {
      id: Int!
      title: String
    }
  `,
  resolvers: {
    Query: {
      book: () => books.find(book => (book.id === 1)),
    },
  },
};
