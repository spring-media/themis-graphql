const validateDatasource = require('./validate-datasource');
const logger = require('./logger');
const fs = require('fs');
const path = require('path');

const loadDatasource = async sourcePath => {
  logger.info(`Loading ${sourcePath}`);
  try {
    const config = require(sourcePath);

    const packageJsonPath = path.resolve(sourcePath, 'package.json');

    if (fs.existsSync(packageJsonPath)) {
      const packageJson = require(packageJsonPath);

      config.dependencies = packageJson.datasourceDependencies;
    }

    validateDatasource(config, sourcePath);

    return config;
  } catch (e) {
    logger.error(`Could not load datasource at ${sourcePath}`);
    throw e;
  }
};

module.exports = { loadDatasource };
