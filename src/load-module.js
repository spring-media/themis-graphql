const validateModule = require('./validate-module');
const logger = require('./logger');
const fs = require('fs');
const path = require('path');

const moduleCache = new Map();

const loadModule = async sourcePath => {
  if (moduleCache.has(sourcePath)) {
    return moduleCache.get(sourcePath);
  }

  logger.info(`Loading ${sourcePath}`);
  let config = require(sourcePath);
  const packageJsonPath = path.resolve(sourcePath, 'package.json');

  if (fs.existsSync(packageJsonPath)) {
    const packageJson = require(packageJsonPath);

    if (config.name) {
      logger.warn('Module name is both in config and package.json');
    }

    config.name = packageJson.name;
    config.dependencies = packageJson.gqlDependencies;
  }

  config = validateModule(config, sourcePath);
  config.sourcePath = sourcePath;

  moduleCache.set(sourcePath, config);

  return config;
};

module.exports = { loadModule };
