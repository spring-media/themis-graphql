const { initServer } = require('./server');
const request = require('supertest');
const path = require('path');

describe('Server', () => {
  let server = null;

  beforeAll(async () => {
    // nockRecord();
    nockLoad(path.resolve(__dirname, '__nocks__/lean-remote-introspection-schema.nock'));

    server = await initServer();
    // nockSave(__dirname + '/__nocks__/lean-remote-introspection-schema.nock');
  });

  afterAll(() => {
    server.close();
  });

  it('populates the schema with remote data', async () => {
    // nockRecord();
    nockLoad(path.resolve(__dirname, '__nocks__/full-article.nock'));
    const res = await request(server)
      .post('/api/graphql')
      .send({
        query: `query fetchArticle($input: ArticleInput) { 
          article(input: $input) { 
            documentType
            state
            creationDate
            publicationDate
            firstPublicationDate
            modificationDate
            editors
            adState
            noIndexNoFollow
            kicker
            headline {
              data
            }
            headlinePlain
            subcell {
              data
            }
            subcellPlain
            text {
              data
            }
            lead {
              ... on ImageElement {
                renderUrl
                caption {
                  data
                }
                width
                height
                aspectRatio
                source
              }
            }
            title
            metaDescription
            canonicalLink
            taxonomyNodes {
              id
              name
            }
            author
            displayDate
            id
            pageTitle
            premium
            conversionText {
              data
            }
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
          headline: {
            data: {
              blocks: [{
                data: {},
                depth: 0,
                entityRanges: [],
                inlineStyleRanges: [],
                key: '16clb',
                text: 'Polizeihund für immer dienstunfähig?',
                type: 'unstyled' }],
              entityMap: {},
            },
          },
          kicker: 'Bei GSG 9-Einsatz angeschossen',
        },
      },
    };

    expect(res.body).toMatchObject(expected);

    // nockSave(__dirname + '/__nocks__/full-article.nock');
  });
});
