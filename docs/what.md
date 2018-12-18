---
id: what
title: What is this about?
---

Inspired by [GrAMPS Datsources](https://gramps.js.org/data-source/data-source-overview/), built with [GraphQL Tools](https://github.com/apollographql/graphql-tools) and [Apollo Server](https://github.com/apollographql/apollo-server), this is an integrated CLI Tool to work with `datasources`. In short, `datasources` are encapsulated subsets of a larger graphql schema and can be [stitched](https://www.apollographql.com/docs/graphql-tools/schema-stitching.html) together as a combined graphql endpoint.

## Goals
- Reduce the boilerplate of setting up a graphql server
- Make it easy to split a large graph into subsets that can be freely combined
- Cover advanced and complex use cases out of the box
