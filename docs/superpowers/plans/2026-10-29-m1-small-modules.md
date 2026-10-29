# Milestone 1 (Small and Isolated Modules) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans (the user chose native, inline execution). Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate the 13 small modules to the feature-first layout, English names, i18n, README and tests, then release them together with M0 as R1.

**Architecture:** One `refactor/<module>` branch and one PR into `develop-frontend` per module, in the order below (least to most connected). Every task follows the **Module Migration Procedure** in this plan; the tasks only carry what differs per module. Because `src/router/index.tsx` imports every page, PRs are merged one at a time and each later branch starts from the updated `develop-frontend`.

**Tech Stack:** React 18, TypeScript strict, Vite 5, Mantine 8, TanStack Query 5, Zustand, Vitest, ESLint ratchet, Yarn 4.

**Spec:** [`../specs/2026-10-29-codebase-restructure-design.md`](../specs/2026-10-29-codebase-restructure-design.md), sections 4, 5, 8.1, 8.3. This document is also the per-feature migration plan that section 8.1 step 1 asks for, for all M1 modules (ruling R1 below).

## Global Constraints

- English for every identifier and path; kebab-case folders; PascalCase component files; user-facing text in `id` and `en` through `useTranslation('<namespace>')` from `@/i18n`.
- Layout per module: `README.md`, `index.ts`, and only the layers with real content: `domain/`, `application/`, `infrastructure/`, `presentation/{pages,components,hooks,stores}`.
- Other code imports a module only from `@/module/<module>` (its `index.ts`). `src/components` never imports `src/module`. No `../../../` chains. Axios only in `infrastructure/`.
- No `any`, no `console.*`, files at most 400 lines in migrated modules.
- No `Layout.tsx` wrappers: pages render `AppShellLayout` from `@/components/AppShellLayout` directly.
- No change to API payloads, endpoint URLs, query-key semantics or rendered accounting values (spec 8.3). A refactor that needs one stops and is reported to the user.
- The ESLint ratchet may only go down. After a module lowers counts: `node scripts/eslintRatchet.mjs --write-baseline` and commit it with the module.
- Commits: Conventional Commits with scope = module, ending with `Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>`. PR bodies end with `🤖 Generated with [Claude Code](https://claude.com/claude-code)`.
- Commit 1 of every module is a pure `git mv` (plus import-path fixes). Never mix a rename and an edit in that commit.
- Gate for every module (all must pass before the PR is opened): `yarn typecheck`, `rtk proxy npm run lint`, `npm run prettier:changed`, `yarn vitest --run`, `yarn build`. (`rtk proxy` because the local rtk filter makes `npm run lint` look like exit 1.)
- `develop-frontend` requires the `test-and-build` check; `main-frontend` requires 1 approval. A PR is merged only after its check is green.

## Review Focus

- **Money in `sales`, `purchases`, `assets`, `dashboard`:** amounts with decimals (`1500.50`), a quantity with decimals times a price, tax 11 % of a value that does not divide evenly. Result must equal the current displayed value for whole-rupiah inputs and must not introduce `0.30000000000000004`-style artefacts.
- **Bookmarked URLs:** `/pembelian` and `/kontak` keep working (redirect) after the English rename.
- **Persisted browser data:** `purchases` and `assets` store dummy data in `localStorage`; the storage keys and shape must not change, otherwise users lose their data.
- **Empty and error states:** moving HTTP out of pages must not turn an API error into an infinite spinner or a crash; legacy helpers swallow errors, the new repository must surface them to the query hook.
- **Language switch:** every migrated string renders in both `id` and `en`; a missing key must not render the raw key silently (check `translate` fallback in `src/i18n/store.ts`).

## Rulings made while planning (carried into the ledger)

