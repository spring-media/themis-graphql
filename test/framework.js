/**
 * This setup allows manual recording and replaying of http(s) requests.
 * How to:
 * - add `nockRecord()` before a test case you want to record requests for
 * - add `nockSave(__dirname + '/__nocks__/somefilename.nock.json')`,
 *   after all requests to be recorded are done
 * - Replace `nockRecord` with `nockLoad(__dirname + '/__nocks__/somefilename.nock.json')`,
 *   (notice the `nockLoad`) finally remove `nockSave(...)`
 *
 * Note: This concept can be refined as a jest extension (jasmine plugin),
 * to behave more like snapshot tests for recording/refreshing convenience.
 */
const nock = require('nock');
const fs = require('fs');

const forceJSONPath = path => /\.json$/i.test(path) ? path : `${path}.json`;

global.nockRecord = function () {
  nock.recorder.rec({
    /* eslint-disable camelcase */
    dont_print: true,
    output_objects: true,
    /* eslint-enable camelcase */
  });
};

global.nockSave = function (to) {
  const recording = nock.recorder.play();

  const toPath = forceJSONPath(to);

  fs.writeFileSync(toPath, JSON.stringify(recording, null, 2));
};

global.nockLoad = function (from) {
  const defs = nock.loadDefs(forceJSONPath(from));

  nock.define(defs);
};
