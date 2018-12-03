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

  it('Allows to set the graphql api path', async () => {
    await spawnCLI([
      '-c',
      './test/data/config_file/datasource.config.js',
      '--graphQLPath',
      '/another/api/path',
    ], {
      PORT: 54326,
    });

    const query = {
      query: `query {
        article(input: { id: "some" }) {
          creationDate
        }
      }`,
    };

    const res1 = await request('http://127.0.0.1:54326')
      .post('/another/api/path')
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
      PORT: 54327,
      cwd: path.resolve(__dirname, 'test/data/config_file'),
    });

    const query = {
      query: `query {
        article(input: { id: "some" }) {
          creationDate
        }
      }`,
    };

    const res1 = await request('http://127.0.0.1:54327')
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

describe('Middleware', () => {
  afterEach(async () => {
    await spawn.anakin();
  });

  it('can use middleware to set additional headers', async () => {
    await spawnCLI([
      '-c',
      './test/data/config_file/headers.config.js',
    ], {
      PORT: 54328,
    });

    const query = {
      query: `query {
        article(input: { id: "some" }) {
          creationDate
        }
      }`,
    };

    const res1 = await request('http://127.0.0.1:54328')
      .post('/api/graphql')
      .send(query)
      .expect(200);

    expect(res1.headers).toEqual(expect.objectContaining({
      'x-extra-header': 'header from middleware',
    }));
  });

  it('can use middleware to set additional context', async () => {
    await spawnCLI([
      '-c',
      './test/data/config_file/context.config.js',
    ], {
      PORT: 54329,
    });

    const query = {
      query: `query {
        user {
          id
        }
      }`,
    };

    const res1 = await request('http://127.0.0.1:54329')
      .post('/api/graphql')
      .send(query)
      .expect(200);

    expect(res1.body).toEqual({
      data: {
        user: {
          id: 'f14abf12b4ff1bfa',
        },
      },
    });
  });
});
