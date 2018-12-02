const request = require('supertest');
const { spawn } = require('./test/spawn');
const { spawnCLI } = require('./test/utils');
const path = require('path');

describe('CLI', () => {
  afterEach(async () => {
    await spawn.anakin();
  });

  it('takes a path to a configuration file', async () => {
    await spawnCLI([
      '-c',
      './test/data/config_file/datasource.config.js',
    ], {
      PORT: 54325,
    });

    const query = {
      query: `query {
        article(input: { id: "some" }) {
          creationDate
        }
      }`,
    };

    const res1 = await request('http://127.0.0.1:54325')
      .post('/api/graphql')
      .send(query)
      .expect(200);

    expect(res1.body).toEqual({
      data: {
        article: {
          creationDate: '2018-06-24T00:34:45.253Z',
        },
      },
    });
  });

  it('resolves datasources in node_modules', async () => {
    await spawnCLI([
      '-c',
      'modules.config.js',
    ], {
      indexPath: __dirname,
      PORT: 54325,
      cwd: path.resolve(__dirname, 'test/data/config_file'),
    });

    const query = {
      query: `query {
        article(input: { id: "some" }) {
          creationDate
        }
      }`,
    };

    const res1 = await request('http://127.0.0.1:54325')
      .post('/api/graphql')
      .send(query)
      .expect(200);

    expect(res1.body).toEqual({
      data: {
        article: {
          creationDate: '2018-06-24T00:34:45.253Z',
        },
      },
    });
  });
});
