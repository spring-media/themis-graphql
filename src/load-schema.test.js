jest.mock('./logger');
const logger = require('./logger');
const { initServer } = require('./server');
const request = require('supertest');
const path = require('path');

describe('Schema', () => {
  describe('Extended Types', () => {
    it('allows to extend existing types of another module with additional resolvers', async () => {
      const { server } = await initServer({
        modulePaths: [
          path.resolve(__dirname, '../test/data/cms_article'),
          path.resolve(__dirname, '../test/data/extend_article'),
        ],
      });

      const res = await request(server)
        .post('/api/graphql')
        .send({
          query: `query fetchArticle($input: ArticleInput) {
            article(input: $input) {
              state
              creationDate
              headlinePlain
              additionalField
              sharedType {
                someField
              }
            }
            own {
              someField
            }
          }`,
          variables: {
            input: {
              id: '5b5f24ca91a89200015a2e89',
            },
          },
        })
        .expect(200);

      server.close();

      const expected = {
        data: {
          article: expect.objectContaining({
            headlinePlain: 'remote headline',
            state: expect.any(String),
            creationDate: expect.any(String),
            additionalField: 'extended type',
            sharedType: {
              someField: 'own type',
            },
          }),
          own: {
            someField: 'own type',
          },
        },
      };

      expect(res.body).toMatchObject(expect.objectContaining(expected));
    });

    it.skip('extends resolvers correctly when extending local type (author.books)', async () => {
      const { server } = await initServer({
        modulePaths: [
          path.resolve(__dirname, '../test/data/book'),
          path.resolve(__dirname, '../test/data/author'),
        ],
      });

      const res = await request(server)
        .post('/api/graphql')
        .send({
          query: `{
            author {
              id
              name
              books {
                id
                title
              }
            }
          }`,
        })
        .expect(200);

      server.close();

      const expected = {
        data: {
          author: {
            id: 1,
            name: 'One Author',
            books: [
              {
                id: 1,
                title: 'One Book',
              },
            ],
          },
        },
      };

      expect(res.body).toMatchObject(expect.objectContaining(expected));
    });

    it('does not matter which order module paths are specified when depending on another', async () => {
      const { server } = await initServer({
        modulePaths: [
          path.resolve(__dirname, '../test/data/extend_article'),
          path.resolve(__dirname, '../test/data/cms_article'),
        ],
      });

      const res = await request(server)
        .post('/api/graphql')
        .send({
          query: `query fetchArticle($input: ArticleInput) {
            article(input: $input) {
              state
              creationDate
              headlinePlain
              additionalField
              sharedType {
                someField
              }
            }
            own {
              someField
            }
          }`,
          variables: {
            input: {
              id: '5b5f24ca91a89200015a2e89',
            },
          },
        })
        .expect(200);

      server.close();

      const expected = {
        data: {
          article: expect.objectContaining({
            headlinePlain: 'remote headline',
            state: expect.any(String),
            creationDate: expect.any(String),
            additionalField: 'extended type',
            sharedType: {
              someField: 'own type',
            },
          }),
          own: {
            someField: 'own type',
          },
        },
      };

      expect(res.body).toMatchObject(expect.objectContaining(expected));
    });

    it('allows to extend extension types', async () => {
      const { server } = await initServer({
        modulePaths: [
          path.resolve(__dirname, '../test/data/cms_article'),
          path.resolve(__dirname, '../test/data/extend_article'),
          path.resolve(__dirname, '../test/data/extend_further'),
        ],
      });

      const res = await request(server)
        .post('/api/graphql')
        .send({
          query: `query fetchArticle($input: ArticleInput) {
            article(input: $input) {
              state
              creationDate
              headlinePlain
              additionalField
              sharedType {
                someField
                further
              }
            }
          }`,
          variables: {
            input: {
              id: '5b5f24ca91a89200015a2e89',
            },
          },
        })
        .expect(200);

      server.close();

      const expected = {
        data: {
          article: expect.objectContaining({
            headlinePlain: 'remote headline',
            state: expect.any(String),
            creationDate: expect.any(String),
            additionalField: 'extended type',
            sharedType: {
              someField: 'own type',
              further: 'further field',
            },
          }),
        },
      };

      expect(res.body).toMatchObject(expect.objectContaining(expected));
    });

    it('throws when schema to extend is missing', done => {
      initServer({
        modulePaths: [
          path.resolve(__dirname, '../test/data/extend_article'),
        ],
      })
      .catch(e => {
        expect(e).toBeInstanceOf(Error);
        expect(e.message).toMatch(/Cannot extend type "Article" because it does not exist in the existing schema/);
        done();
      });
    });
  });

  describe('Dependencies', () => {
    it('throws for missing dependency module', done => {
      initServer({
        modulePaths: [
          path.resolve(__dirname, '../test/data/missing_dependency'),
        ],
      })
      .catch(e => {
        expect(e).toBeInstanceOf(Error);
        expect(e.message).toMatch(/Cannot load module "article", because missing dependency "cms-article"/);
        done();
      });
    });

    it('throws an error if modules have the same name', done => {
      initServer({
        modulePaths: [
          path.resolve(__dirname, '../test/data/hook1'),
          path.resolve(__dirname, '../test/data/simple'),
        ],
      })
      .catch(e => {
        expect(e).toBeInstanceOf(Error);
        expect(e.message).toMatch(/Module names need to be unique, found duplicates of "simple"/);
        done();
      });
    });
  });

  describe('Import Interfaces', () => {
    beforeEach(() => {
      logger.warn.mockReset();
    });

    it('can import interfaces from other modules', async () => {
      const { server } = await initServer({
        modulePaths: [
          path.resolve(__dirname, '../test/data/base'),
          path.resolve(__dirname, '../test/data/use-base'),
        ],
      });

      const res = await request(server)
        .post('/api/graphql')
        .send({
          query: `query {
            article {
              id
              title
            }
          }`,
        })
        .expect(200);

      server.close();

      const expected = {
        data: {
          article: expect.objectContaining({
            id: 'one',
            title: 'Extended Base Article',
          }),
        },
      };

      expect(res.body).toMatchObject(expect.objectContaining(expected));
    });

    it('does not cause type conflict for imported interfaces', async () => {
      await initServer({
        modulePaths: [
          path.resolve(__dirname, '../test/data/base'),
          path.resolve(__dirname, '../test/data/use-base'),
        ],
      });

      expect(logger.warn).not.toHaveBeenCalled();
    });

    it('does not cause type conflict for imported interfaces (changed order)', async () => {
      await initServer({
        modulePaths: [
          path.resolve(__dirname, '../test/data/use-base'),
          path.resolve(__dirname, '../test/data/base'),
        ],
      });

      expect(logger.warn).not.toHaveBeenCalled();
    });

    it('only merges interfaces from imported modules', async () => {
      const { server } = await initServer({
        modulePaths: [
          path.resolve(__dirname, '../test/data/base'),
          path.resolve(__dirname, '../test/data/use-base'),
        ],
      });

      const res = await request(server)
        .post('/api/graphql')
        .send({
          query: `mutation {
            baseMutation
          }`,
        });

      server.close();

      const expected = {
        data: {
          baseMutation: null,
        },
        errors: [{
          extensions: {
            code: 'INTERNAL_SERVER_ERROR',
                },
          locations: [
            {
              column: 13,
              line: 2,
            },
          ],
          message: 'Query root type must be provided.',
          path: [
            'baseMutation',
          ],
        }],
      };

      expect(res.body).toMatchObject(expect.objectContaining(expected));
    });
  });
});
