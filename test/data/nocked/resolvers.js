const request = require('request-promise-native');

module.exports = {
  Query: {
    someObject: async (parent, args) => {
      return request({
        url: `http://127.0.0.1:54321/someObject/${args.id}`,
        json: true,
      });
    },
  },
};
