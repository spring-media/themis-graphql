module.exports = {
  modules: [
    './test/data/cms_article',
  ],
  middleware: {
    before: [
      (req, res, next) => {
        res.header('x-extra-header', 'header from middleware');
        next();
      },
    ],
  },
};
