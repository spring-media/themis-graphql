const jestCLI = require('jest');
const path = require('path');

const runTests = () => {
  // Remove arguments before --test to not collide with jest args
  const testArgIndex = process.argv.findIndex(arg => /-t|--test/.test(arg));
  const argv = [ ...process.argv.slice(0, 2), ...process.argv.slice(testArgIndex, process.argv.length) ]
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
