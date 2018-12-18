const asyncMiddleware = async (req, res, next) => {
  await new Promise(resolve => setTimeout(resolve, 20));
  next();
};

module.exports = {
  datasources: [
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
