const jestCLI = require('jest');
const path = require('path');

const runTests = () => {
  const argv = process.argv
    .filter(arg => ![ '-t', '--test', '--record' ].includes(arg))
    .concat([
      '--setupTestFrameworkScriptFile', path.resolve(__dirname, '../test/framework.js'),
      './',
    ]);

  jestCLI.run(argv);
};

module.exports = {
  runTests,
};
