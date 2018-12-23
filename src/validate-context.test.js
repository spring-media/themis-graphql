const { initServer } = require('./server');
const path = require('path');

describe('Validate Context', () => {
  it('throws for modules with colliding context', done => {
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
