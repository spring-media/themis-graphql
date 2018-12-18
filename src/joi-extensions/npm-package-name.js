const isValidPackageName = require('validate-npm-package-name');

module.exports = joi => ({
  base: joi.string(),
  name: 'string',
  language: {
      packageName: 'needs to be a valid npm package name',
  },
  rules: [
      {
          name: 'packageName',
          validate (params, value, state, options) {
            const { validForNewPackages } = isValidPackageName(value);

            if (!validForNewPackages) {
                return this.createError('string.packageName', { v: value }, state, options);
            }
            return value;
          },
      },
  ],
});
