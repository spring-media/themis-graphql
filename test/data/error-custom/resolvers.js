const { UserInputError } = require('apollo-server-express');

module.exports = {
  Query: {
    customError: () => {
      throw new UserInputError('custom resolver error in module', {
        invalidArgs: ['foo'],
      });
    },
  },
};
