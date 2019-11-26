const jestCLI = require('jest');
const path = require('path');

const runTests = () => {
  const testArgIndex = process.argv.findIndex(arg => /-t$|--test$/.test(arg));
  const argv = [
    ...process.argv.slice(0, 2),
    `--setupTestFrameworkScriptFile=${path.resolve(
      __dirname,
      '../test/framework.js'
    )}`,
    // Remove arguments before --test to not collide with jest args
    ...process.argv.slice(testArgIndex, process.argv.length),
    // If no pattern or filename is specified (last argument is an option starting with `-`) use `./`
    ...(/^-/.test(process.argv.slice(-1)[0]) ? ['./'] : []),
  ].filter(arg => ![ '-t', '--test', '-r', '--record' ].includes(arg));

  jestCLI.run(argv);
};

module.exports = {
  runTests,
};
