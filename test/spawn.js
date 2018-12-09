const os = require('os');
const childProcess = require('child_process');
const nativeSpawn = childProcess.spawn;
const exec = childProcess.exec;

let children = [];
const spawn = (...rest) => {
  const child = nativeSpawn(...rest);

  children.push(child);
  return child;
};

const killChild = (child, killSignal = 'SIGTERM') =>
  // eslint-disable-next-line complexity
  new Promise(res => {
    if (child.killed || child.exitCode) {
      res();
      return;
    }

    let resolved = false;
    const resolve = () => {
      if (!resolved) {
        resolved = true;
        res();
      }
    };

    [ 'stdout', 'stdin', 'stderr' ].forEach(io => {
      const socket = child[io];

      socket.removeAllListeners();
      socket.end();
      socket.destroy();
    });

    child.on('close', () => {
      child.isClosed = true;
      // Give it some time for a graceful shutdown
      setTimeout(() => resolve(), 250);
    });

    if (os.platform() === 'win32') {
      exec(`taskkill /pid ${child.pid} /T /F`);
    } else {
      try {
        process.kill(-child.pid, killSignal);
      } catch (e) {
        child.kill(killSignal);
      }
    }

    setTimeout(() => {
      if (!child.isClosed) {
        try {
          process.kill(-child.pid, 'SIGKILL');
        } catch (e) {
          child.kill('SIGKILL');
        }
        resolve();
      }
    }, 250);
  });

const anakin = killSignal => {
  const registeredChildren = children;

  children = [];

  return Promise.all(registeredChildren.map(ch => killChild(ch, killSignal)));
};

Object.assign(spawn, { anakin, killChild });

module.exports = { spawn };
