---
id: config-file
title: Configuration File
sidebar_label: Configuration File
---

Configuration files are javascript/json modules. They can be used to create different sets of modules from the same codebase and to extend the server with middlewares or lifecycle methods.

Use via CLI:
```bash
themis -c hello-bye.config.js
```

## Allowed Configuration Keys
- modules
- middleware
- context
- onStartup
- onShutdown

## Modules
Modules specified in a configuration file will be resolved relative to CWD, which usually is your project root. If you specify only a module name, not a path, Themis will try to resolve an NPM module (node_modules).

The modules specified in the configuration file can also be combined with additional modules specified as CLI options.

Example configuration (hello-bye.config.js):
```js
module.exports = {
  modules: [
    './hello',
    './bye'
  ]
}
```

## Middleware
Middlewares are simple [express middlewares](https://expressjs.com/en/4x/api.html#app.use) and can be added _before_ or _after_ Apollo Server. Most use cases can be covered by adding a middleware _before_. _After_ can be used to add custom error handling for express.

The `middleware` configuration key is an Object which can specify `before` and `after` as lists of middlewares.

Example configuration:
```js
module.exports = {
  middleware: {
    before: [myFirstMiddleware],
    after: [mySecondMiddleware]
  }
}
```

You can also mount middlewares at a specific path, by providing a middleware as an array, which will be spreaded into express.

```js
module.exports = {
  middleware: {
    before: [
      ['/custom/path', mountSomething]
    ]
  }
}
```

## Context
The `context` can be either a function or an array of functions, which will be called in a request/response query cycle. The function may return an object to be merged with the remaining context. Context functions will be called in the order the modules are loaded. Context functions from the configuration file are called before all others. If different context functions try to expose the same key on the context, they may override each other.

A `context` function gets an object with the `req` and `res` of the query. When using _Subscriptions_, the object will contain the `connection` key.

Example configuration:
```js
module.exports = {
  context: () => ({
    myKey: 'myValue'
  })
}
```

## Lifecycle Hooks
Lifecycle hooks allow to execute something `onStartup`, just before the server will be mounted at the given port and `onShutdown`, after a kill signal has been received (SIGTERM|SIGNINT).

Example configuration:
```js
module.exports = {
  onStartup: () => doSetupWork(),
  onShutdown: () => doTeardownWork()
}
```