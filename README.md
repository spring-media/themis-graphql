# red-gql
GQL Data Aggregation Layer for the RED Delivery

# Configuration
Create a `.env` file and/or provide the following environment configurations:
- PORT = (INT)
- NODE_ENV = (development|production)
- ARTICLE_GRAPHQL_ENDPOINT = (URL)
- ARTICLE_GRAPHQL_TOKEN = (string)
- LOG_LEVEL = (debug|warn|error|info)
- GQL_TRACING = (true|false)
- GQL_CACHE_CONTROL = (true|false)

# Development Setup
Run `npm install`.
Then just `npm run dev`.

# Testing
Run `npm run test`.

See [test/README.md](test/README.md)