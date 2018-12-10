const spreadIf = (condition, fields) => condition ? fields : {};
const insertIf = (condition, ...elements) => condition ? elements : [];
const insertIfValue = (...elements) => elements[0] ? elements : [];

module.exports = {
  spreadIf,
  insertIf,
  insertIfValue,
};
