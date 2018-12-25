---
id: cli
title: CLI
sidebar_label: CLI
---

To get all options for the CLI use `themis --help`.

## Usage
Themis takes a space separated set of paths to modules and options.

### `-c, --config [configPath]`

### `-b, --build`
Fetch the introspection schemas for remote modules and store the locally with the module. Locally stored schemas will then be used at startup to derive the remote executable schema from.

### `--pretty`
When fetching remote schemas they can be formatted to check them into SCM and track changes in the schemas more easily.

### `-t, --test`
Run the tests in the current working directory (cwd) with jest and nock, by default matching tests with `*.(test|spec).jsx?` or in a `__tests__` folder.

### `-n, --nock`
Run in `nock mode` to replay recorded external requests by modules on a per query basis.

### `-r, --record`
Use with `--nock --record` to record all external requests made by modules during a query. This can be used for offline development or testing.