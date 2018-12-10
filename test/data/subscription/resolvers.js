const { PubSub } = require('apollo-server-express');

const pubsub = new PubSub();
const WALLET_CHANGED = 'WALLET_CHANGED';

const walletState = {
  id: 'baf86a8bf86af8',
  value: 0,
};

module.exports = {
  Query: {
    wallet: () => {
      return walletState;
    },
  },
  Subscription: {
    wallet: {
      subscribe () {
        return pubsub.asyncIterator([WALLET_CHANGED]);
      },
    },
  },
};

const intervall = setInterval(() => {
  walletState.value += Math.round(Math.random() * 100);
  pubsub.publish(WALLET_CHANGED, { wallet: walletState });
}, 2000);

process.on('SIGINT', () => {
  clearInterval(intervall);
});
