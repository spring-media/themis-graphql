const validateDatasource = require('./validate-datasource');
const logger = require('./logger');

const loadDatasource = async sourcePath => {
  logger.info(`Loading ${sourcePath}`);
  try {
    const config = require(sourcePath);

    validateDatasource(config, sourcePath);

    return config;
  } catch (e) {
    logger.error(`Could not load datasource at ${sourcePath}`);
    throw e;
  }
};

module.exports = { loadDatasource };
