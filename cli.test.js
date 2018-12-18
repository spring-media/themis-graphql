const request = require('supertest');
const { spawn } = require('./test/spawn');
const { spawnCLI, createClient } = require('./test/utils');
const gql = require('graphql-tag');
const path = require('path');

describe('CLI', () => {
  afterEach(async () => {
    await spawn.anakin('SIGINT');
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

  it('Exits if provided config cannot be found', done => {
    spawnCLI([
      '-c',
      './test/data/abcdefg/not-a-config.config.js',
    ], {
      PORT: 54358,
    }).catch(err => {
      expect(err).toEqual(expect.stringMatching(/Config file not found/));
      done();
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

  it('provides startup and shutdown hook from config', async done => {
    let counter = 0;

    const server = await spawnCLI([
      '-c',
      './test/data/config_file/lifecycle.config.js',
    ], {
      PORT: 54329,
      onStdOut: data => {
        const str = data.toString();

        if (str.match(/startup hoek/) || str.match(/shutdown hoek/)) {
          counter++;
        }

        if (counter === 2) {
          done();
        }
      },
    });

    setTimeout(() => spawn.killChild(server, 'SIGINT', false), 1500);
  }, 10000);

  it('provides startup and shutdown hooks from datasources', async done => {
    let counter = 0;

    const server = await spawnCLI([
      '-c',
      './test/data/config_file/lifecycle2.config.js',
    ], {
      PORT: 54329,
      onStdOut: data => {
        const str = data.toString();
        const match1 = str.match(/startup hoek/ig);
        const match2 = str.match(/shutdown hoek/ig);

        counter += (match1 || []).length + (match2 || []).length;

        if (counter === 6) {
          done();
        }
      },
    });

    setTimeout(() => spawn.killChild(server, 'SIGINT', false), 1500);
  }, 10000);
});

describe('Subscriptions', () => {
  afterEach(async () => {
    await spawn.anakin();
  });

  it('sets a custom subscriptions path with --subscriptionsPath', async done => {
    await spawnCLI([
      path.resolve(__dirname, 'test/data/subscription'),
      '--subscriptionsPath',
      '/custom/ws/path',
    ], {
      PORT: 54301,
    });

    const client = createClient({ port: 54301, subPath: '/custom/ws/path' });

    const subscription = client.subscribe({
      query: gql`subscription {
        wallet {
          id
          value
        }
      }`,
    }).subscribe({
      next: res => {
        subscription.unsubscribe();
        expect(res).toMatchObject(expect.objectContaining({
          data: {
            wallet: {
              id: 'baf86a8bf86af8',
              value: expect.any(Number),
              __typename: 'Wallet',
            },
          },
        }));
        done();
      },
    });
  });

  it('disables subscriptions with the --no-subscriptions flag', async done => {
    await spawnCLI([
      path.resolve(__dirname, 'test/data/subscription'),
      '--no-subscriptions',
    ], {
      PORT: 54301,
    });

    const client = createClient({
      port: 54301,
      errorHandler: () => {
        done();
      },
    });

    const subscription = client.subscribe({
      query: gql`subscription {
        wallet {
          id
          value
        }
      }`,
      errorPolicy: 'all',
    }).subscribe(() => {
      subscription.unsubscribe();
      done(new Error('We should not get here'));
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

  it('can use async middlewares', async () => {
    await spawnCLI([
      '-c',
      './test/data/config_file/async-middleware.config.js',
    ], {
      PORT: 53328,
    });

    const query = {
      query: `query {
        article(input: { id: "some" }) {
          creationDate
        }
      }`,
    };

    await request('http://127.0.0.1:53328')
      .post('/api/graphql')
      .send(query)
      .expect(200);
  });

  it('can use middleware after apollo server', async () => {
    await spawnCLI([
      '-c',
      './test/data/config_file/after.config.js',
    ], {
      PORT: 54318,
    });

    const res1 = await request('http://127.0.0.1:54318')
      .get('/other/path')
      .expect(404);

    expect(res1.headers).toEqual(expect.objectContaining({
      'x-after-header': 'after header from middleware',
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

  it('can use middleware as stack of middlewares with custom route', async () => {
    await spawnCLI([
      '-c',
      './test/data/config_file/custom-route.config.js',
    ], {
      PORT: 54328,
    });

    const res1 = await request('http://127.0.0.1:54328')
      .post('/custom/path')
      .expect(200);

    expect(res1.body).toEqual(expect.objectContaining({
      custom: 'endpoint',
    }));
  });
});
