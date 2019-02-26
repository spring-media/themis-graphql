const typeDefs = require('./schema');
const resolvers = require('./resolvers');
const { PubSub } = require('apollo-server-express');
let intervall = null;

const pubsub = new PubSub();
const CHANGED = 'CHANGED';

module.exports = {
  name: 'subscription2',
  typeDefs,
  resolvers,
  context () {
    return {
      pubsub,
      eventType: {
        CHANGED,
      },
    };
  },
  onStartup () {
    intervall = setInterval(() => {
      pubsub.publish(CHANGED);
    }, 2000);
  },
  onShutdown () {
    clearInterval(intervall);
  },
};
