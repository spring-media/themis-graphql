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
  return new Promise(async (resolve, reject) => {
    let resolved = false;
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
      if (!resolved) {
        resolved = true;
        const err = data.toString();

        logger.debug('Spawn:', err);
      }
    });

    instance.stdout.on('data', data => {
      logger.debug('Spawn:', data.toString());
    });

    cliReady(instance, PORT).then(() => resolve());
  });
};

module.exports = {
  cliReady,
  spawnCLI,
};
