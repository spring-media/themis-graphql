module.exports = {
  datasources: [
    './test/data/config_file/context',
  ],
  middleware: {
    before: [
      (req, _, next) => {
        req.user = {
          id: 'f14abf12b4ff1bfa',
        };
        next();
      },
    ],
  },
  context: ({ req: { user } }) => ({
    user,
  }),
};
