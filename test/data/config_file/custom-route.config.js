module.exports = {
  datasources: [
    './test/data/cms_article',
  ],
  middleware: {
    before: [
      [ '/custom/path', (req, res) => {
        res.json({
          custom: 'endpoint',
        });
      } ],
    ],
  },
};
