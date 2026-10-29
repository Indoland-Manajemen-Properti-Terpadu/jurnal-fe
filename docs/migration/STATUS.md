# Migration Status

One row per target module (see `docs/superpowers/specs/2026-10-29-codebase-restructure-design.md`, sections 4.3 and 4.4). A feature is done only when every column is `done`. Values: `todo`, `wip`, `done`, `n/a`.

Columns: **Structure** (layout and layers), **Names** (English, kebab-case paths), **i18n** (all strings in `id` and `en`), **Docs** (module README), **Tests** (domain and behavior tests), **Release**.

## Milestone 0: Foundation (release with R1)

| Item | Status |
|---|---|
| Baseline recorded | done |
| Repo hygiene, tests green, lint usable | done |
| Ratchet and guardrail rules | done |
| Single HTTP client, money helper | done |
| CI, branch policy as code, docs skeleton | done |

## Milestone 1: Small and isolated (R1)

| Module (current to target) | Structure | Names | i18n | Docs | Tests | Release |
|---|---|---|---|---|---|---|
| `Contact` + `Kontak` to `contacts` | todo | todo | todo | todo | todo | R1 |
| `products` | todo | todo | todo | todo | todo | R1 |
| `Sale` to `sales` | todo | todo | todo | todo | todo | R1 |
| `Pembelian` to `purchases` | done | done | done | done | done | R1 |
| `Asset` to `assets` | done | done | done | done | done | R1 |
| `PendingChanges` to `pending-changes` | done | done | done | done | done | R1 |
| `Profile` to `profile` | done | done | done | done | done | R1 |
| `LandingPage` to `landing` | done | done | done | done | done | R1 |
| `Dashboard` to `dashboard` | todo | todo | todo | todo | todo | R1 |
| `SettingBudget` + `BudgetPlanning` to `budgeting` | done | done | done | done | done | R1 |
| `Cost` to `costs` | done | done | done | done | done | R1 |
| `Production` to `production` | done | done | done | done | done | R1 |
| `Fulfillment` to `fulfillment` | done | done | done | done | done | R1 |

## Milestone 2: Cash and reporting (R2)

| Module | Structure | Names | i18n | Docs | Tests | Release |
|---|---|---|---|---|---|---|
| `BankCash` to `bank-cash` | todo | todo | todo | todo | todo | R2 |
| `BankCash/PettyCash` to `petty-cash` | todo | todo | todo | todo | todo | R2 |
| `ResultReport` to `reports` | todo | todo | todo | todo | todo | R2 |

## Milestone 3: Core ledger (R3), split of `GeneralJournal`

| Module | Structure | Names | i18n | Docs | Tests | Release |
|---|---|---|---|---|---|---|
| `chart-of-accounts` | todo | todo | todo | todo | todo | R3 |
| `journal-entries` | todo | todo | todo | todo | todo | R3 |
| `account-ledger` | todo | todo | todo | todo | todo | R3 |
| `bank-statements` | todo | todo | todo | todo | todo | R3 |
| `reconciliation` | todo | todo | todo | todo | todo | R3 |
| `beginning-balances` | todo | todo | todo | todo | todo | R3 |
| `period-closing` | todo | todo | todo | todo | todo | R3 |

## Milestone 4: Platform (R4, final)

| Module | Structure | Names | i18n | Docs | Tests | Release |
|---|---|---|---|---|---|---|
| `SettingMenu` to `settings` | todo | todo | todo | todo | todo | R4 |
| `SettingMenu/UserManagement` to `user-management` | todo | todo | todo | todo | todo | R4 |
| `Authentication` to `authentication` | todo | todo | todo | todo | todo | R4 |
| Final audit, ratchets set to `error` repo-wide | todo | n/a | n/a | todo | n/a | R4 |
