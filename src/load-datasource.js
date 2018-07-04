const validateDatasource = require('./validate-datasource');
const logger = require('./logger');

const loadDatasource = async sourcePath => {
  logger.info(`Loading ${sourcePath}`);
  const config = require(sourcePath);

  validateDatasource(config, sourcePath);

  return config;
};

module.exports = { loadDatasource };
