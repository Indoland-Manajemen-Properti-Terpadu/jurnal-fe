# beginning-balances

Opening balances of the general ledger: the user picks a conversion (cut-off) date, enters a debit or credit amount per account, saves a draft, and publishes when the totals match.

- **Route** (unchanged): `routes.beginningBalances.main` (`/general-journal/beginning-balance`).
- **Public API (`index.ts`):** `BeginningBalancePage` (router), `BeginningBalanceModal` (start modal opened from the General Journal page) and `useDraftAccount` (that page reads `draftAccounts?.status === false` to decide between the modal and the page).
- **Endpoints** (`API_ACCOUNT`): `GET get/draft-start-amount`, `GET get/draft-start-amount/logs`, `POST set/draft-start-amount`, `POST set/save-start-amount`. The account list comes from `useJournalAccounts` in `@/module/chart-of-accounts`.
- **Layers:** `domain/` (types, `openingBalanceRules.ts`), `infrastructure/` (`draftBalanceApi.ts`, `draftBalanceMapper.ts`), `presentation/` (page, components, hooks, `useInitialBalanceStore`).

## Domain rules

- **I4:** publish only when total debit equals total credit and is above zero (`canPublishOpeningBalance` from `@/lib/accounting`); saving a draft is allowed unbalanced; amounts are integers only (every non digit is stripped, so `1.500,50` reads as 150050); a row holds one side (typing a positive value clears the other side). Pre-publish order: empty, then unbalanced, then ready.
- **I5:** the suggested side comes from `isDebitNormal` (backend `category.isDebit`, then Indonesian keyword fallback). The table has no contra handling. A value on the non normal side only shows a "contra side" badge; it is not blocked.
- Tests: `domain/openingBalanceRules.test.ts` (I4 and I5 assertions moved unchanged from the old page and table tests), `presentation/components/TableBeginningBalance.test.tsx`.

## Backend payload (do not simplify)

Draft and publish send `{ period, balances, accounts }` where `accounts` is the same array as `balances`, and every line is `{ account, accounts, debit, credit }` with `account` and `accounts` both holding the id. The duplicate keys are kept for backend compatibility.

## Draft shape

The draft endpoint answers `{ data: draft }` or the bare draft; `toDraftBalance` unwraps either (tested). On an HTTP error response the error body is still read as the draft, because the "no draft yet" answer is `status: false`; only network errors reach TanStack Query.

## State

`useInitialBalanceStore` (Zustand) keeps the chosen conversion date between the start modal and the page. Query keys unchanged: `draftAccounts`, `draftBalanceLogs`.

## i18n

Namespace `beginningBalances` (`id` text verbatim from the old code and the `journal` keys, `en` added), parity test in `src/i18n/locales/beginningBalances.test.ts`. The old `journal` keys for this page stay because other screens share some of them.

## Known gaps

- The merge effect reads `conversionDate` but does not list it as a dependency. This is intentional: adding it would re-merge the draft over the amounts being typed when the date changes. Not changed.
- No guard against double counting a parent and its children, and no cut-off versus earliest journal check (see the M3 plan, "Not enforced today").
- Amounts are plain numbers summed with floats; whole-rupiah integers only, so no drift.

## Amount entry (2026-10-31)

The debit and credit fields accept the Indonesian format: comma as the decimal mark and dots as thousands (`1.500,50` is 1500.50), also `1500.5` and plain integers, rounded to the cent. Before, every non-digit was dropped and `1.500,50` became 150050. The text being typed stays visible until the field loses focus, so a trailing comma or decimal digits are not reformatted away.
