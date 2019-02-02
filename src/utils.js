const spreadIf = (condition, fields, alternative) => condition ? fields : (alternative || {});
const insertIf = (condition, ...elements) => condition ? elements : [];
const insertIfValue = (...elements) => typeof elements[0] !== 'undefined' ? elements : [];
const insertFlatIfValue = elements => typeof elements !== 'undefined' &&
  typeof elements[0] !== 'undefined' ? elements : [];
const isProd = process.env.NODE_ENV === 'production';
const isDev = process.env.NODE_ENV === 'development' || !process.env.NODE_ENV;

module.exports = {
  spreadIf,
  insertIf,
  insertIfValue,
  insertFlatIfValue,
  isProd,
  isDev,
};
