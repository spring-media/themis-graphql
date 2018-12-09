const { initServer } = require('./server');
const { buildDatasource } = require('./build-datasource');
const { setupDatasource } = require('./setup-datasource');

module.exports = {
  initServer,
  buildDatasource,
  setupDatasource,
};
