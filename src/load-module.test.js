jest.mock('./logger');
const logger = require('./logger');
const { initServer } = require('./server');
const { loadModule } = require('./load-module');
const path = require('path');

describe('Load Module', () => {
  it('overrides the config name with the name from package.json', async () => {
    const dsPath = path.resolve(__dirname, '../test/data/config_file/node_modules/cms-article');
    const config = await loadModule(dsPath);

    expect(config).toHaveProperty('name', 'cms-article');
  });

  it('throws an error if name is not a valid npm package name', async () => {
    const dsPath = path.resolve(__dirname, '../test/data/invalid-name');

    try {
      await loadModule(dsPath);
      throw new Error('did not throw before...');
    } catch (e) {
      expect(e.message).toEqual(expect.stringMatching(/needs to be a valid npm package name/));
    }
  });

  it('logs a warning when name is both in config an package.json', async () => {
    const { server } = await initServer({
      modulePaths: [
        path.resolve(__dirname, '../test/data/config_file/node_modules/cms-article'),
      ],
    });

    server.close();

    expect(logger.warn).toHaveBeenCalledWith(
      expect.stringMatching('Module name is both in config and package.json')
    );
  });
});
