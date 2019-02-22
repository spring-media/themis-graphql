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

    it('extends resolvers correctly', async () => {
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

    it('extends resolvers correctly when extending local type (author.books)', async () => {
      const { server } = await initServer({
        modulePaths: [
          path.resolve(__dirname, '../test/data/book'),
          path.resolve(__dirname, '../test/data/author-local-extend'),
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

    it('can use local resolvers for type used in extension (article.teaser)', async () => {
      const { server } = await initServer({
        modulePaths: [
          path.resolve(__dirname, '../test/data/cms_article'),
          path.resolve(__dirname, '../test/data/teaser'),
        ],
      });

      const res = await request(server)
        .post('/api/graphql')
        .send({
          query: `{
            article(input: { id: "one" }) {
              teaser(identifier: "landscape") {
                kicker
              }
            }
          }`,
        })
        .expect(200);

      server.close();

      const expected = {
        data: {
          article: {
            teaser: {
              kicker: 'Base Kicker',
            },
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

    it('handles references in dep. tree to same modules in loading order', async () => {
      const { server } = await initServer({
        modulePaths: [
          path.resolve(__dirname, '../test/data/common'),
          path.resolve(__dirname, '../test/data/base3'),
          path.resolve(__dirname, '../test/data/use-base2'),
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
  });

  describe('Import Types', () => {
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

    it('can import types with resolvers from other modules', async () => {
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
            imported {
              id
              title
            }
          }`,
        })
        .expect(200);

      server.close();

      const expected = {
        data: {
          imported: expect.objectContaining({
            id: 'imported1',
            title: 'Imported Resolver',
          }),
        },
      };

      expect(res.body).toMatchObject(expect.objectContaining(expected));
    });

    it('can import scalars with resolvers from other modules', async () => {
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
            custom
          }`,
        })
        .expect(200);

      server.close();

      const expected = {
        data: {
          custom: 'custom type value addendum',
        },
      };

      expect(res.body).toMatchObject(expect.objectContaining(expected));
    });

    it('can create unions from imported types', async () => {
      const { server } = await initServer({
        modulePaths: [
          path.resolve(__dirname, '../test/data/base'),
          path.resolve(__dirname, '../test/data/base2'),
          path.resolve(__dirname, '../test/data/union-from-base'),
        ],
      });

      const res = await request(server)
        .post('/api/graphql')
        .send({
          query: `query {
            unified {
              ...on BaseType {
                id
                title
              }
              ...on AnotherBaseType {
                id
                name
              }
            }
          }`,
        });

      server.close();

      const expected = {
        data: {
          unified: {
            id: 'one',
            title: 'Imported Resolver',
          },
        },
      };

      expect(res.body).toMatchObject(expect.objectContaining(expected));
    });

    it('does not cause type conflict for imported types', async () => {
      await initServer({
        modulePaths: [
          path.resolve(__dirname, '../test/data/base'),
          path.resolve(__dirname, '../test/data/use-base'),
        ],
      });

      expect(logger.warn).not.toHaveBeenCalled();
    });

    it('does not cause type conflict for imported types (changed order)', async () => {
      await initServer({
        modulePaths: [
          path.resolve(__dirname, '../test/data/use-base'),
          path.resolve(__dirname, '../test/data/base'),
        ],
      });

      expect(logger.warn).not.toHaveBeenCalled();
    });

    it('only merges selected types from imported modules', async () => {
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
