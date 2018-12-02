const { spawn } = require('./spawn');

const cliReady = (instance, PORT) => {
  return new Promise(resolve => {
    instance.stdout.on('data', data => {
      if (new RegExp(`running at :::${PORT}`).test(data.toString())) {
      resolve();
      }
    });
  });
};

const spawnCLI = (args, PORT = 54325) => {
  return Promise.resolve().then(() => {
    const instance = spawn('node', [
      'index',
      ...args,
    ], {
      env: {
        ...process.env,
        PORT,
        LOG_LEVEL: 'info',
      },
      detached: true,
    });

    instance.stderr.on('data', data => {
      console.error('Spawn:', data.toString());
    });

    return cliReady(instance, PORT);
  });
};

module.exports = {
  cliReady,
  spawnCLI,
};
