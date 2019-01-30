const spreadIf = (condition, fields, alternative) => condition ? fields : (alternative || {});
const insertIf = (condition, ...elements) => condition ? elements : [];
const insertIfValue = (...elements) => elements[0] ? elements : [];
const isProd = process.env.NODE_ENV === 'production';
const isDev = process.env.NODE_ENV === 'development' || !process.env.NODE_ENV;

module.exports = {
  spreadIf,
  insertIf,
  insertIfValue,
  isProd,
  isDev,
};
