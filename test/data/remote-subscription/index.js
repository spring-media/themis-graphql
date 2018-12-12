/**
 * This is a TEST remote data source
 */
module.exports = {
  name: 'remote-subscription',
  remote: {
    uri: 'http://127.0.0.1:54302/api/graphql',
    wsUri: 'http://127.0.0.1:54302/ws/subscriptions',
  },
};
