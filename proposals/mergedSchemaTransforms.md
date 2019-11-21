# Proposal: Enable Schema-Transformation of the Merged Schema

Author(s): [Rajesh Babu]

## Abstract

Enable schema transformation after merging the schema from the modules.

## Background

The themis-graphql currently uses modules and opts for a merge strategy based on the modules we pass. Since these modules depend on each other sometimes the mergedSchema contains all the **RootFields** present in all the modules, which is okay if our graphql service is internal. The problem occurs when we want to expose our graphql schema to public. Incase of our public schema, after building the merged schema, we may have to filter out the **RootFields** and **Types** we do not want to expose to the public. ***For example***: our public module SmartTv depends on several internal modules for sharing types and resolvers, so the mergedSchema would have all the **RootFields** including the internal **Types**. This problem could be solved if we apply schema transformation on our merged schema.

## Proposal

The server config would have a new field called **mergedSchemaTransforms**, which would carry all our required transformations in an array that we would like to have. And is an empty array by default. And this field is optional.

## Rationale

This would be very advantageous for us and probably the best solution in terms of keep the existing graphql aggregation-layer for both public and private users.


## Implementation

1) Adding a new field to JOI config validation called **mergedSchemaTransforms**.
2) Pick the field from config and pass it as an argument to the **initServer** method.
3) Apply the transformations inside merge strategies ***(all local and complex)***.

## Important Note
This is not a breaking-change and is incremental. This would not cause any problems or regressions on the existing modules. And is an optional field required for services that we intend to make public.