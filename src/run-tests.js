const jestCLI = require('jest');
const path = require('path');

const runTests = () => {
  // Remove arguments before --test to not collide with jest args
  const testArgIndex = process.argv.findIndex(arg => /-t$|--test$/.test(arg));
  const argv = [
    ...process.argv.slice(0, 2),
    `--setupTestFrameworkScriptFile=${path.resolve(
      __dirname,
      '../test/framework.js'
    )}`,
    ...process.argv.slice(testArgIndex, process.argv.length),
    ...(/^--/.test(process.argv.slice(-1)[0]) ? ['./'] : []),
  ].filter(arg => ![ '-t', '--test', '--record' ].includes(arg));

  jestCLI.run(argv);
};

module.exports = {
  runTests,
};
