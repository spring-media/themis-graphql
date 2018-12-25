---
id: remote-module
title: Remote Module
sidebar_label: Remote Module
---

## Fetch Remote Schema
In _development_ mode Themis will fetch remote schemas at startup. To allow the server to start in _production_, even though the remotes are not available yet, we can run a _build_ to store the remote schemas in a `dist` folder with the `module`.

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

## Transforms
Both a local and a remote module can export `transforms`, which will be applied after creating an executable schema. Read more about it in the [Transforms docs](./transforms).
