# ADR 0002: Features are sibling modules, not nested containers

**Status:** Accepted, 2026-10-29

## Context
`GeneralJournal` held 129 files at depth 5 and 66 imports from other modules; `BankCash` and `ResultReport` nested unrelated sub-features.

## Decision
Each responsibility is its own module under `src/module/`, with the same layer layout and a public `index.ts`. `GeneralJournal` is split into `chart-of-accounts`, `journal-entries`, `account-ledger`, `bank-statements`, `reconciliation`, `beginning-balances` and `period-closing`; `Petty Cash` is separate from `bank-cash`. Exact seams are confirmed against the code in each feature's migration plan.

## Consequences
Cross-feature use goes through public APIs, enforced by lint. Shared concepts that several features need move to `src/lib` or `src/components` only when a real second consumer exists.
