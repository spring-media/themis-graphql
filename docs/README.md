# Themis GraphQL

## Goals
- Reduce the boilerplate of setting up a graphql server
- Make it easy to split a large graph into subsets that can be freely combined
- Cover advanced and complex use cases out of the box

### Getting Started
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

## What
Inspired by [GrAMPS Datsources](https://gramps.js.org/data-source/data-source-overview/), built with [GraphQL Tools](https://github.com/apollographql/graphql-tools) and [Apollo Server](https://github.com/apollographql/apollo-server), this is an integrated CLI Tool to work with `datasources`. In short, `datasources` are encapsulated subsets of a larger graphql schema and can be [stitched](https://www.apollographql.com/docs/graphql-tools/schema-stitching.html) together as a combined graphql endpoint.
