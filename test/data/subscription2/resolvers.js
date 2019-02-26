module.exports = {
  Query: {
    allInfo: () => ({
      f1: 'not',
      f2: 'not',
    }),
  },
  Subscription: {
    allInfo: {
      resolve (p, arg, ctx) {
        return {
          f1: ctx.f1,
          f2: ctx.f2,
        };
      },
      subscribe (p, arg, ctx) {
        return ctx.pubsub.asyncIterator([ctx.eventType.CHANGED]);
      },
    },
  },
};
