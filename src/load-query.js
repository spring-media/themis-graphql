const util = require('util');
const fs = require('fs');
const path = require('path');
const readFile = util.promisify(fs.readFile);

async function loadFile (filePath, imports = []) {
  const { dir } = path.parse(filePath);
  const source = await readFile(filePath, 'utf-8');
  const allLines = source.split(/\r\n|\r|\n/);

  const result = allLines.reduce((prev, next) => {
    if (next[0] !== '#') {
      prev.lines.push(next);
      return prev;
    }

    const commentParts = next.slice(1).split(' ');

    if (!commentParts.includes('import')) {
      prev.lines.push(next);
      return prev;
    }

    const filePathMatch = commentParts[1].match(/^[\"\'](.+)[\"\']/);

    if (!filePathMatch.length) {
      throw new Error('#import statement must specify a quoted file path');
    }

    if (!prev.imports.includes(filePathMatch[1])) {
      prev.imports.push(filePathMatch[1]);
      prev.newImports.push(filePathMatch[1]);
    }
    return prev;
  }, { lines: [], imports, newImports: [] });

  for (const importPath of result.newImports) {
    const importResult = await loadFile(path.resolve(dir, importPath), result.imports);

    result.lines = importResult.lines.concat(result.lines);
  }

  return result;
}

async function loadFileQuery (filePath) {
  const result = await loadFile(filePath);

  return result.lines.join('\n');
}

module.exports = {
  loadFileQuery,
};
