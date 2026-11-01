# ADR 0004: One production release per milestone

**Status:** Accepted, 2026-10-29

## Context
The restructure touches most of 645 files. One final release would let `develop-frontend` drift for months from production fixes; a release per PR would deploy half-converted areas.

## Decision
Four releases: R1 (foundation and small modules), R2 (cash and reports), R3 (core ledger), R4 (platform and final audit). Each release is promoted `develop-frontend`, `staging`, `main-frontend` and passes the release gate in [branching-and-release.md](../branching-and-release.md). The restructure is not finished until every row of [STATUS.md](../migration/STATUS.md) is done.

## Consequences
Behavior must be preserved at every merge. `main-frontend` is merged back into `develop-frontend` after hotfixes and weekly.
