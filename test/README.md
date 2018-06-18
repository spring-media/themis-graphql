# Testing
The test setup mocks all external requests (including remote gql resources like lean), with [nock](https://github.com/nock/nock).
Currently the nocking setup is included with jest at `./framework.js`, this may be subject to change.

### Run tests against live APIs
Currently you can [turn off all mocks](https://github.com/nock/nock#turning-nock-off-experimental) by setting the environment variable `NOCK_OFF=true`.