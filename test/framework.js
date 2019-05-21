/* global jasmine */
const { upgradeJasmine } = require('jest-nock');

jest.setTimeout(10000);
upgradeJasmine(jasmine, global);
