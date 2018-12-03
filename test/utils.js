const { spawn } = require('./spawn');
const path = require('path');

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

      if (process.env.LOG_LEVEL === 'debug') {
        console.log('Spawn:', err);
      }
      throw err;
    });

    if (process.env.LOG_LEVEL === 'debug') {
      instance.stdout.on('data', data => {
        console.log('Spawn:', data.toString());
      });
    }

    return cliReady(instance, PORT);
  });
};

module.exports = {
  cliReady,
  spawnCLI,
};
