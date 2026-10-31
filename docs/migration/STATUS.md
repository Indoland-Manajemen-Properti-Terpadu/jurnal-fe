# Migration Status

One row per target module (see `docs/superpowers/specs/2026-10-29-codebase-restructure-design.md`, sections 4.3 and 4.4). A feature is done only when every column is `done`. Values: `todo`, `wip`, `done`, `n/a`.

Columns: **Structure** (layout and layers), **Names** (English, kebab-case paths), **i18n** (all strings in `id` and `en`), **Docs** (module README), **Tests** (domain and behavior tests), **Release**.

## Release plan (revised 2026-10-29)

Priority changed: the ledger (`GeneralJournal`) goes before the remaining small modules, and R1 ships what is already done.

| Release | Content |
|---|---|
| **R1** | Milestone 0 plus the ten finished Milestone 1 modules (`costs`, `production`, `fulfillment`, `budgeting`, `landing`, `profile`, `pending-changes`, `purchases`, `assets`, `products`) |
| **R2** | Milestone 3: the seven ledger modules split out of `GeneralJournal` |
| **R3** | `sales`, `dashboard`, `contacts` (rest of Milestone 1) and Milestone 2 (`bank-cash`, `petty-cash`, `reports`) |
| **R4** | Milestone 4: platform and final audit |

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
| `Contact` + `Kontak` to `contacts` | done | done | done | done | done | R3 |
| `products` | done | done | done | done | done | R1 |
| `Sale` to `sales` | done | done | done | done | done | R3 |
| `Pembelian` to `purchases` | done | done | done | done | done | R1 |
| `Asset` to `assets` | done | done | done | done | done | R1 |
| `PendingChanges` to `pending-changes` | done | done | done | done | done | R1 |
| `Profile` to `profile` | done | done | done | done | done | R1 |
| `LandingPage` to `landing` | done | done | done | done | done | R1 |
| `Dashboard` to `dashboard` | done | done | done | done | done | R3 |
| `SettingBudget` + `BudgetPlanning` to `budgeting` | done | done | done | done | done | R1 |
| `Cost` to `costs` | done | done | done | done | done | R1 |
| `Production` to `production` | done | done | done | done | done | R1 |
| `Fulfillment` to `fulfillment` | done | done | done | done | done | R1 |

## Milestone 2: Cash and reporting (R3)

| Module | Structure | Names | i18n | Docs | Tests | Release |
|---|---|---|---|---|---|---|
| `BankCash` to `bank-cash` | todo | todo | todo | todo | todo | R3 |
| `BankCash/PettyCash` to `petty-cash` | todo | todo | todo | todo | todo | R3 |
| `ResultReport` to `reports` | done | done | done | done | done | R3 |

## Milestone 3: Core ledger (R2), split of `GeneralJournal`

| Module | Structure | Names | i18n | Docs | Tests | Release |
|---|---|---|---|---|---|---|
| `chart-of-accounts` | done | done | done | done | done | R2 |
| `journal-entries` | done | done | done | done | done | R2 |
| `account-ledger` | done | done | done | done | done | R2 |
| `bank-statements` | done | done | done | done | done | R2 |
| `reconciliation` | done | done | done | done | done | R2 |
| `beginning-balances` | done | done | done | done | done | R2 |
| `period-closing` | done | done | done | done | done | R2 |

## Milestone 4: Platform (R4, final)

| Module | Structure | Names | i18n | Docs | Tests | Release |
|---|---|---|---|---|---|---|
| `SettingMenu` to `settings` | todo | todo | todo | todo | todo | R4 |
| `SettingMenu/UserManagement` to `user-management` | todo | todo | todo | todo | todo | R4 |
| `Authentication` to `authentication` | todo | todo | todo | todo | todo | R4 |
| Final audit, ratchets set to `error` repo-wide | todo | n/a | n/a | todo | n/a | R4 |
