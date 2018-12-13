const { initServer } = require('./server');
const { buildDatasource } = require('./build-datasource');
const { setupDatasource } = require('./setup-datasource');
const graphql = require('graphql');
const tools = require('graphql-tools');
const gql = require('graphql-tag');

module.exports = {
  gql,
  initServer,
  buildDatasource,
  setupDatasource,
  graphql,
  tools,
};
