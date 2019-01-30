const asyncMiddleware = async (req, res, next) => {
  await new Promise(resolve => setTimeout(resolve, 20));
  next();
};

module.exports = {
  modules: [
    './test/data/cms_article',
  ],
  middleware: {
    before: [
      asyncMiddleware,
      [
        asyncMiddleware,
        asyncMiddleware,
      ],
    ],
  },
};
