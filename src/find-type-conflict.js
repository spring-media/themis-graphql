/* eslint-disable complexity */
const { isNamedType, GraphQLObjectType } = require('graphql');

const createInfo = (left, right, type, typeName) => ({
  left: {
    schema: left[typeName].schema,
    type: left[typeName].type,
  },
  right: {
    schema: right,
    type,
  },
});

const findTypeConflict = (schemas, {
  onTypeConflict = () => {},
  ignoreTypeCheck = [],
  onFieldConflict = () => {},
  ignoreFieldCheck = [],
}) => {
  schemas.reduce((left, right) => {
    const typeMap = right.getTypeMap();

    Object.keys(typeMap)
      .filter(typeName => !/^__/.test(typeName))
      .forEach(typeName => {
        if (!isNamedType(typeMap[typeName])) {
          return;
        }

        const type = typeMap[typeName];
        const ref = { type, typeName, schema: right };

        if (left[typeName]) {
          if (!ignoreTypeCheck.includes(typeName)) {
            onTypeConflict(
              left[typeName].type,
              type,
              createInfo(left, right, type, typeName)
            );
          }

          if (type instanceof GraphQLObjectType && !ignoreFieldCheck.includes(typeName)) {
            const leftFields = left[typeName].type.getFields();
            const rightFields = type.getFields();
            const leftFieldKeys = Object.keys(leftFields);
            const rightFieldKeys = Object.keys(rightFields);

            rightFieldKeys.forEach(fieldName => {
              if (leftFieldKeys.includes(fieldName)) {
                onFieldConflict(
                  fieldName,
                  leftFields[fieldName],
                  rightFields[fieldName],
                  createInfo(left, right, type, typeName)
                );
              }
            });
          }
        }

        Object.assign(left, {
          [typeName]: ref,
        });
      });

      return left;
  }, {});
};

module.exports = {
  findTypeConflict,
};
