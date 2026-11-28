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
| `BankCash` to `bank-cash` | done | done | done | done | done | R3 |
| `BankCash/PettyCash` to `petty-cash` | done | done | done | done | done | R3 |
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
| `SettingMenu` to `settings` | done | done | done | done | done | R4 |
| `SettingMenu/UserManagement` to `user-management` | done | done | done | done | done | R4 |
| `Authentication` to `authentication` | done | done | done | done | done | R4 |
| Final audit, ratchets set to `error` repo-wide | done | n/a | n/a | done | n/a | R4 |

The audit is [AUDIT.md](AUDIT.md). The ESLint ratchet baseline (`eslint-baseline.json`) is now empty: every rule that was counted has been cleared, and `yarn lint` fails on any new violation.

## Release update (2026-11-03)

Follow-up polish for account setup, contacts, journal entries, petty cash, and the shared module header was merged to `develop-frontend` in PR #78 and promoted to `staging` in PR #79. The migration statuses above remain unchanged. The staging image build and push completed, but the server deployment could not connect over SSH on port 22; the running staging application was not updated, so the staging smoke test is still pending.

## Release update (2026-11-26)

PRO-120 purchase status display alignment was merged to `develop-frontend` in PR #269 and promoted to `staging` in PR #270. The staging image build, push, and server deployment completed successfully. The migration statuses above remain unchanged. The staging smoke test is pending before production promotion.

## Release update (2026-11-28)

Sales overview and receivables were merged to `develop-frontend` in PR #309. The related backend API was merged to `main-backend` in `jurnal-be` PR #1. Staging deployment and smoke testing are pending before frontend production promotion. The `sales` module migration status above remains unchanged.

The next PRO-120 purchase summary slice covers the purchasing dashboard, the payables by vendor report, and summary cards on the request, order, receipt, vendor bill, and payment request lists. Its API values come from the purchase dashboard, payables report, and list responses. The purchase module structure and migration statuses above remain unchanged. The owner authorized direct production promotion while the product is not yet live; record any skipped staging smoke test in the release PR.

The next PRO-120 Pesan Ulang slice adds the completed PO/SPK picker, preview, approval submission and decisions, source links, and a denser Ringkasan Pembelian layout. The purchase module structure and migration statuses above remain unchanged. The Demo Site currently has zero completed orders, so the live source form could not be smoke tested there; typecheck, lint, unit tests, build, and the empty picker were checked locally. The owner previously authorized production promotion while the product is not yet live and asked to proceed directly without staging smoke.

### Release update (2026-11-27)

The PRO-120 PO/SPK invoice price-change slice adds a server-backed bill preview, price-change requests for unbilled quantities, and stage-aware approval/rejection from the order detail and approval queue. The Accounting / All Features Postman request definitions were checked on 2026-11-27; live API requests were not executed. Typecheck, lint, all 3,576 unit tests, and production build passed locally. The owner authorized direct production promotion while the product is not yet live; staging smoke is skipped and must be stated in the production PR. Verify the actual deployment logs before calling the running production app updated.

### PRO-120 DP cancellation implementation (2026-11-27)

The PO/SPK detail now supports cancelling a request-only DP when it has no bill history or payment, with a required reason, and hides the generic payment-request cancellation path for DP. The implementation follows the live Accounting / All Features contract for `POST /v1/purchase-orders/{poId}/advances/{dpRequestId}/cancel`. The live API returned the expected required-reason validation for a whitespace-only reason and invalid fixture IDs; no purchase data was mutated because the available DP examples were not safe test fixtures. Backend rejection of DP cancellation through the separate generic endpoint is still unverified. Local typecheck, lint, formatting checks, all 3,588 unit tests, and the production build pass. The owner has authorized skipping staging smoke while the product is not public; verify production deploy logs before stating the running app was updated.

### PRO-120 purchase QA and payment detail alignment (2026-11-27)

The purchase QA revisions and payment detail parity changes were merged to `develop-frontend` in PR #295 (`d38594d`) and promoted to `staging` in PR #296 (`c80d292`). CI passed on both PRs. Staging build, image push, and SSH deployment succeeded in workflow run [#46023196981](https://github.com/Indoland-Manajemen-Properti-Terpadu/jurnal-fe/actions/runs/46023196981). Manual staging smoke was skipped under the owner's authorization while the application is not public; local visual comparison confirmed the paid Payment Request detail and active Pembayaran navigation against the Vercel prototype for the Finance role.

This slice includes the PR DP proforma workflow and cancellation gate, tax-invoice upload on bill edit, PO/SPK price-change approval mapping, approval-gated payment amounts, receipt term labels and recognition display, retention `NONE` handling, payment detail visual alignment, and related purchase summary/status corrections. The `purchases` migration row above remains unchanged. Production promotion is pending; report production as updated only after its deployment job succeeds.

Open BE/Product/QA decisions remain in the original PRO-120 threads: site/Tax account mappings (#10292), mixed FPPBJ term rules (#10287), separating physical goods receipt from billing schedules (#10288), the warranty versus retention-maintenance rule, email-send default behavior (#10289), and a safe fixture for success-path DP cancellation. These do not block the frontend promotion.

### PRO-120 PO/SPK resend behavior (2026-11-28)

The existing-order "Kirim ulang" action now sends the PDF email directly to the saved vendor address, matching the prototype; draft orders retain both manual marking and email options. This addresses the QA follow-up in comment #10314 under #10289. The focused order-action test, all 86 purchase test files (535 tests), typecheck, lint, changed-file formatting, and production build passed locally. One full local test run reported 8 failures across 2 files; the period-closing list test passed when rerun alone, so promotion remains gated on the branch CI results. Manual staging smoke is skipped under the owner's earlier pre-launch instruction; deployment status must be verified from workflow logs before reporting production as updated.

### Financial reports and local FE–BE changes (2026-11-28)

The local work for the balance sheet, profit and loss, trial balance, general ledger, cash flow, equity changes, account ledger, settings, and contacts is being promoted together. The backend changes were merged in `jurnal-be` PR #2. The frontend work branch is `codex/financial-reports-20261128`. The `reports`, `account-ledger`, `settings`, and `contacts` migration rows above remain unchanged. Sales and receivables changes already released in v0.16.0 are excluded from this batch. The owner requested production promotion of all remaining local FE–BE work. Staging smoke is unavailable because the staging Compose service is absent; record this exception in the production PR and verify the running production deploy before reporting completion.
