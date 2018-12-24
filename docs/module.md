---
id: module
title: Module
sidebar_label: Module
---

Modules can be either local Type Definitions (`typeDefs`) and resolvers, or a remote schema. Both can be freely combined and stitched together.

## Naming
A GraphQL module needs a unique name, compatible with NPM naming restrictions, as a module can also be published as an NPM package. 

## Structure
A module can be a single file, a folder with an `index.js`, or an NPM module. Themis is aware of the [`package.json`](https://docs.npmjs.com/files/package.json) file, which can specify the entry point of the module. Themis will use the name of the package for the module. A common structure for a module is:
```text
module-root
├── index.js
├── resolvers.js
└── schema.js
```
You can see how a basic module looks like in the [Getting Started guide](./getting-started).

## Dependencies
A module can express the dependency on another GraphQL module by exporting a list with module names.

Example with dependencies:
```js
module.exports = {
  name: 'custom-article',
  typeDefs,
  resolvers,
  dependencies: [
    'user',
    'remote-article',
  ]
}
```

GrapqhQL module dependencies can be specified in a `package.json` as well with the `gqlDependencies` key as a list of module names. 

## Exposed Schemas
The schemas from all modules are made available in the resolver `context` as the reserved attribute `schemas`, which is a map with the module name as a key and the executable schema as a value.

Assume you have two modules, `article` and `teaser`, then you can access the teaser schema in an article resolver for [schema delegation](https://www.apollographql.com/docs/graphql-tools/schema-delegation.html#delegateToSchema) like so:
```js
(parent, args, ctx) => {
  // ctx.schemas['teaser']
}
```

