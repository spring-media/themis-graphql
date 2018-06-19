/**
 * We use GrAMPS datasources as an inspiration
 * https://gramps.js.org/data-source/data-source-overview/
 */

const schema = require('./schema');
const resolvers = require('./resolvers');

module.exports = {
  typeDefs: schema,
  resolvers,
};
