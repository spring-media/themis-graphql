# Themis
GraphQL Data Aggregation CLI

[Read the Docs](docs/getting-started.md) or checkout the repository, goto `./website` and run `yarn && yarn start`.


# Development Setup
Run `yarn install`.

# Testing
Tests are mainly written as integration tests and should mainly be written as integration tests.

Run `yarn test`.

The test setup mocks all external requests (including remote gql resources like lean), with [jest-nock](https://www.npmjs.com/package/jest-nock).