---
id: module
title: Module
sidebar_label: Module
---

Modules can be either local Type Definitions (`typeDefs`) and resolvers, or a remote schema. Both can be freely combined and stitched together.

A module can expose the following values:
- name
- typeDefs
- resolvers
- extendTypes
- extendResolvers
- mocks
- mount
- transforms
- context
- dependencies
- onStartup
- onShutdown

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

## Schema Delegation
The schemas from all modules are made available in the resolver `context` as the reserved attribute `schemas`, which is a map with the module name as a key and the executable schema as a value.

Assume you have two modules, `article` and `teaser`, then you can access the teaser schema in an article resolver for [schema delegation](https://www.apollographql.com/docs/graphql-tools/schema-delegation.html#delegateToSchema) like so:
```js
(parent, args, ctx) => {
  // ctx.schemas['teaser']
}
```

## Transforms
Both a local and a remote module can export `transforms`, which will be applied after creating an executable schema. Read more about it in the [Transforms docs](./transforms).

## Context
The `context` can be either a function or an array of functions, which will be called in a request/response query cycle. The function may return an object to be merged with the remaining context. Context functions will be called in the order the modules are loaded. Context functions from the configuration file are called before all others. If different context functions try to expose the same key on the context, they may override each other.

A `context` function gets an object with the `req` and `res` of the query. When using _Subscriptions_, the object will contain the `connection` key.


## Lifecycle Hooks
Lifecycle hooks allow to execute something `onStartup`, just before the server will be mounted at the given port and `onShutdown`, after a kill signal has been received (SIGTERM|SIGNINT).