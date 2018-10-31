const nock = require('nock');
const crypto = require('crypto');
const mkdirp = require('mkdirp');
const fs = require('fs');
const path = require('path');

const nockMiddleware = ({ nockPath }) => (req, res, next) => {
  nock.recorder.rec({
    /* eslint-disable camelcase */
    dont_print: true,
    output_objects: true,
    /* eslint-enable camelcase */
  });

  res.on('finish', () => {
    const recording = nock.recorder.play();

    if (recording.length === 0) {
      nock.cleanAll();
      nock.restore();
      return;
    }

    const fileName = crypto.createHash('md5').update(JSON.stringify(req.body)).digest('hex');
    const nockFileName = `${fileName}.json`;
    const nockFilePath = path.join(nockPath, nockFileName);

    if (!fs.existsSync(nockPath)) {
      mkdirp.sync(nockPath);
    }
    fs.writeFileSync(nockFilePath, JSON.stringify(recording, null, 2));

    nock.recorder.clear();
    nock.cleanAll();
    nock.restore();
  });

  next();
};

const replayNocks = ({ nockPath }) => {
  const dirFiles = fs.readdirSync(nockPath);
  const files = dirFiles.filter(file => (file.match(/\.json$/)));

  if (!nock.isActive()) {
    nock.activate();
  }

  files.forEach(file => {
    const scopes = nock.load(path.join(nockPath, file));

    scopes.forEach(scope => scope.persist());
  });

  nock.disableNetConnect();
};

module.exports = {
  nockMiddleware,
  replayNocks,
};
