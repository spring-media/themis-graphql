# Themis
GraphQL Data Aggregation CLI

[Read the Docs](docs/getting-started.md) or checkout the repository, goto `./website` and run `yarn && yarn start`.


# Mocks
Each `module` can expose its own `mocks` and in `--mock` mode will will be added as [mock functions](https://www.apollographql.com/docs/graphql-tools/mocking.html) to the schema.
```
node index -s ./modules --mock
```

## Nocks
A special case for mocking are remote modules or external requests to third parties, when mainly using themis as an aggregation/transformation layer. External requests from modules can be recorded on a _per query_ basis. The recorded requests can then be automatically replayed in `--nock` mode for the queries or be used to create manual mocks for `--mock` mode.

To record external requests for automatic replay use:
```
node index -s ./modules --nock --record
```
All requests will be recorded to `path.join(process.cwd(), '/__query_nocks__')` by default.

To start the server in replay mode use:
```
node index -s ./modules --nock
```
Replaying is currently only possible in production mode, as it needs an existing remote schema for remote modules.


# Configuration
Create a `.env` file and/or provide the following environment configurations:
- PORT = INT
- NODE_ENV = STRING (development|production)
- LOG_LEVEL = STRING (debug|warn|error|info)
- GQL_API_PATH = STRING (default: '/api/graphql')
- GQL_SUBSCRIPTIONS_PATH = STRING (default: '/ws/subscriptions')
- GQL_SUBSCRIPTION_KEEPALIVE = INT (ms, default: 15000)
- GQL_TRACING = BOOLEAN
- GQL_CACHE_CONTROL_MAX_AGE = INT (seconds)
- APOLLO_ENGINE_API_KEY = [See Apollo Engine Docs](https://www.apollographql.com/docs/engine/)

To use the CLI in a development environment with a `.env` file, use `node index -r dotenv/config ...`.


# Development Setup
Run `yarn install`.

# Testing
Tests are mainly written as integration tests and should mainly be written as integration tests.

Run `yarn test`.

The test setup mocks all external requests (including remote gql resources like lean), with [nock](https://github.com/nock/nock).
Currently the nocking setup is included with jest at `./framework.js`, this may be subject to change.

### Recording HTTP Mocks for Tests
A test that should use mocks, can be marked by using `it.nock(...)` or `beforeAll.nock(...)`,
just like `it.skip(...)`. `skip` and `only` still works by using `it.only.nock(...)`.

If mocks are found for a test, they'll be replayed automatically. Currently you can [turn off all mocks](https://github.com/nock/nock#turning-nock-off-experimental) by setting the environment variable `NOCK_OFF=true`. Then all tests will run against live APIs.

To record http interaction for a test to later replay it without actually hitting a live API,
run the tests with `JEST_NOCK_RECORD=true`. It will record and save the remote responses in a folder called `__nocks__` next to the test file, from where they are automatically replayed.