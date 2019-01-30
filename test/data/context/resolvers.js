module.exports = {
  Query: {
    additionalContext: (parent, args, context) => {
      return context.setByModule;
    },
  },
};
