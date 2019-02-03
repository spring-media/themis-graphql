module.exports = {
  context: ({ req }) => ({
    name: req.headers['x-name'],
  }),
};
