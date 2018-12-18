module.exports = {
  datasources: [
    './test/data/cms_article',
  ],
  middleware: {
    after: [
      (req, res, next) => {
        res.header('x-after-header', 'after header from middleware');
        next();
      },
    ],
  },
};