- **R1:** This master plan replaces the per-feature plan documents of spec 8.1 step 1. It is cheaper and the per-module facts are below; a module's mapping is the rule table plus its listed target tree. Cost if wrong: a reviewer wants a separate plan file per module.
- **R2:** Keep URL paths as they are, except Indonesian ones. `/pembelian` becomes `/purchases` with a redirect from `/pembelian`; `/kontak` already redirects to `/contact` and stays. Route constant keys that are Indonesian-derived are renamed (`baseModules.pembelian` to `baseModules.purchases`). Cost if wrong: one more redirect to maintain.
- **R3:** Browser smoke tests are not automated (pages need a login and a live API). Behavior is protected by the route-manifest test, characterization tests of extracted domain logic, typecheck and build; each PR lists a manual smoke checklist for the user. Cost if wrong: a UI regression is found by the user instead of a test.
- **R4:** `localStorage`-backed dummy data (`purchases`, `assets`) moves behind a repository port with a `localStorage` adapter; keys and shapes are unchanged. Cost if wrong: none, adapter is swappable when the backend exists.
- **R5:** `SettingBudget/BudgetManagement` is unreferenced anywhere in `src` (the router serves `/setting-budget/budget-management` from `ResultReport`). Task 2 re-checks and deletes it if still unreferenced. Cost if wrong: restore from git.

## Module Migration Procedure (applies to every module task)

**Inputs per module:** current folder, target folder, target tree, notes (from the task).

**File mapping rules** (current to target, inside `src/module/<target>/`):

| Current | Target |
|---|---|
| `view/*Page.tsx`, `page/*`, `pages/*` | `presentation/pages/<Name>Page.tsx` |
| `view/Layout.tsx`, `pages/Layout.tsx` | deleted; page renders `AppShellLayout` directly |
| `components/**` | `presentation/components/**` |
| `hooks/**` | `presentation/hooks/**` (query hooks), pure helpers to `application/` |
| `infrastructure/*Api.ts`, `services/*`, `service/*` | `infrastructure/` (`<name>Api.ts`, repository adapters, mappers) |
| `types/*` | `domain/<name>.ts` (entities) and `infrastructure/<name>Dto.ts` (API shapes) |
| `utils/*Format.ts` | `domain/` if pure rules, else `application/` |
| `*.module.css`, `*.stories.tsx` | beside the component |

- [ ] **Step 1: Branch.** `git fetch origin && git checkout -B refactor/<target> origin/develop-frontend`.
- [ ] **Step 2: Pre-move baseline.** Record `rtk proxy npx eslint src/module/<current> --ext .ts,.tsx -f json` rule counts in the ledger and run `yarn vitest --run` (all green).
- [ ] **Step 3: Pure move commit.** `git mv` per the mapping rules and the task's target tree; fix only import paths (`@/module/<target>/...`) in moved files and in outside importers (`src/router/index.tsx`, and where listed `src/components/Navbar/page.tsx`). Run `yarn typecheck`. Commit `refactor(<target>): move files to feature layout`.
- [ ] **Step 4: Rename commit.** Rename Indonesian-derived or misspelled identifiers and files (task lists them), delete `Layout.tsx` wrappers, add `index.ts` exporting only what outside code uses (`export { default as <Name>Page } from './presentation/pages/<Name>Page';`, hooks the Navbar needs). Point the router at `@/module/<target>`. Run `yarn typecheck && yarn vitest --run`. Commit.
- [ ] **Step 5: Characterization tests first (RED to GREEN where logic is extracted).** For every pure rule currently inside a page, component or hook (totals, status derivation, formatting, mapping), write a test of the current behavior beside the code and run it against the existing implementation (it must pass before the extraction), then extract to `domain/` or `application/` and re-run. Money sums use `@/lib/money`; the test includes a decimal case from Review Focus.
- [ ] **Step 6: Layering.** Move every HTTP call and endpoint string out of pages, components and hooks into `infrastructure/`; add a repository port in `domain/` only where a second implementation exists (`localStorage` or HTTP) or the rule is tested through it. Query hooks call the repository; errors reach TanStack Query (no swallowed `null`). Replace legacy `get/post/put/del/patch` with the default `apiClient`; keep endpoints and payloads identical.
- [ ] **Step 7: Split oversized files** (over 400 lines, listed per task) by responsibility, not by line count, then re-run typecheck.
- [ ] **Step 8: i18n.** Find hard-coded user-facing strings with `grep -rnE ">[^<{}]*[A-Za-z]{3,}[^<{}]*<|(title|label|placeholder|description|message)=\"" src/module/<target>` and move each into `src/i18n/locales/{id,en}/<namespace>.ts`, registered in each locale `index.ts`. The `id` text is the current text verbatim; `en` is added. Add one test per namespace asserting `id` and `en` define the same keys.
- [ ] **Step 9: Debt cleanup.** Remove `any` (use real types or `unknown` plus narrowing), `console.*`, unused variables and imports, and cycles inside the module's files.
- [ ] **Step 10: README.** `src/module/<target>/README.md` with: purpose, routes, endpoints, domain rules, state ownership, i18n namespace, known gaps. Update the row in `docs/modules/README.md` (link) and the row in `docs/migration/STATUS.md` (all columns `done` that are true; never mark a column `done` that is not).
- [ ] **Step 11: Ratchet.** `node scripts/eslintRatchet.mjs --write-baseline`; the baseline total must be lower than before the module (`git diff docs/migration/eslint-baseline.json`).
- [ ] **Step 12: Gate.** Run the five gate commands from Global Constraints and read the output. Run `yarn dev` and open each route of the module with Playwright, checking the console for errors (the app redirects to `/login` without a session; that is expected and noted in the PR).
- [ ] **Step 13: PR and merge.** Push, open the PR into `develop-frontend` with the manual smoke checklist (screens, one create/edit/delete where they exist), wait for `test-and-build`, merge with a merge commit, then return to Step 1 for the next module.

