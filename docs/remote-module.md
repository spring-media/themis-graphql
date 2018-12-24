---
id: remote-module
title: Remote Module
sidebar_label: Remote Module
---

Themis supports [remote schemas](https://www.apollographql.com/docs/graphql-tools/remote-schemas.html) and uses the introspection result from another GraphQL endpoint. 

## Fetch Remote Schema
To allow the server to start in _production_, even though the remotes are not available yet, we can run a _build_, to store the remote schemas in a `dist` folder with the `module`.

```bash
themis module.js --build
```