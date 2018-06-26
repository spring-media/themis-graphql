/**
 * We use GrAMPS datasources as an inspiration
 * https://gramps.js.org/data-source/data-source-overview/
 */

const typeDefs = require('./schema');
const resolvers = require('./resolvers');
const mocks = require('./mocks');

module.exports = {
  typeDefs,
  resolvers,
  mocks,
};