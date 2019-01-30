---
id: transforms
title: Transforms
sidebar_label: Transforms
---

[Transforms](https://www.apollographql.com/docs/graphql-tools/schema-transforms) can be applied to both local and remote modules. Transforms will be applied after creating an [executable schema](https://www.apollographql.com/docs/graphql-tools/generate-schema.html). Transforms can be used to mutate the schema of a module, e.g. to only mount the query operations of a remote schema.

## Built-in Transforms
Themis exposes some transforms that you can choose to use.

Example:
```js
const { SelectionFilter } = require('themis-graphql').transforms;
```

### SelectionFilter
This transformation allows you to manipulate the selection of a query, e.g. to remove a subselection for a specific field.

```js
new SelectionFilter(['article', 'content'], () => {
  return null;
})
```

### DropFieldFilter
Allows to drop a specific field from a query completely.

```js
new DropFieldFilter(['article', 'config'])
```