const { loadFileQuery } = require('./load-query');
const path = require('path');

describe('load-query', () => {
  it('handles a file with recursive #import statements', async () => {
    const result = await loadFileQuery(path.resolve(__dirname, '../test/data/queries/start.gql'));

    expect(result).toMatchSnapshot();
  });
});
