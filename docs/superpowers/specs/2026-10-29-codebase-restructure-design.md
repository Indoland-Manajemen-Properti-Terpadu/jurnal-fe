# Codebase Restructure, Naming, Branching and Documentation Design

**Status:** Draft for review (2026-10-29)
**Scope:** Jurnal ProApps frontend, whole repository
**Strategy:** Incremental, one feature per PR, behavior preserved, guardrails enforced by tooling
**Release cadence:** One production release per milestone (4 releases)

## 1. Intent

The codebase grew feature by feature without a shared layout. A new contributor cannot predict where a page, service, store or type lives, naming mixes Indonesian and English, several files exceed 1,000 lines, and nothing in tooling stops the mess from returning. The goal is a repository a senior engineer would be comfortable inheriting: predictable structure, one naming convention, enforced boundaries, per-feature documentation, and a branch model in which production only receives verified releases.

**Success criteria**

1. Every feature module follows one layout and one naming convention; no legacy Indonesian or mixed-case path remains.
2. Observable behavior is unchanged. Typecheck, lint, tests and build are green at every merge; critical flows pass a manual smoke test on staging before each release.
3. Module boundaries are enforced by lint, not by convention.
4. Every module has a README; the repository has one documentation index and an ADR log.
5. `main-frontend` receives only release PRs that passed the release gate.
6. `docs/migration/STATUS.md` shows every feature complete; the final release is not "done" until every row is green.

**Not in scope:** new product features, API contract changes, accounting rule changes, token storage changes, dependency upgrades, design token changes. Anything of that kind found during the work is logged in section 11 and handled only after explicit approval.

## 2. Current-state findings (audit, 2026-10-29)

| # | Finding | Evidence |
|---|---|---|
| 1 | Module folders mix PascalCase and lowercase; `Kontak` duplicates `Contact` | `src/module/*` |
| 2 | Layer folders are inconsistent: `pages` / `page` / `view`; `service` / `services` / `infrastructure` | 62 / 17 / 24 files and 35 / 4 / 4 files |
| 3 | `GeneralJournal` has 129 files, depth 5, 66 cross-module imports; 26 `Layout.tsx` wrappers across the repo | `git ls-files` |
| 4 | 14 files exceed 500 lines; the largest are `LandingPage` 1709, `AddAccountJournal` 1397, `DashboardWidgets` 1263, `ContactFormModal` 1075 | `wc -l` |
| 5 | Zustand stores live in three places and use three naming styles | `src/store`, `src/store/GeneralJournal`, `module/*/store` |
| 6 | Duplicate shared UI: two `ConfirmModal`, two `ModuleHeader`, `PageHeader` and `PageHeaderV2`; `src/examples` ships example code | `src/components`, `src/module/products` |
| 7 | i18n coverage is partial: 37 files use `useTranslation`, most UI strings are hardcoded Indonesian | `git grep` |
| 8 | 211 `any`, 43 `console.*`, 11 `eslint-disable`; ESLint only extends `mantine`, no boundary rules | `git grep` |
| 9 | `package-lock.json` and `yarn.lock` both tracked; `.vite/deps` tracked | `git ls-files` |
| 10 | 14 path aliases in `tsconfig`, effectively only `@/` is used; two HTTP clients (`src/lib/axios.ts`, `src/services/apiClient.ts`); legacy helpers `get/post/put/del` swallow errors and return `null` | `tsconfig.json`, `apiClient.ts` |
| 11 | About 12 test files; no safety net for refactoring | `git ls-files | grep test` |
| 12 | `pr-check.yml` targets `mantine-v8`, `main`, `master`, not `main-frontend`; `deploy.yml` deploys production on every push to `main-frontend` | `.github/workflows` |
| 13 | Baseline is red: vitest 1 failing file, eslint 3433 errors (mostly formatting), stylelint 48 errors, 224 files not Prettier-formatted, production SSH deploy step failing | `docs/migration/BASELINE.md` |

## 3. Decisions

### 3.1 Naming language: English everywhere in code and paths

All identifiers, file names and directory names are English. Reasons: accounting terms have standard English equivalents; project rules already require it for new code; it keeps the code searchable and onboarding simple. User-facing text stays bilingual (`id` primary, `en` secondary) through `@/i18n`; the terminology table in `PROJECT_CONTEXT.md` remains authoritative. Indonesian-only product terms (for example a tax name) are allowed as data or translation values, never as identifiers.

