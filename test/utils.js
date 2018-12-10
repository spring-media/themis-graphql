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
  onStdOut,
  onStdErr,
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
      const err = data.toString();

      if (process.env.LOG_LEVEL === 'debug') {
        console.log('Spawn:', err);
      }

      if (onStdErr) {
        onStdErr(data);
      }

      if (!resolved) {
        resolved = true;
        reject(err);
      }
    });

    instance.stdout.on('data', data => {
      if (process.env.LOG_LEVEL === 'debug') {
        console.log('Spawn:', data.toString());
      }
      if (onStdOut) {
        onStdOut(data);
      }
    });

    cliReady(instance, PORT).then(() => {
      resolved = true;
      resolve(instance);
    });
  });
};

module.exports = {
  cliReady,
  spawnCLI,
};
