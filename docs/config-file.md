---
id: config-file
title: Configuration File
sidebar_label: Configuration File
---

Configuration files are just javascript/json modules. They can be used to create different sets of modules from the same codebase and to extend the server with middlewares or lifecycle methods.

## Modules
Modules specified in a configuration file will be resolved relative to CWD, which usually is your project root. If you specify only a module name, not a path, Themis will try to resolve an NPM module (node_modules).

Example configuration (hello-bye.config.js):
```js
module.exports = {
  modules: [
    './hello',
    './bye'
  ]
}
```

Use via CLI:
```bash
themis -c hello-bye.config.js
```
