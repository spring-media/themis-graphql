const { initServer } = require('./server');
const { buildModule } = require('./build-module');
const { setupModule } = require('./setup-module');
const { loadFileQuery } = require('./load-query');
const { loadFileConfig } = require('./load-file-config');
const SelectionFilter = require('./transforms/selection-filter');
const DropFieldFilter = require('./transforms/drop-field-filter');
const graphql = require('graphql');
const tools = require('graphql-tools');
const gql = require('graphql-tag');
const supertest = require('supertest');

module.exports = {
  gql,
  initServer,
  buildModule,
  setupModule,
  graphql,
  tools,
  supertest,
  loadFileQuery,
  loadFileConfig,
  transforms: {
    SelectionFilter,
    DropFieldFilter,
  },
};
