module.exports = {
  Query: {
    allInfo: () => ({
      f1: 'not',
    }),
  },
  Subscription: {
    allInfo: {
      resolve (p, arg, ctx) {
        return {
          f1: ctx.f1,
        };
      },
      subscribe (p, arg, ctx) {
        return ctx.pubsub.asyncIterator([ctx.eventType.CHANGED]);
      },
    },
  },
};