The abandoned branch `refactor/general-journal-indonesian-naming` goes the opposite direction. It is archived as a tag and closed after approval.

### 3.2 Strategy: incremental per feature (Option A)

One feature per PR into `develop-frontend`. A feature is migrated completely (structure, names, i18n, docs, tests) in its PR so the repository is never left half-converted inside a feature.

### 3.3 Release cadence: one release per milestone

Four production releases, section 8. Each release promotes `develop-frontend` to `staging`, soaks, passes the gate, then goes to `main-frontend` by release PR.

## 4. Target structure

### 4.1 Top level

```text
src/
  app/            composition root: providers, router, route table (moved from src/router, src/App.tsx)
  module/         feature modules (root name kept per PROJECT_CONTEXT)
  components/     shared UI only (no feature knowledge)
  lib/            http client, query client, formatters, date and money helpers
  hooks/          shared hooks
  store/          cross-feature client state only (auth, api-loading)
  i18n/           locales and hook
  theme/          tokens
  types/          shared types
  assets/
docs/             documentation index (section 9)
```

`src/router` moves to `src/app/router` only if the move stays mechanical; otherwise it stays and `app/` is skipped. This is decided in Milestone 0 with the diff in hand.

### 4.2 Feature module layout

```text
src/module/<feature-name>/
  README.md                 purpose, routes, endpoints, domain rules, status
  index.ts                  public API (only what other features may import)
  domain/                   entities, value-objects, repository ports, pure rules
  application/              use-cases, dto
  infrastructure/           api (endpoints + DTOs), mappers, repository adapters
  presentation/
    pages/                  route-level components
    components/             feature UI
    hooks/                  query and form hooks
    stores/                 feature-local Zustand stores (client state only)
```

Rules:

- Create only layers that have real content. A simple CRUD feature may have only `infrastructure/` and `presentation/`; do not add pass-through files.
- `pages/` is the only name for route components. `view`, `page`, `Layout.tsx` wrappers are removed; a wrapper that only mounts `AppShellLayout` is replaced by the page doing it directly, or by one shared layout.
- Maximum depth below a module is 4 directories.
- A file over 400 lines needs a reason in review; over 600 is split by responsibility (not by arbitrary length) during that feature's migration.
- Other features import only from `@/module/<feature>` (its `index.ts`). Deep imports across features are lint errors.

### 4.3 Sub-features become sibling modules

Large containers are flattened so each module has one responsibility. Names below are the proposal; each is confirmed against the code in that feature's migration plan.

| Current | Target modules |
|---|---|
| `GeneralJournal` (129 files) | `chart-of-accounts` (account CRUD, import/export/restore), `journal-entries`, `account-ledger` (per-account detail), `bank-statements`, `reconciliation`, `beginning-balances`, `period-closing` |
| `ResultReport` | `reports` (one page per report under `presentation/pages`; shared report utils in `reports/application`) |
| `BankCash` | `bank-cash` (overview, transfer, receive, send) and `petty-cash` |
| `SettingMenu` | `settings` (general, tax, payment terms and methods, tags, number formats, account mapping, company, approval) and `user-management` |
| `Contact` + `Kontak` | `contacts` |
| `SettingBudget` + `BudgetPlanning` | `budgeting` |

### 4.4 Rename map (module level)

| Current | Target | Current | Target |
|---|---|---|---|
| `Asset` | `assets` | `PendingChanges` | `pending-changes` |
| `Authentication` | `authentication` | `Production` | `production` |
| `Dashboard` | `dashboard` | `Profile` | `profile` |
| `Fulfillment` | `fulfillment` | `LandingPage` | `landing` |
| `Pembelian` | `purchases` | `Sale` | `sales` |
| `Cost` | `costs` | `products` | `products` |

Route constants in `routes.ts` are renamed to English where they are Indonesian-derived (for example `pembelian`, `businessSumary`). URL paths that users have bookmarked (`/pembelian`, `/kontak`) get redirects; a URL is changed only with a redirect in the same PR.

## 5. Conventions

