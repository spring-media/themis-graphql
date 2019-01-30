const { initServer } = require('./server');
const path = require('path');

describe('Validation', () => {
  it('throws for modules without a name', done => {
    initServer({
      modulePaths: [
        path.resolve(__dirname, '../test/data/noname'),
      ],
    })
    .catch(e => {
      expect(e).toBeInstanceOf(Error);
      done();
    });
  });
});
