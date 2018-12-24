---
id: env
title: Environment Configuration
sidebar_label: ENV
---

## Development
Themis uses [`dotenv`](https://www.npmjs.com/package/dotenv), to allow setting up a development environment for example. Create a `.env` file in your project root directory.

## Supported Settings
- PORT = INT
- NODE_ENV = STRING (development|production)
- LOG_LEVEL = STRING (debug|warn|error|info)
- GQL_API_PATH = STRING (default: '/api/graphql')
- GQL_SUBSCRIPTIONS_PATH = STRING (default: '/ws/subscriptions')
- GQL_SUBSCRIPTION_KEEPALIVE = INT (ms, default: 15000)
- GQL_TRACING = BOOLEAN
- GQL_CACHE_CONTROL_MAX_AGE = INT (seconds)
- APOLLO_ENGINE_API_KEY = [See Apollo Engine Docs](https://www.apollographql.com/docs/engine/)