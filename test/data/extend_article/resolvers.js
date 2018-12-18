const fetchOwn = require('./fetch-own');

module.exports = {
  Query: {
    own: fetchOwn,
  },
};
