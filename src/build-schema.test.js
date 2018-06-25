const path = require('path');
const { buildSchema } = require('./build-schema');

describe('Build Schema', () => {
  it.nock('stores the remote schema into local dist folder for production use', async () => {
    const datasourcePath = path.resolve(__dirname, '../test/data/cms');

    await buildSchema({
      datasourcePaths: [datasourcePath],
    });

    const builtSchema = require(path.join(datasourcePath, 'dist/_remote_schema.json'));

    const expected = {
      data: {
        __schema: {
          directives: expect.any(Array),
          mutationType: expect.any(Object),
          queryType: expect.any(Object),
          subscriptionType: expect.any(Object),
          types: expect.any(Array),
        },
      },
    };

    expect(builtSchema).toMatchObject(expect.objectContaining(expected));
  });
});
