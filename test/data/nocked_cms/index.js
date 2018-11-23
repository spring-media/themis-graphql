/**
 * This is a TEST remote data source
 */
module.exports = {
  namespace: 'Article',
  accessViaContext: 'cmsSchema',
  mount: false,
  remote: {
    uri: 'http://127.0.0.1:54325/api/graphql',
  },
};
