const spreadIf = (condition, fields) => condition ? fields : {};
const insertIf = (condition, ...elements) => condition ? elements : [];

module.exports = {
  spreadIf,
  insertIf,
};
