---
id: getting-started
title: Getting Started
sidebar_label: Introduction
---

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

This CLI supports [remote schemas](https://www.apollographql.com/docs/graphql-tools/remote-schemas.html) and uses the introspection result from another GraphQL endpoint. To allow the server to start in _production_, even though the remotes are not available yet, we can run a _build_, to store the remote schemas in a `dist` folder with the `module`.
```
node index -s ./modules --build
```