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
});
