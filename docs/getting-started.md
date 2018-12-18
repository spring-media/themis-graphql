---
id: getting-started
title: Getting Started
sidebar_label: Introduction
---

## Creating a GraphQL Module
A `datasource` in its most basic form consists of a GraphQL schema (Type Definition) and resolvers.

Create a file called `hello.js` with the following contents:
```js
const { gql } = require('red-gql');

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

You can point red-gql to a file/directory containing a `datasource` and it will start up an apollo-graphql server:
```
red-gql index.js
```

This CLI supports [remote schemas](https://www.apollographql.com/docs/graphql-tools/remote-schemas.html) and uses the introspection result from another GraphQL endpoint. To allow the server to start in _production_, even though the remotes are not available yet, we can run a _build_, to store the remote schemas in a `dist` folder with the `datasource`.
```
node index -s ./datasources --build
```