const validateDatasource = require('./validate-datasource');
const logger = require('./logger');
const fs = require('fs');
const path = require('path');

const loadDatasource = async sourcePath => {
  logger.info(`Loading ${sourcePath}`);
  const config = require(sourcePath);

  const packageJsonPath = path.resolve(sourcePath, 'package.json');

  if (fs.existsSync(packageJsonPath)) {
    const packageJson = require(packageJsonPath);

    config.dependencies = packageJson.datasourceDependencies;
  }

  validateDatasource(config, sourcePath);

  return config;
};

module.exports = { loadDatasource };
