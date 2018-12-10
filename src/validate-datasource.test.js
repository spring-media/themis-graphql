const { initServer } = require('./server');
const path = require('path');

describe('Validation', () => {
  it('throws for datasources without a name', done => {
    initServer({
      datasourcePaths: [
        path.resolve(__dirname, '../test/data/noname'),
      ],
    })
    .catch(e => {
      expect(e).toBeInstanceOf(Error);
      done();
    });
  });
});
