---
id: nocks
title: Nocks Guide
sidebar_label: Nocks
---

A special case for mocking are remote modules or external requests to third parties, when using themis mainly as a transformation layer. External requests from modules can be recorded on a _per query_ basis. The recorded requests can then be automatically replayed in `--nock` mode for the queries or be used to create manual mocks for `--mock` mode.

To record external requests for automatic replay use:
```bash
themis module.js --nock --record
```
All requests will be recorded to `path.join(process.cwd(), '/__query_nocks__')` by default.

To start the server in replay mode use:
```bash
themis module.js --nock
```
Replaying is currently only possible in production mode, as it needs an existing remote schema for remote modules.
