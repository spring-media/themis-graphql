---
id: getting-started
title: Getting Started
sidebar_label: Getting Started
---

Themis is a CLI Layer on top of Apollo Server and GraphQL Tools to encapsulate subsets of a Graph into modules. Modules can also be NPM packages.

## Creating a GraphQL Module
A `module` in its most basic form consists of a GraphQL schema (Type Definition) and resolvers. If you don't know what a schema and resolvers are, checkout [graphql.org/learn](https://graphql.org/learn/).

Create a file called `hello.js` with the following contents:
```js
const { gql } = require('themis-graphql');

module.exports = {
  name: 'hello',
  typeDefs: gql`
    type Query {
      hello: String
    }
  `,
  resolvers: {
    Query: {
      hello: () => 'world'
    }
  }
}
```

You can point themis to a file/directory containing a `module` and it will start up an apollo-graphql server:
```
themis hello.js
```

## No lock-in
If the need for deeper server customisation may arise, or an important feature is missing, Themis GraphQL modules can be used manually with Apollo Server and GraphQL Tools at any time. You just have to set up an Apollo Server and stitch them yourself. We'd be happy to integrate support for advanced use cases though.
