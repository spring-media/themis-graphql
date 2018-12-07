/**
 * This is a TEST remote data source
 */
module.exports = {
  name: 'cms',
  namespace: 'Simple',
  accessViaContext: 'simpleSchema',
  mount: false,
  remote: {
    uri: 'http://127.0.0.1:54125/api/graphql',
  },
};
