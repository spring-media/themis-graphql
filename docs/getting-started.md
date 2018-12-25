---
id: getting-started
title: Getting Started
sidebar_label: Getting Started
---

Themis is a CLI Layer on top of [Apollo Server](https://github.com/apollographql/apollo-server) and [GraphQL Tools](https://github.com/apollographql/graphql-tools), to encapsulate subsets of a Graph into modules. Modules can also be NPM packages.

_Note:_ To run the examples you can install themis globally `yarn global add themis-graphql`, or create a new package in an empty folder with `yarn init --yes`, install themis locally `yarn add themis-graphql` and use it in the shell examples like `./node_modules/.bin/themis --help`.

[All examples](https://github.com/spring-media/themis-graphql/blob/master/examples) can be found in the repository as well.

## Creating a GraphQL Module
A `module` in its most basic form consists of a GraphQL schema (Type Definition) and resolvers. If you don't know what a schema and resolvers are, checkout [graphql.org/learn](https://graphql.org/learn/). For convenience, Themis exposes the packages it uses, like `graphql-tag`, `graphql-tools` and `apollo-server`, plus other convenvient helpers for testing.

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
```bash
themis hello.js
```

By default, Themis will start a server at port `8484` and mount the server at the path `/api/graphql`. Goto `localhost:8484/api/graphql` to open GraphQL Playground. You can create a query on the left:
```text
{
  hello
}
```

_Mutations_ and _Subscriptions_ work as well.

## Combining Modules
Create a second file called `bye.js` with the following contents:
```js
const { gql } = require('themis-graphql');

module.exports = {
  name: 'bye',
  typeDefs: gql`
    type Query {
      bye: String
    }
  `,
  resolvers: {
    Query: {
      bye: () => 'world'
    }
  }
}
```

You can point themis to multiple modules:
```bash
themis hello.js bye.js
```

In Playground you should now be able to query:
```text
{
  hello
  bye
}
```

If you have a bunch of modules, you can also specify which ones to run [via a config file](./config-file). You can find more advanced examples with [remote modules in its API docs](./remote-modules).

## No lock-in
If the need for deeper server customisation may arise, or an important feature is missing, Themis GraphQL modules can be used manually with Apollo Server and GraphQL Tools at any time. You just have to set up an Apollo Server and stitch them yourself. We'd be happy to integrate support for advanced use cases though.
