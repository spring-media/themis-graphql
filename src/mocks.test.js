const { initServer } = require('./server');
const request = require('supertest');

describe.skip('Server', () => {
  let server = null;

  beforeAll.nock(async () => {
    server = await initServer();
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

    };

    expect(res.body).toMatchObject(expected);
  });
});
