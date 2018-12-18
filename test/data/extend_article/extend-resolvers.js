const fetchOwn = require('./fetch-own.js');

module.exports = {
  Article: {
    additionalField () {
      return 'extended type';
    },
    sharedType: fetchOwn,
  },
};
