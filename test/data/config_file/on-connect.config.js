module.exports = {
  modules: [
    './test/data/config_file/subscription4',
  ],
  onConnect: () => ({
    f1: 'global',
  }),
};
