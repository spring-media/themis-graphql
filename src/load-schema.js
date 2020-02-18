const { setupModule } = require('./setup-module');
const { insertIfValue } = require('./utils');
const { loadModule } = require('./load-module');
const validateStrategy = require('./validate-strategy');
const logger = require('./logger');
const path = require('path');

function resolveMergeStrategyPath (strategy) {
  if (path.isAbsolute(strategy)) {
    return strategy;
  }
  if (/^.\//.test(strategy)) {
    return path.resolve(process.cwd(), strategy);
  }

  const localStrategy = `./${path.normalize(strategy)}`;

  return require.resolve(localStrategy, {
    paths: [
      ...require.resolve.paths(localStrategy),
      path.resolve(__dirname, 'strategies'),
    ],
  });
}

const loadSchema = async ({
  mergeStrategy,
  modulePaths,
  mockMode,
  useFileSchema,
  filterSubscriptions,
  mergedSchemaTransforms,
}) => {
  if (modulePaths.length === 0) {
    throw new Error('Need at least one target path with modules.');
  }

  const mergeStrategyPath = resolveMergeStrategyPath(mergeStrategy);
  const strategy = require(mergeStrategyPath);

  validateStrategy(strategy, mergeStrategyPath);

  const configs = await Promise.all(modulePaths
    .map(configPath => loadModule(configPath)));

  const sourceNames = configs.map(config => config.name);
  const { duplicates } = sourceNames.reduce((p, name) => {
    if (p.checked.includes(name)) {
      p.duplicates.push(name);
      return p;
    }
    p.checked.push(name);
    return p;
  }, {
    duplicates: [],
    checked: [],
  });

  if (duplicates.length) {
    throw new Error('Module names need to be unique, ' +
      `found duplicates of "${duplicates.join(', ')}"`);
  }

  const moduleConfigMap = configs.reduce((prev, curr) => Object.assign(prev, {
    [curr.name]: curr,
  }), {});

  const sources = await Promise.all(configs
    .map(async config => {
      if (config.dependencies) {
        config.dependencyConfigs = config.dependencies.reduce((p, c) => ({
          ...p,
          [c]: moduleConfigMap[c],
        }), {});
      }

      return setupModule(config, { mockMode, useFileSchema });
    }));

  const {
    context,
    onConnect,
    onDisconnect,
    startupFns,
    shutdownFns,
  } = sources
  .reduce((p, c) => ({
    context: [ ...p.context, ...insertIfValue(c.context) ],
    onConnect: [ ...p.onConnect, ...insertIfValue(c.onConnect) ],
    onDisconnect: [ ...p.onDisconnect, ...insertIfValue(c.onDisconnect) ],
    startupFns: [ ...p.startupFns, ...insertIfValue(c.onStartup) ],
    shutdownFns: [ ...p.shutdownFns, ...insertIfValue(c.onShutdown) ],
  }), {
    context: [],
    onConnect: [],
    onDisconnect: [],
    startupFns: [],
    shutdownFns: [],
  });

  const { schema, context: mergeContext = [] } = strategy.merge(sources, {
    filterSubscriptions,
    mockMode,
    logger,
    mergedSchemaTransforms,
  });

  const combinedContext = context.concat(mergeContext);

  return {
    schema,
    context: combinedContext,
    onConnect,
    onDisconnect,
    startupFns,
    shutdownFns,
  };
};

module.exports = {
  loadSchema,
};
