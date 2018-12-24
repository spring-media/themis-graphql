---
id: module
title: Module
sidebar_label: Module
---

Modules can be either local Type Definitions (`typeDefs`) and resolvers, or a remote schema. Both can be freely combined and stitched together.

## Naming
A GraphQL module needs a unique name, compatible with NPM naming restrictions, as a module can also be published as an NPM package. 

## Structure
A module can be a single file, or a folder with an `index.js`. A common structure for a module is:
```text
module-root
├── index.js
├── resolvers.js
└── schema.js
```

## Dependencies
A module can express the dependency on another GraphQL module by exporting a list with module names.

Example with dependencies:
```js
module.exports = {
  name: 'custom-article',
  typeDefs: gql`...`,
  resolvers: { ... },
  dependencies: [
    'user',
    'remote-article',
  ]
}
```

## Package.json
Themis is aware of the [`package.json`](https://docs.npmjs.com/files/package.json) file, which can specify the entry point of the module. Themis will use the name of the package for the module. GrapqhQL module dependencies can be specified there as well with the `moduleDependencies` key.
