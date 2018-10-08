const { initServer } = require('./server');
const request = require('supertest');
const path = require('path');

describe('Server', () => {
  let server = null;

  beforeAll.nock(async () => {
    server = await initServer({
      mockMode: true,
      datasourcePaths: [
        path.resolve(__dirname, '../test/data/article'),
        path.resolve(__dirname, '../test/data/cms'),
      ],
    });
  });

  afterAll(() => {
    server.close();
  });

  it.nock('populates the schema with mock data', async () => {
    const res = await request(server)
      .post('/api/graphql')
      .send({
        query: `query fetchArticle($input: ArticleInput) { 
          article(input: $input) { 
            state
            creationDate
            headlinePlain
          }
        }`,
        variables: {
          input: {
            id: '5afb22871a6fcc00015ec57d',
          },
        },
      })
      .expect(200);

    const expected = {
      data: {
        article: {
          headlinePlain: 'mocked headline',
          creationDate: expect.any(String),
          state: expect.any(String),
        },
      },
    };

    expect(res.body).toMatchObject(expect.objectContaining(expected));
  }, {
    enableNetConnect: ['127.0.0.1'],
  });
});
