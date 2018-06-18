const { initServer } = require('./server');
const request = require('supertest');

describe('Server', () => {
  let server = null;

  beforeAll(async () => {
    // nockRecord();
    nockLoad(__dirname + '/__nocks__/lean-remote-introspection-schema.nock');

    server = await initServer();
    // nockSave(__dirname + '/__nocks__/lean-remote-introspection-schema.nock');
  });

  it('populates the schema with remote data', async () => {
    // nockRecord(__dirname + '/__nocks__/server.test.js.nock');
    // request(server)
    //   .post('/graphql')
  });
});
