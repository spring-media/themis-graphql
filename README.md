# red-gql
GQL Data Aggregation CLI

# Usage
```
red-gql git:(master) ✗ node index --help

  Usage: node index [options] <datasourcePaths ...>

  Options:

    -b, --build           Build datasources for production (load and store remote schemas)
    -m, --mock            Start server in mock mode
    -s, --use-subfolders  Treat each folder in a datasourcePath as a datasource
    -h, --help            output usage information
```

# What
Inspired by [GrAMPS Datsources](https://gramps.js.org/data-source/data-source-overview/) and built with [GraphQL Tools](https://github.com/apollographql/graphql-tools), this is an integrated CLI Tool to work with `datasources`. In short, `datasources` are encapsulated subsets of a larger graph and can be [stitched](https://www.apollographql.com/docs/graphql-tools/schema-stitching.html) together as a combined graphql endpoint.

You can point red-gql to a directory containing `datasources` and it will start up a server to stitch and run them.
```
node index -s ./graphql
```

This CLI supports [remote schemas](https://www.apollographql.com/docs/graphql-tools/remote-schemas.html) and uses the introspection result from another GraphQL endpoint. To allow the server to start in _production_, even though the remotes are not available yet, we can run a _build_, to store the remote schemas in a `dist` folder with the `datasource`.
```
node index -s ./graphql --build
```

Each `datasource` can expose its own `mocks` and in `--mode` will will be added as [mock functions](https://www.apollographql.com/docs/graphql-tools/mocking.html) to the schema.
```
node index -s ./graphql --mock
```

# Configuration
Create a `.env` file and/or provide the following environment configurations:
- PORT = (INT)
- NODE_ENV = (development|production)
- LOG_LEVEL = (debug|warn|error|info)
- GQL_TRACING = (true|false)
- GQL_CACHE_CONTROL = (true|false)

To use the CLI in a development environment with a `.env` file, use `node index -r dotenv/config ...`.


# Development Setup
Run `yarn install`.
Then just `yarn run dev`.

# Docker
In order to run the GraphQL aggregation layer inside a Docker container, simply do the following:
 
* Build the Docker image from the `Dockerfile`, e.g.
```
docker build -t "gql_aggregation_layer" .
```
* Create and start a container using the Docker image, e.g.
```
docker run -it -p 8484:8484 gql_aggregation_layer
```
The GraphQl aggregation layer is available at localhost:8484/api/graphql. The graphical interactive in-browser 
GraphQL IDE can be found at http://localhost:8484/api/graphiql.

# Testing
Run `yarn run test`.

The test setup mocks all external requests (including remote gql resources like lean), with [nock](https://github.com/nock/nock).
Currently the nocking setup is included with jest at `./framework.js`, this may be subject to change.

### Recording HTTP Mocks
A test that should use mocks, can be marked by using `it.nock(...)` or `beforeAll.nock(...)`,
just like `it.skip(...)`. `skip` and `only` still works by using `it.only.nock(...)`.

If mocks are found for a test, they'll be replayed automatically. Currently you can [turn off all mocks](https://github.com/nock/nock#turning-nock-off-experimental) by setting the environment variable `NOCK_OFF=true`. Then all tests will run against live APIs.

To record http interaction for a test to later replay it without actually hitting a live API,
run the tests with `JEST_NOCK_RECORD=true`. It will record and save the remote responses in a folder called `__nocks__` next to the test file, from where they are automatically replayed.