---

### Task 1: costs, production, fulfillment (placeholders)

**Files:** `Cost/view/{CostPage,Layout}.tsx`, `Production/view/{ProductionPage,Layout}.tsx`, `Fulfillment/view/{FulfillmentPage,Layout}.tsx` (each 29 lines, `BaseModulePage` with a title).

**Interfaces:**
- Produces: `@/module/costs` exports `CostPage`; `@/module/production` exports `ProductionPage`; `@/module/fulfillment` exports `FulfillmentPage` (default pages re-exported by name).

**Target tree (each of the three):** `README.md`, `index.ts`, `presentation/pages/<Name>Page.tsx`. No domain or infrastructure.

- [ ] Follow the procedure with these specifics: three modules, one branch `refactor/placeholder-modules`, three commits (one per module) after the shared pure-move commit. Titles and descriptions ("Biaya", "Modul dasar ... menyusul ...") move to i18n namespaces `costs`, `production`, `fulfillment` (`id` verbatim). Test per page: renders the title in `id` and `en` (assert through `render` from `@test-utils`). READMEs say the module is a placeholder awaiting a product decision.
- [ ] STATUS rows: Structure, Names, i18n, Docs, Tests `done`.

### Task 2: budgeting

**Files:** `BudgetPlanning/view/{BudgetPlanningPage,Layout}.tsx` (placeholder), `SettingBudget/BudgetManagement/pages/BudgetManagementPage.tsx` (222 lines, unreferenced).

**Interfaces:**
- Produces: `@/module/budgeting` exports `BudgetPlanningPage`.
- Consumes: nothing. The router entry for `/setting-budget/budget-management` stays on the `ResultReport` page until M2.

- [ ] **Step 1: Re-check R5.** `grep -rn "SettingBudget/" src` and `grep -rn "BudgetManagementPage" src`. If the `SettingBudget` page is still unreferenced, delete it in its own commit `chore(budgeting): remove unreferenced SettingBudget page`; if it is referenced, migrate it to `presentation/pages/BudgetManagementPage.tsx` and ledger a ruling.
- [ ] **Step 2:** Follow the procedure for `BudgetPlanningPage` (placeholder; i18n namespace `budgeting`). Record in `docs/migration/BASELINE.md` "Needs decision" that `routes.SettingBudget.BudgetIS` is still an orphan owned by M2 `reports`; do not touch `KNOWN_ORPHANS`.

### Task 3: landing

**Files:** `LandingPage/pages/{LandingPage.tsx (1709 lines), LandingPage.module.css, Layout.tsx}`, `components/HeaderLandingPage/*`.

