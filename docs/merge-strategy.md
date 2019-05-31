---
id: merge-strategy
title: Merge Strategy
sidebar_label: Merge Strategy
---

Merge Strategies are Javascript modules, exposing a `merge` function, which will be handed everything to merge all modules into one executable schema.

## Select Strategy
Which merge strategy to use can be specified via the CLI parameter `--strategy [mergeStrategy]`. The `mergeStrategy` can be either
an included one like `complex` or `all-local`, or a path to a custom module exposing a `merge` method.

## Included Strategies
### `complex` (default)
This strategy will create an executable schema for each module and apply transforms per module, before merging them into one executable schema including
the remote schemas.

### `all-local`
This strategy takes all type definitions and creates one executable schema from all modules, then merges it with the remote schemas.