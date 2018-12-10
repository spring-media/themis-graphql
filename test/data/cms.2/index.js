/**
 * This is a TEST remote data source
 */
module.exports = {
  name: 'cms',
  accessViaContext: 'simpleSchema',
  remote: {
    uri: 'http://127.0.0.1:54125/api/graphql',
    schemaPath: 'customDist/schema.json',
  },
};
