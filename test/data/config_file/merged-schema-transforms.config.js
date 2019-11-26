const { FilterTypes } = require('graphql-tools');

module.exports = {
    modules: [
        './test/data/cms_article',
        './test/data/book',
    ],
    mergedSchemaTransforms: [
        new FilterTypes(type => type.name !== 'Book'),
    ],
  };
