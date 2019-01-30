---
id: remote-module-guide
title: Remote Module Guide
sidebar_label: Remote Module
---

Themis supports [remote schemas](https://www.apollographql.com/docs/graphql-tools/remote-schemas.html) and uses the introspection result from another GraphQL endpoint to create a remote executable schema. A remote module does not need a local schema and resolvers, instead it specifies a remote endpoint.

## Example Remote Module
Create a file called `remote-hello.js` and fill it with:
```js
module.exports = {
  name: 'remote-hello',
  remote: {
    uri: 'http://127.0.0.1:8585/api/graphql'
  }
}
```
Now start the `hello.js` example from the [Getting Started guide](../getting-started) (or from the examples in the repository) at port `8585` like so:
```bash
PORT=8585 themis hello.js
```
Then start the remote example at the default port:
```bash
themis remote-hello.js
```

Goto `localhost:8484/api/graphql` to open GraphQL Playground. You should now be able to query data from the remote endpoint.
```text
{
  hello
}
```