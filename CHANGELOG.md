# Changelog

### vNEXT
- `accessViaContext` in modules is no longer needed, as all module schemas will be exposed in the context as `context.schemas[moduleName]`
- `validateContext` from modules is no longer supported
- Rename the package.json dependencies key to `gqlDependencies`