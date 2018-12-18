const spreadIf = (condition, fields, alternative) => condition ? fields : (alternative || {});
const insertIf = (condition, ...elements) => condition ? elements : [];
const insertIfValue = (...elements) => elements[0] ? elements : [];

module.exports = {
  spreadIf,
  insertIf,
  insertIfValue,
};