| Item | Convention | Example |
|---|---|---|
| Feature directory | kebab-case, English, plural for collections | `journal-entries` |
| Ordinary directory | kebab-case | `bank-statements` |
| React component / page file | PascalCase, name equals export | `JournalEntryPage.tsx` |
| Hook | camelCase starting with `use` | `useJournalEntries.ts` |
| Zustand store | `use<Name>Store.ts` | `useBankStatementStore.ts` |
| Use case | verb phrase | `createJournalEntry.ts` |
| Repository port / adapter | by responsibility / `http<Name>Repository.ts` | `httpJournalEntryRepository.ts` |
| Mapper | `<type>Mapper.ts` | `journalEntryMapper.ts` |
| Other TS | camelCase | `formatCurrency.ts` |
| Types / interfaces / enums | PascalCase, no `I` prefix | `JournalEntry` |
| Constants | `SCREAMING_SNAKE_CASE` for true constants, camelCase objects | `DEFAULT_PAGE_SIZE` |
| Tests | beside the unit, `*.test.ts(x)` | `createJournalEntry.test.ts` |
| CSS Modules | same name as component | `JournalEntryPage.module.css` |
| Imports | `@/` alias only; no `../../..` chains | |
| i18n namespace | one per feature, equals feature name in camelCase | `journalEntries` |

Common Indonesian-derived names to eliminate: `Pembelian`, `Kontak`, `Periode`, `Sumary` (also a typo), `Beginning` misspellings (`useBeginingBalance`), `SentMoney` (use `send-money` / `SendMoney`).

## 6. Shared layer consolidation (Milestone 0)

1. **One HTTP client.** `src/services/apiClient.ts` moves to `src/lib/http/apiClient.ts` (interceptors unchanged). `src/lib/axios.ts` is removed after its importers move. Endpoint constants leave `src/services/endpoint.ts` and live in each feature's `infrastructure/`. Shared auth endpoints stay with `authentication`.
2. **Legacy `get/post/put/del` helpers** keep current behavior until every caller migrates, are marked `@deprecated`, and are deleted when no caller remains. Changing their error semantics is a behavior change and is listed in section 11.
3. **Stores.** Cross-feature state (`useAuthentications`, `useApiLoading`, modals) stays in `src/store`, renamed to `use<Name>Store.ts`. Everything under `src/store/GeneralJournal` and `src/store/useAccountLedger.ts` moves into the owning feature's `presentation/stores`.
4. **Components.** Pick one `ConfirmModal`, one `ModuleHeader`, one page header; migrate callers; delete the rest. `src/components/ui` is merged into `src/components` or removed. `src/examples` is deleted after confirming nothing imports it.
5. **Aliases.** Keep `@/*` and `@test-utils`. Remove the other 12 after confirming zero usage.
6. **Repo hygiene.** Remove `package-lock.json` (Yarn 4 is pinned); untrack `.vite/` and add it to `.gitignore`; repair the truncated `.gitignore` comments; keep `yarn.lock` untouched.

## 7. Guardrails (enforced in CI)

All with existing dependencies; no new package.

- `import/no-restricted-paths` (from `eslint-plugin-import`, already installed): features cannot import another feature's internals; `domain` and `application` cannot import `presentation`, `infrastructure`, React, Mantine, Axios or Zustand; `components` cannot import `module`.
- `no-restricted-imports`: forbid `axios` and `@/lib/http` outside `infrastructure/` and `lib/`; forbid `../../..` relative chains.
- `@typescript-eslint/no-explicit-any` at `warn` first, with a ratchet: the count may not increase; each migrated feature must reach zero in its own files, then the rule is `error` for migrated paths.
- `no-console` (allow `warn`/`error` only through one logger helper) for migrated paths.
- `max-lines` warn at 400 for migrated paths.
- A route-manifest test: every entry in `routes.ts` resolves to a rendered page in the router table, so a broken move fails CI.
- CI: `pr-check.yml` runs on PRs to `develop-frontend`, `staging`, `main-frontend`. Vitest becomes blocking once the baseline is green. A commit-message check enforces Conventional Commits.

## 8. Migration procedure, milestones and releases

### 8.1 Per-feature procedure and Definition of Done

For each feature, in its own branch `refactor/<feature>`:

