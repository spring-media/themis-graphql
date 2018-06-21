/* global jasmine */
const { upgradeJasmine } = require('./jest-nock');

upgradeJasmine(jasmine, global);
