---
id: design
title: Design Guide
sidebar_label: Design
---

## Domain-Driven APIs - Naming and Semantics

1. Design your API around the business domain, not the implementation, user-interface, or legacy APIs. Never expose implementation details in your API design. Always start with a high-level view of the objects and their relationships before you deal with specific fields.
2. The API should provide business logic, not just data. Complex calculations should be done on the server, in one place, not on the client, in many places.
3. Provide the raw data too, even when there’s business logic around it.

## Business Objects vs. CRUD

1. Major business-object types should always implement Node with an ID! field, which allows the client to accurately and efficiently manage local caches and other tricks.

```graphql
interface Node {
  id: ID!
}

type Article implements Node {
  id: ID!
}
```

## Relations

1. Prefer one atomic operation per mutation! When writing separate mutations for relationships, consider whether it would be useful for the mutations to operate on multiple elements at once.
2. Mutating relationships is really complicated and not easily summarized into a snappy rule! ;-)

## Pagination

1. Always check whether list fields should be paginated or not. See:

- [Apollo Pagination Tutorial](https://www.apollographql.com/docs/react/features/pagination.html)
- [Relay Cursor Pagination Specification](https://facebook.github.io/relay/graphql/connections.htm)

## Fields

1. Group closely-related fields together into subobjects.

**Bad**

```graphql
type Auth {
  isAuthenticated: Boolean
  scopes: [String]!
  roles: [String]
  userAccountName: String
  userEmail: String
  userName: String
}
```

**Good**

```graphql
type Auth {
  isAuthenticated: Boolean
  scopes: [String]!
  user: AuthUser
}

type AuthUser {
  accountName: String
  email: EmailAddress
  username: String
  roles: [String]
}
```

2. Always use object references instead of ID fields.

**Bad**

```graphql
type Auth {
  isAuthenticated: Boolean
  scopes: [String]!
  userId: ID
}

type Query {
  user: Auth
}

type Mutation {
  login: Auth
}
```

**Good**

```graphql
type Auth {
  isAuthenticated: Boolean
  scopes: [String]!
  user: AuthUser
}
```

3. Choose field names based on what makes sense, not based on the implementation or what the field is called in legacy APIs.

**Bad**

```graphql
type Article {
  cmsId: ID
}
```

**Good**

```graphql
type Article {
  id: ID!
}
```

4. Use custom scalar types when you’re exposing something with specific semantic value. see [more GraphQL scalars](https://github.com/okgrow/graphql-scalars)

**Bad**

```graphql
type AuthUser {
  email: String
}
```

**Good**

```graphql
type AuthUser {
  email: EmailAddress
}
```

5. Use enums for fields which can only take a specific set of values.

```graphql
enum SortOrder {
  CREATION_DATE
  MODIFICATION_DATE
  RELEVANCE
}
```

## Mutations

1. Write separate mutations for separate logical actions on a resource.

**Bad**

```graphql
mutation setConfiguration(input: SetConfigurationInput!): SetConfigurationResult

input SetConfigurationInput {
  id: ID
  value: String
}
```

**Good**

```graphql
mutation configurationSet(input: SetConfigurationInput!): SetConfigurationResult!

input SetConfigurationInput {
  id: ID!
  value: Configuration!
}

mutation configurationUnset(input: UnsetConfigurationInput!): UnsetConfigurationResult!

input UnsetConfigurationInput {
  id: ID!
}
```

2. Prefix mutation names with the object they are mutating for alphabetical grouping (e.g. use configurationSet instead of setConfiguration).

**Bad**

```graphql
mutation setConfiguration(input: SetConfigurationInput!): SetConfigurationResult!

```

**Good**

```graphql
mutation configurationSet(input: SetConfigurationInput!): SetConfigurationResult!
```

3. Use weaker types for inputs (e.g. String instead of Email) when the format is unambiguous and client-side validation is complex. Use stronger types for inputs (e.g. DateTime instead of String) when the format may be ambiguous and client-side validation is simple.

4. Mutations should provide user/business-level errors via a `error: Failure` field on the mutation payload. The top-level query errors entry is reserved for client and server-level errors. Most payload fields for a mutation should be nullable, unless there is really a value to return in every possible error case.

```graphql
type SetConfigurationResult {
  result: Configuration
  error: Failure
}

type Failure {
  message: String
}
```

## Versioning

1. It’s easier to add fields than to remove them.
2. Use `@deprecated(reason: "Deprecated! Use field xyz instead of abc.")` directive to mark field as deprecated.

```graphql
type Article {
  id: ID!
  cmsId: ID @deprecated(reason: "Deprecated! Use field id instead of cmsId.")
}
```

## Conclusion

Hopefully by this point you have a solid idea of how to design a good GraphQL API. Once you've designed an API you're happy with, it's time to implement it!

## Credits

Many of this recommendations and rules were inspired and created by Shopify [GraphQL Design Tutorial](https://github.com/Shopify/graphql-design-tutorial/). Thank you for sharing.