1. Read the feature and write `docs/superpowers/plans/<date>-<feature>-migration.md` (current tree, target tree, rename map, file splits, risks).
2. Commit 1 is a pure move (`git mv`, import paths only) so history follows files.
3. Later commits: naming, layer separation (HTTP out of views, business rules to `domain`/`application`), file splits, i18n for all user-facing strings, `any`/`console` cleanup.
4. Add or keep tests for moved domain logic; characterization tests where logic is extracted.
5. Write the module `README.md`; update `docs/migration/STATUS.md`.
6. Run `typecheck`, `lint`, `prettier`, `vitest`, `build`; review the diff; open PR to `develop-frontend`.

A feature is Done when: layout and names match sections 4 to 5; no cross-feature deep imports; no HTTP in presentation; no `any` or `console` in its files; all strings in `id` and `en`; README written; checks green; STATUS row green.

### 8.2 Milestones and releases

| Milestone | Content | Release |
|---|---|---|
| **M0 Foundation** | Branch model, CI, guardrails, baseline record, repo hygiene, shared layer consolidation (section 6), docs skeleton | with R1 |
| **M1 Small and isolated** | `contacts` (merge `Kontak`), `products`, `sales`, `purchases`, `assets`, `pending-changes`, `profile`, `landing`, `dashboard`, `budgeting`, `costs`, `production`, `fulfillment` | **R1** for the ten finished modules; `contacts`, `sales`, `dashboard` move to **R3** (revised, see STATUS.md) |
| **M2 Cash and reporting** | `bank-cash`, `petty-cash`, `reports` | **R3** (revised, see STATUS.md) |
| **M3 Core ledger** | The seven modules split out of `GeneralJournal` | **R2** (revised, see STATUS.md) |
| **M4 Platform** | `settings`, `user-management`, `authentication`, final audit, docs finalization, ratchets turned to `error` repo-wide | **R4 (final)** |

Order inside a milestone goes from least to most connected. `authentication` is last on purpose: it is the highest-risk flow and benefits from every guardrail already being in place.

Milestone 0 begins by recording a baseline (do `typecheck`, `lint`, `vitest`, `build` pass today, and with how many warnings). Pre-existing failures are reported and fixed or waived in a documented list; they are never hidden.

### 8.3 Behavior-preservation checks

- `git mv` first, edits second, to keep reviewable diffs.
- Route-manifest test and, per feature, a short manual smoke list in the PR (screens opened, one create/edit/delete where the feature has them).
- No change to API payloads, query keys' semantics, or rendered accounting values. If a refactor needs one, it stops and goes to section 11.

## 9. Documentation system

```text
AGENTS.md                      loader only (unchanged role)
.codex/PROJECT_CONTEXT.md      engineering rules (updated: structure, naming, boundaries, migration status)
.codex/workflows/*             task workflows (kept; feature-refactor.md updated to this spec)
README.md                      product overview and setup only; links to docs/
docs/
  README.md                    documentation index
  architecture.md              layers, dependency direction, data flow, state ownership
  conventions.md               section 5 plus code and test examples
  branching-and-release.md     section 10
  adr/NNNN-<title>.md          decisions: English naming, feature-sibling modules, single HTTP client, release cadence
  migration/STATUS.md          one row per feature, one column per Definition-of-Done item
  modules/README.md           index linking every module README
  petty-cash/                  existing PRD and API spec moved here (files not deleted or rewritten)
src/module/<feature>/README.md purpose, routes, endpoints used, domain rules, state, i18n namespace, tests, known gaps
```

Provider adapters (`GEMINI.md`, `STYLING_GUIDE.md`, `.github/instructions/*`, `.github/agents/*`, `.github/commands/*`) stay as thin pointers; duplicated rules in them are replaced with links to `PROJECT_CONTEXT.md`. The PR template's "Area Terdampak" list is regenerated from the module list.

## 10. Branch and release model

```text
main-frontend      production; release PRs only; protected
staging            QA/soak; auto-deploys to staging environment
develop-frontend   integration; all work lands here by PR
refactor/*, feat/*, fix/*, docs/*   short-lived, squash-merged into develop-frontend
hotfix/*           from main-frontend; back-merged to staging and develop-frontend
```

