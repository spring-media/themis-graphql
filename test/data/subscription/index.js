const typeDefs = require('./schema');
const resolvers = require('./resolvers');
const { PubSub } = require('apollo-server-express');
let intervall = null;

const pubsub = new PubSub();
const WALLET_CHANGED = 'WALLET_CHANGED';

const walletState = {
  id: 'baf86a8bf86af8',
  value: 0,
};

module.exports = {
  name: 'subscription',
  typeDefs,
  resolvers,
  mocks: {},
  context () {
    return {
      pubsub,
      eventType: {
        WALLET_CHANGED,
      },
      walletState,
    };
  },
  onStartup () {
    intervall = setInterval(() => {
      walletState.value += Math.round(Math.random() * 100);
      pubsub.publish(WALLET_CHANGED, { wallet: walletState });
    }, 2000);
  },
  onShutdown () {
    clearInterval(intervall);
  },
};
