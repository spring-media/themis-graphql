module.exports = {
  Query: {
    wallet: (p, arg, ctx) => {
      return ctx.walletState;
    },
  },
  Subscription: {
    wallet: {
      subscribe (p, arg, ctx) {
        return ctx.pubsub.asyncIterator([ctx.eventType.WALLET_CHANGED]);
      },
    },
  },
};
