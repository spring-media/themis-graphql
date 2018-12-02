# red-gql
GQL Data Aggregation CLI

# Usage
```
red-gql git:(master) ✗ node index --help

  Usage: node index [options] <datasourcePaths ...>

  Options:

    -b, --build                Build datasources for production (load and store remote schemas)
    --pretty                   store remote schema as pretty JSON for scm tracking and comparison
    -m, --mock                 Start server in mock mode
    -n, --nock                 Start server in nock mode (Load recorded nocks)
    -r, --record               Record external requests with nock (use with --nock)
    -p, --nockPath [nockPath]  Where external request records should go
    -s, --use-subfolders       Treat each folder in a datasourcePath as a datasource
    --introspection            Force activate introspection query on Apollo Server
    -h, --help                 output usage information
```

# What
Inspired by [GrAMPS Datsources](https://gramps.js.org/data-source/data-source-overview/), built with [GraphQL Tools](https://github.com/apollographql/graphql-tools) and [Apollo Server](https://github.com/apollographql/apollo-server), this is an integrated CLI Tool to work with `datasources`. In short, `datasources` are encapsulated subsets of a larger graphql schema and can be [stitched](https://www.apollographql.com/docs/graphql-tools/schema-stitching.html) together as a combined graphql endpoint.

You can point red-gql to a directory containing `datasources` and it will start up a server to stitch and run them.
```
node index -s ./datasources
```

This CLI supports [remote schemas](https://www.apollographql.com/docs/graphql-tools/remote-schemas.html) and uses the introspection result from another GraphQL endpoint. To allow the server to start in _production_, even though the remotes are not available yet, we can run a _build_, to store the remote schemas in a `dist` folder with the `datasource`.
```
node index -s ./datasources --build
```

# Mocks
Each `datasource` can expose its own `mocks` and in `--mock` mode will will be added as [mock functions](https://www.apollographql.com/docs/graphql-tools/mocking.html) to the schema.
```
node index -s ./datasources --mock
```

## Nocks
A special case for mocking are remote datasources or external requests to third parties, when mainly using red-gql as an aggregation/transformation layer. External requests from datasources can be recorded on a _per query_ basis. The recorded requests can then be automatically replayed in `--nock` mode for the queries or be used to create manual mocks for `--mock` mode.

To record external requests for automatic replay use:
```
node index -s ./datasources --nock --record
```
All requests will be recorded to `path.join(process.cwd(), '/__query_nocks__')` by default.

To start the server in replay mode use:
```
node index -s ./datasources --nock
```
Replaying is currently only possible in production mode, as it needs an existing remote schema for remote datasources.


# Configuration
Create a `.env` file and/or provide the following environment configurations:
- PORT = INT
- NODE_ENV = STRING (development|production)
- LOG_LEVEL = STRING (debug|warn|error|info)
- GQL_API_PATH = STRING (default: '/api/graphql')
- GQL_TRACING = BOOLEAN 
- GQL_CACHE_CONTROL_MAX_AGE = INT (seconds)
- APOLLO_ENGINE_API_KEY = [See Apollo Engine Docs](https://www.apollographql.com/docs/engine/)

To use the CLI in a development environment with a `.env` file, use `node index -r dotenv/config ...`.


# Development Setup
Run `yarn install`.

# Testing
Run `yarn test`.

The test setup mocks all external requests (including remote gql resources like lean), with [nock](https://github.com/nock/nock).
Currently the nocking setup is included with jest at `./framework.js`, this may be subject to change.

### Recording HTTP Mocks for Tests
A test that should use mocks, can be marked by using `it.nock(...)` or `beforeAll.nock(...)`,
just like `it.skip(...)`. `skip` and `only` still works by using `it.only.nock(...)`.

If mocks are found for a test, they'll be replayed automatically. Currently you can [turn off all mocks](https://github.com/nock/nock#turning-nock-off-experimental) by setting the environment variable `NOCK_OFF=true`. Then all tests will run against live APIs.

To record http interaction for a test to later replay it without actually hitting a live API,
run the tests with `JEST_NOCK_RECORD=true`. It will record and save the remote responses in a folder called `__nocks__` next to the test file, from where they are automatically replayed.