**Target tree:** `index.ts`, `presentation/pages/LandingPage.tsx` (composition only), `presentation/components/{HeaderLandingPage,<Section>}.tsx` (one component per visual section of the page), `presentation/pages/LandingPage.module.css`, `README.md`.

- [ ] Procedure with: Step 7 split `LandingPage.tsx` by section (hero, features, pricing/steps, footer: read the file to name them; each file at most 400 lines); marketing copy moves to namespace `landing` in `id` (verbatim) and `en`; section text arrays become typed constants beside their section. Tests: a render test of `LandingPage` in `id` and `en` asserting the headline and the CTA link target (`routes.login` or equivalent) are unchanged.
- [ ] Note in the PR that the page is public (no login needed), so Step 12 can click through it fully.

### Task 4: profile

**Files:** `Profile/pages/ProfilePage.tsx (890 lines)`, `Profile/service/Profile.service.ts`.

**Target tree:** `index.ts`, `domain/profile.ts`, `infrastructure/{profileApi.ts,profileMapper.ts}`, `presentation/{pages/ProfilePage.tsx,components/<Form sections>,hooks/useProfileQueries.ts}`, `README.md`.

- [ ] Procedure with: `Profile.service.ts` (capitalized, dotted) becomes `infrastructure/profileApi.ts`; split the page into sections plus a `useProfileQueries` hook; namespace `profile`. Characterization test for any validation rule (password, phone, email) extracted from the page. Reuse `@/store` auth user rather than a second copy.

### Task 5: pending-changes

**Files:** `PendingChanges/{hooks/usePendingChangesQueries.ts,pages/PendingChangesPage.tsx (879),services/pendingChangesApi.ts,types/pendingChange.ts}`.

**Interfaces:**
- Produces: `@/module/pending-changes` exports `PendingChangesPage` and `usePendingChangesCount` (the hook `src/components/Navbar/page.tsx:37` imports).
- Consumes: i18n namespace `pendingChanges` already exists (`src/i18n/locales/*/pendingChanges.ts`); reuse it, add only missing keys.

**Target tree:** `index.ts`, `domain/pendingChange.ts`, `infrastructure/{pendingChangesApi.ts,pendingChangeDto.ts,pendingChangeMapper.ts}`, `presentation/{pages/PendingChangesPage.tsx,components/<table, detail drawer, filters>,hooks/usePendingChangesQueries.ts}`, `README.md`.

- [ ] Procedure with: Step 4 also updates `src/components/Navbar/page.tsx` to `import { usePendingChangesCount } from '@/module/pending-changes'`. This does not break the rule "components never import modules" because the Navbar import is listed in the lint baseline; leave it counted, and add a README "known gap": a shared component depending on a feature (to be fixed in M4 with the layout move). 10 `any` become typed DTOs. Status vocabulary (pending, approved, rejected) becomes a domain union type with a test.

### Task 6: purchases

**Files:** `Pembelian/{components/{CreatePurchaseModal,PayPurchaseModal,PurchaseStatsGrid,PurchaseTable}.tsx,hooks/usePurchases.ts,services/purchaseStorage.ts,types/purchase.ts,view/{Layout,PembelianPage}.tsx}`; `Kontak/view/{KontakPage,Layout}.tsx` is handled in Task 11.

**Interfaces:**
- Produces: `@/module/purchases` exports `PurchasesPage`; route `routes.purchases.main = '/purchases'`; `/pembelian` redirects to it (R2).

**Target tree:** `index.ts`, `domain/{purchase.ts,purchaseTotals.ts,purchaseTotals.test.ts,purchaseRepository.ts}`, `infrastructure/localStoragePurchaseRepository.ts` (key `jurnal_purchase_bills_data`, seed `INITIAL_PURCHASE_BILLS` unchanged), `presentation/{pages/PurchasesPage.tsx,components/...,hooks/usePurchases.ts}`, `README.md`.

- [ ] Procedure with: file `PembelianPage` to `PurchasesPage`; the `quantity * unitPrice`, tax and remaining-amount arithmetic moves to `purchaseTotals.ts` using `toMinor`/`sumMinor`; characterization tests include `quantity 2.5 x 150000`, tax 11 % of `18500000` (expect `2035000`, matches the seed), and a decimal price. Add a routes test case that `/pembelian` renders a redirect to `/purchases`. Remove the `console` call. Seed text (Indonesian vendor names) is data, not UI strings: leave it.

