---
id: remote-module
title: Remote Module
sidebar_label: Remote Module
---

Themis supports [remote schemas](https://www.apollographql.com/docs/graphql-tools/remote-schemas.html) and uses the introspection result from another GraphQL endpoint. A remote module does not need a local schema and resolvers, instead it specifies a remote endpoint.

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
Now start the `hello.js` example from the [Getting Started guide](./getting-started) at port `8585` like so:
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

## Fetch Remote Schema
In _development_ mode Themis will fetch remote schemas at startup. To allow the server to start in _production_, even though the remotes are not available yet, we can run a _build_, to store the remote schemas in a `dist` folder with the `module`.

```bash
themis module.js --build
```

You can specify a custom path to store the fetched remote schema at, relative to the module:
```js
module.exports = {
  name: 'remote-api',
  remote: {
    uri: 'http://remoteendpoint.com/api/graphql',
    schemaPath: 'custom/path/schema.json' // <<
  }
}
```