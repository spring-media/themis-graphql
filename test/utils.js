const { spawn } = require('./spawn');
const path = require('path');
const logger = require('../src/logger');

const cliReady = (instance, PORT) => {
  return new Promise(resolve => {
    instance.stdout.on('data', data => {
      if (new RegExp(`running at :::${PORT}`).test(data.toString())) {
      resolve();
      }
    });
  });
};

const spawnCLI = (args, {
  PORT = 54325,
  cwd,
  indexPath,
} = {}) => {
  return Promise.resolve().then(() => {
    const index = indexPath ? path.join(indexPath, 'index') : 'index';
    const instance = spawn('node', [
      index,
      ...args,
    ], {
      env: {
        ...process.env,
        PORT,
        LOG_LEVEL: 'info',
      },
      cwd,
      detached: true,
    });

    instance.stderr.on('data', data => {
      const err = data.toString();

      logger.debug('Spawn:', err);
      throw err;
    });

    instance.stdout.on('data', data => {
      logger.debug('Spawn:', data.toString());
    });

    return cliReady(instance, PORT);
  });
};

module.exports = {
  cliReady,
  spawnCLI,
};
