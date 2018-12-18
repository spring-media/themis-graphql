module.exports = {
  Query: {
    user: (parent, args, context) => {
      return context.user;
    },
  },
};
