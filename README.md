# red-gql
GQL Data Aggregation Layer for the RED BILD Delivery

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
Run `npm run test`.

See [test/README.md](test/README.md)
