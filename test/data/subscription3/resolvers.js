module.exports = {
  Query: {
    allInfo: () => ({
      f1: 'not2',
      f2: 'not2',
    }),
  },
  Subscription: {
    anotherSub: {
      resolve (p, arg, ctx) {
        return {
          f1: ctx.f1,
          f2: ctx.f2,
        };
      },
      subscribe () {
        return [];
      },
    },
  },
};
