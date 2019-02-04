const { initServer } = require('./server');
const request = require('supertest');
const path = require('path');

describe('Examples', () => {
  describe('extend-types', () => {
    it('can resolve recursively', async () => {
      const { server } = await initServer({
        modulePaths: [
          path.resolve(__dirname, '../examples/extend-types/book'),
          path.resolve(__dirname, '../examples/extend-types/author'),
        ],
      });

      const res = await request(server)
        .post('/api/graphql')
        .send({
          query: `{
            author(id: 0) {
              id
              name
              books {
                id
                title
                authors {
                  id
                  name
                  books {
                    id
                    title
                  }
                }
              }
            }
          }`,
        })
        .expect(200);

        server.close();

        const expected = {
          data: {
            author: {
              books: [
                {
                  authors: [
                    {
                      books: [
                        {
                          id: 0,
                          title: 'First Title',
                        },
                        {
                          id: 2,
                          title: 'Second Title',
                        },
                      ],
                      id: 0,
                      name: 'Awesome Author',
                    },
                  ],
                  id: 0,
                  title: 'First Title',
                },
                {
                  authors: [
                    {
                      books: [
                        {
                          id: 0,
                          title: 'First Title',
                        },
                        {
                          id: 2,
                          title: 'Second Title',
                        },
                      ],
                      id: 0,
                      name: 'Awesome Author',
                    },
                  ],
                  id: 2,
                  title: 'Second Title',
                },
              ],
              id: 0,
              name: 'Awesome Author',
            },
        },
      };

      expect(res.body).toMatchObject(expect.objectContaining(expected));
    });
  });
});