### Task 7: assets

**Files:** `Asset/{components/*(6),hooks/useAssets.ts,pages/AssetDetailPage.tsx (624),services/assetStorage.ts,types/asset.ts,view/{AssetPage,Layout}.tsx}`; `AssetTable.tsx` 662 lines, `AssetFormModal.tsx` 446.

**Target tree:** `index.ts`, `domain/{asset.ts,depreciation.ts,depreciation.test.ts,assetRepository.ts}`, `infrastructure/localStorageAssetRepository.ts` (existing key and shape), `presentation/{pages/{AssetPage,AssetDetailPage}.tsx,components/...,hooks/useAssets.ts}`, `README.md`.

- [ ] Procedure with: i18n namespace `assets` already exists (`src/i18n/locales/*/assets.ts`): reuse and fill gaps. Depreciation schedule, net book value and disposal gain or loss become pure functions in `depreciation.ts` with characterization tests (straight-line, one decimal year, disposal above and below book value) using the money helper. Split `AssetTable.tsx`, `AssetDetailPage.tsx`, `AssetFormModal.tsx` under 400 lines. Three `console` calls removed. Routes `/assets`, `/asset`, `/assets/:id` unchanged.

### Task 8: products

**Files:** `products/{components/{MasterDataPanel,ModuleHeader,ProductForm (556),ProductTable}.tsx,hooks/useProductQueries.ts,infrastructure/productApi.ts,pages/{ProductDetailPage (705),ProductsPage}.tsx,types/product.ts,utils/productFormat.ts}`.

**Target tree:** `index.ts`, `domain/{product.ts,productFormat.ts,productFormat.test.ts}`, `infrastructure/{productApi.ts,productDto.ts,productMapper.ts}`, `presentation/{pages,components,hooks}`, `README.md`.

- [ ] Procedure with: `productFormat.ts` moves to `domain/` with tests; `MasterDataPanel`/`ModuleHeader` are generic: if another module imports them (check), leave a note instead of moving to `src/components`. Split `ProductDetailPage` and `ProductForm`. Namespace `products`. Fix the 1 HTTP-in-presentation file.

### Task 9: sales

**Files:** `Sale/{components/{CreateSaleModal (589),PaySaleModal,SaleStatsGrid,SaleTable}.tsx,hooks/useSaleQueries.ts,infrastructure/saleApi.ts,pages/{SaleDetailPage (759),SaleMainPage}.tsx + SaleDetailPage.module.css,types/sale.ts,utils/saleFormat.ts}`.

**Target tree:** `index.ts`, `domain/{sale.ts,saleTotals.ts,saleTotals.test.ts,saleFormat.ts}`, `infrastructure/{saleApi.ts,saleDto.ts,saleMapper.ts}` (the 18 `Number(...)` parse sites live in the mapper), `presentation/...`, `README.md`.

- [ ] Procedure with: namespace `saleDetail` exists; create `sales` for list/create pages and keep `saleDetail` for the detail page (module README documents both). Signed adjusted amounts: characterization tests for positive and negative adjustments and a decimal amount. 18 `any` removed through typed DTOs. Route constants `routes.sales.*` unchanged.

### Task 10: dashboard

**Files:** `Dashboard/{components/{DashboardHero,DashboardWidgets (1263),SpatialFinancialCanvas (648)}.tsx + dashboard.module.css,domain/{dashboardMetrics,dashboardTypes}.ts + dashboardMetrics.test.ts,hooks/useDashboardQueries.ts,index.ts,infrastructure/dashboardApi.ts,page/{layout,page (504)}.tsx}`.

**Target tree:** `index.ts` (keeps current exports plus `DashboardPage`), `domain/` (stays), `infrastructure/` (stays), `presentation/{pages/DashboardPage.tsx,components/<one file per widget>,hooks/useDashboardQueries.ts}`, `README.md`.

