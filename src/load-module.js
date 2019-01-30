const validateModule = require('./validate-module');
const logger = require('./logger');
const fs = require('fs');
const path = require('path');

const loadModule = async sourcePath => {
  logger.info(`Loading ${sourcePath}`);
  const config = require(sourcePath);
  const packageJsonPath = path.resolve(sourcePath, 'package.json');

  if (fs.existsSync(packageJsonPath)) {
    const packageJson = require(packageJsonPath);

    if (config.name) {
      logger.warn('Module name is both in config and package.json');
    }

    config.name = packageJson.name;
    config.dependencies = packageJson.gqlDependencies;
  }

  validateModule(config, sourcePath);

  return config;
};

module.exports = { loadModule };
