/**
 * This is a TEST remote data source
 */
module.exports = {
  name: 'error-remote',
  accessViaContext: 'remote',
  remote: {
    uri: 'http://127.0.0.1:53412/api/graphql',
  },
};
