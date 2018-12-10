const validateConfig = require('./validate-config');
const path = require('path');
const fs = require('fs');

// eslint-disable-next-line complexity
const loadFileConfig = configPath => {
  if (!configPath) {
    return validateConfig({});
  }

  const resolvedConfigPath = path.isAbsolute(configPath) ?
    configPath :
    path.resolve(process.cwd(), configPath);

  if (!fs.existsSync(resolvedConfigPath)) {
    throw new Error(`Config file not found at "${configPath}"`);
  }

  const dsConfig = require(resolvedConfigPath);
  const fileConfig = validateConfig(dsConfig, resolvedConfigPath);

  const datasources = fileConfig.datasources
    .map(dsPath => {
      if (!path.isAbsolute(dsPath)) {
        if (/^.\//.test(dsPath)) {
          return path.resolve(process.cwd(), dsPath);
        }
        return require.resolve(dsPath, {
          paths: [
            ...require.resolve.paths(dsPath),
            path.join(process.cwd(), 'node_modules') ],
        });
      }
      return dsPath;
    });

  return {
    ...fileConfig,
    datasources,
  };
};

module.exports = {
  loadFileConfig,
};