- Promotion: `develop-frontend` to `staging` to `main-frontend`. Each hop is a PR with required checks. Releases are tagged `vMAJOR.MINOR.PATCH`.
- `main-frontend` is merged into `develop-frontend` after every hotfix and at least weekly during the migration to limit rename conflicts.
- Release gate (added to the PR template): typecheck, lint, tests and build green; staging soak with smoke test of login, chart of accounts, journal entry, cash and bank, reports, sales; STATUS.md updated; no unintended behavior change.
- Because `deploy.yml` deploys on push, direct pushes to `main-frontend` and `staging` must be prevented. **Status (2026-10-29):** the organization is on the GitHub Free plan, where branch protection is unavailable for private repositories. The repository was made public, which enabled it. Classic branch protection is now applied with `enforce_admins`, no force push, no deletion, conversation resolution required, and a required PR: `main-frontend` requires 1 approval, `staging` and `develop-frontend` require 0 (so a solo maintainer can still merge). Required status checks are added in Milestone 0 once `pr-check.yml` runs on these branches (adding them earlier would block every PR). Defense in depth also ships in Milestone 0:
  1. A guard job in `deploy.yml`: the deploy job `needs` it, and it fails unless the pushed commit belongs to a merged PR whose base is `main-frontend` (head `staging` or `hotfix/*`) or `staging` (head `develop-frontend`). A direct push still lands but does not deploy.
  2. An optional local `pre-push` hook (committed under `.githooks/`, enabled with `git config core.hooksPath .githooks`) that refuses direct pushes to those two branches. It is per-clone and bypassable, so it is a convenience, not a control.
  3. The PR template release gate and the documented process.
- `develop-frontend` was created on the remote from `main-frontend` (`94fe9ca`) on 2026-10-29; it triggers no deploy.
- Existing branches get an audit table (author, last commit, merged or not). Nothing is deleted without approval. `refactor/general-journal-indonesian-naming` is proposed for archival as a tag.

## 11. Needs confirmation before implementation

These are real problems found, but each changes behavior, a contract, a dependency or an external system, so none is done without a separate yes.

1. Money arithmetic: audit for JavaScript floating-point on money and agree one representation and rounding with backend (the petty-cash spec says `DECIMAL(18,2)`, the frontend prototype uses integer IDR).
2. Legacy HTTP helpers swallow errors and return `null` or the Axios response; moving to throwing semantics changes caller behavior.
3. Tokens in `localStorage` (existing approved flow; unchanged unless approved).
4. Placeholder modules (`BudgetPlanning`, `Cost`, `Production`, `Fulfillment`): keep as documented stubs, or remove from navigation until built.
5. Petty-cash status vocabulary mismatch between the approved frontend lifecycle and `API-SPEC-Petty-Cash-Backend.md`.
6. Making Vitest blocking in CI and enabling the lint ratchets.
7. Deleting or archiving remote branches needs approval. (Branch protection itself is done; see section 10.)
10. The repository is now public, so its full git history is public. A history scan found no private keys or `.env` files. It did find six JWTs inside `Jurnal Proapps.postman_collection.json` (added in `080d5b0`, removed in `5e75c08`); all are expired (latest expiry May 2026), so no rotation is needed. The collection (about 18k lines) still documents internal API structure and example data in history. Decide whether that is acceptable or whether history is purged (`git filter-repo` plus force push, which rewrites every SHA and needs coordination). Also review whether public docs should keep naming competitor brands, since `PROJECT_CONTEXT.md` lists them in its neutrality rule.
8. URL path renames (`/pembelian`, `/kontak`) with redirects.
9. Moving untracked PRD/API-spec PDFs and the empty `petty-cash-prd.md` into `docs/petty-cash/`.

## 12. Risks

| Risk | Mitigation |
|---|---|
| No test net | Baseline, `git mv`-first commits, route-manifest test, per-feature smoke list, small PRs |
| Merge conflicts with parallel work (`dev-sanz`, `feat-coa`) | Weekly sync from `main-frontend`; announce migration order; migrate a feature in days, not weeks |
| `GeneralJournal` split is the largest change | Dedicated milestone, per-module plans, split only along seams the code already shows |
| i18n pass multiplies effort | Done per feature, as part of its Definition of Done, with `id` first and `en` equivalents using the terminology table |
| Production deploys on push | Protection rules, release PRs only, staging soak |

## 13. Effort shape (for planning, not a promise)

M0 is small but must come first and ship carefully. M1 is many small PRs. M2 is medium. M3 is the longest. M4 is medium plus final audit. The implementation plan will size each feature after reading it.
