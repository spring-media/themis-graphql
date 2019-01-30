---
id: remote-module
title: Remote Module
sidebar_label: Remote Module
---

A remote module can expose the following values:
- name
- mocks
- mount
- remote
  - uri
  - wsUri
  - schemaPath
  - linkContext
- transforms
- context
- onStartup
- onShutdown

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

## Context
The `context` can be either a function or an array of functions, which will be called in a request/response query cycle. The function may return an object to be merged with the remaining context. Context functions will be called in the order the modules are loaded. Context functions from the configuration file are called before all others. If different context functions try to expose the same key on the context, they may override each other.

A `context` function gets an object with the `req` and `res` of the query. When using _Subscriptions_, the object will contain the `connection` key.


## Lifecycle Hooks
Lifecycle hooks allow to execute something `onStartup`, just before the server will be mounted at the given port and `onShutdown`, after a kill signal has been received (SIGTERM|SIGNINT).