- [ ] Procedure with: this module already has a layered core and a test; keep it green throughout. `DashboardWidgets.tsx` splits into one file per widget (read the file for the list); namespace `dashboard` exists. The 23 money sites (`toNumber`, 6-month totals, aging buckets, balance sums) in mappers and `dashboardMetrics` switch to `@/lib/money` with the existing test extended by decimal cases; displayed values for whole-rupiah data must be unchanged.

### Task 11: contacts (largest, last)

**Files:** `Contact/` (33 files, 6313 lines) and `Kontak/view/{KontakPage,Layout}.tsx`. Oversized: `ContactFormModal.tsx` 1075, `TransactionDetailByContact.tsx` 493, `TableTransactionByContact.tsx` 443, `contactApi.ts` 432, `ContactTable.tsx` 418, `DetailContact.tsx` 404.

**Interfaces:**
- Produces: `@/module/contacts` exports `ContactMainPage`, `AddContactPage`, `DetailContactPage`, `TransactionDetailByContactPage`.
- Consumes: namespace `contactDetail` (exists) plus new `contacts`.

**Target tree:** `index.ts`, `domain/{contact.ts,contactFormat.ts,contactFormat.test.ts}`, `infrastructure/{contactApi.ts (split into contactApi, contactDto, contactMapper),...}`, `presentation/{pages/{ContactMainPage,AddContactPage,DetailContactPage,TransactionDetailByContactPage}.tsx,components/{form,tables,tabs,stats},hooks/{useContactQueries,useContactTransactionView}.ts}`, `README.md`.

- [ ] **Step 1: Resolve `Kontak`.** `Kontak/view/KontakPage.tsx` is a 29-line placeholder behind `/kontak`, which already redirects to `/contact`; check it has no importer, then delete it.
- [ ] **Step 2:** Follow the procedure in three PRs to keep each reviewable: (a) pure move, rename (`view/AddContact.tsx` to `AddContactPage.tsx`, `DetailContact.tsx` to `DetailContactPage.tsx`, `draftbankinformation.tsx` to `DraftBankInformation.tsx`, `TabsEmploye` to `TabsEmployee`), layering; (b) split the oversized files, i18n, `any` removal; (c) README, tests, ratchet. Each PR passes the full gate. Characterization tests cover `contactFormat` and the transaction-view derivation in `useContactTransactionView`.
- [ ] **Step 3:** Remove `StatsBankCashGrid`/`StatsBankCashCard`/`StatsGrid.stories` if Task 11 finds they are unused by `Contact` (check importers; they are named for BankCash and may belong to `bank-cash` in M2: then leave a note in `docs/migration/STATUS.md` and move them with `git mv` into `bank-cash` only if `BankCash` imports them).

### Task 12: R1 release (M0 + M1)

**Interfaces:**
- Consumes: all module PRs merged into `develop-frontend`, `docs/migration/STATUS.md` M1 rows done.

- [ ] **Step 1: Final M1 audit on `develop-frontend`.** Re-run the gate; `rtk proxy npm run lint` ratchet total lower than the M0 total (1370); `grep -rn "module/\(Contact\|Kontak\|Sale\|Pembelian\|Asset\|PendingChanges\|Profile\|LandingPage\|SettingBudget\|BudgetPlanning\|Cost\|Production\|Fulfillment\)\b" src` returns nothing; update `docs/migration/BASELINE.md` with an "After Milestone 1" table and STATUS.
- [ ] **Step 2: Required checks.** Apply `"required_status_checks": { "strict": true, "contexts": ["test-and-build"] }` to `staging.json` and `main-frontend.json` once `test-and-build` has run on a PR into each (it runs for the promotion PRs below); commit the payload changes through a PR.
- [ ] **Step 3: Promote.** PR `develop-frontend` to `staging` (merge commit, check green). Verify the deploy guard accepts the push. Then PR `staging` to `main-frontend`; it needs 1 approval (`enforce_admins`), so stop here and report to the user that the production release awaits their approval and that the SSH deploy step is a known failure (BASELINE). Do not bypass protection.
- [ ] **Step 4:** Update STATUS: M1 `done`, release R1 recorded with the commit SHA and date.
