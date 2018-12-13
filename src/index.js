const { initServer } = require('./server');
const { buildDatasource } = require('./build-datasource');
const { setupDatasource } = require('./setup-datasource');
const gql = require('graphql-tag');

module.exports = {
  gql,
  initServer,
  buildDatasource,
  setupDatasource,
};
