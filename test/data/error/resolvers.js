module.exports = {
  Query: {
    error: () => {
      throw new Error('resolver error in datasource');
    },
  },
};
