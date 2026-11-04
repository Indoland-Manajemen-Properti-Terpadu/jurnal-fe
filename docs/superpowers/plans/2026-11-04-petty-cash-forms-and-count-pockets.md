# Petty cash: form pages revamp and cash count per pocket (stage 4)

Scope: `src/module/petty-cash` and its i18n files only. No commit, no staging. `src/module/settings/presentation/pages/TagSettingPage.tsx` has the user's own uncommitted change: never touch it.

Read first: `AGENTS.md`, `docs/ui-guidelines.md`, `src/module/petty-cash/README.md` (sections Lists, Reports and dialogs, Detail drawers, Pockets). The drawers, lists, reports and dialogs were just made consistent; the form pages must now match them.

## Design rules already in force (do not reinvent)

- Calm, neutral surfaces. Color only for meaning: red refusal, orange warning or shortage, teal "matches". No colored badges or orbs added for decoration.
- Reuse what exists: `DetailKit` (`AmountRows`, `DetailFacts`, `LineItems`, `AmountSummary`), `DocumentDrawer` (`DocumentNotice`), `DocumentTable`, `DialogFrame`, `PocketSelect`, `VarianceText`, `SectionCard`.
- Form pages follow ui-guidelines "Standard B": left column of `SectionCard`s (icon orb 36, light; this is mandated by the guideline, keep it), right sticky column with a summary and the actions.
- Theme gotcha: the theme gives every Mantine `Paper` `padding: md` as an inline style. Pass `p={...}` explicitly on any `Paper` whose padding matters (`styles` cannot override it).
- Tests guard: `presentation/hardcodedText.test.ts` (no literal UI text in components; everything through `t()`), a style guard that forbids px font sizes (use Mantine sizes such as `size="xs"`), and `src/i18n/locales/pettyCash.test.ts` (id and en must have identical keys). Max 400 lines per file (eslint).
- Money: never add money as floats in views; use `@/lib/money` (`toMinor`, `sumMinor`) in domain code, with tests.

## Part A: one summary card for every form

1. Create `presentation/components/FormSummaryCard.tsx`:
   - Props: `title`, `rows: AmountRow[]` (from `DetailKit`), `status?: { tone: 'ok' | 'warning'; text: string }`, `issuesText?: string`, `children` (the action buttons).
   - Layout: `Paper withBorder radius="md" p="lg" bg="white"`, title (`fw={600} fz={15}`), `AmountRows`, then the status as ONE quiet line with an icon (`IconCircleCheck` teal for ok, `IconAlertTriangle` orange for warning), same look as the "balanced" line in `FundOverview.tsx`. No `Alert` boxes. Then `issuesText` in `c="red.7" size="sm" role="alert"`, then the actions in `Stack gap="xs"`, full width.
2. Rewrite `CountSummary.tsx` and `VoucherFormSummary.tsx` on top of it. Keep their props and behavior (poka-yoke disabling, labels, hints) and their existing tests passing (`VoucherFormSummary.test.tsx`, `CountAndReplenishmentParts.test.tsx`); update a test only where it asserts on removed markup, and say so in the report.
3. `ReplenishmentWizard.tsx`: its right sticky column must use `FormSummaryCard` too (look at what it renders for step 0 and step 1; keep the preview figures and buttons, only change the frame and typography).

## Part B: cash count per pocket (stage 4)

Contract (verified on the live API): `POST /v1/petty-cash/counts` accepts `nonCashBalances: [{ pocket: string, balance: number }]`; every ACTIVE non-cash pocket is required, otherwise the error code is `POCKET_BALANCES_REQUIRED` (already translated). The cash box (`TUNAI`) is still counted by `denominations`. The detail answer has `pocketResults` and `totalCounted` (already mapped and shown in the drawer).

Domain, `domain/cashCount.ts` (with tests in `domain/cashCount.test.ts`):
- `CountDraft` gets `nonCash: Record<string, number | ''>` (pocket code to typed balance). `emptyCountDraft(pocketCodes: string[] = [])` seeds `''` per code.
- `nonCashTotal(draft)` and `countedGrandTotal(draft)` (cash plus non-cash), integer-safe via `toMinor`/`sumMinor`.
- `validateCountDraft(draft, { witnessRequired, varianceNonZero, nonCashPockets: string[] })`: each listed pocket is required (`path: nonCash.<code>`, code `REQUIRED`), not negative, whole rupiah (reuse codes `INVALID_QUANTITY` or add `NEGATIVE`/`WHOLE_RUPIAH` if clearer; add i18n for any new code). `NOTHING_COUNTED` applies only when the grand total is zero AND no non-cash value was entered.
- `toCountInput(draft, nonCashPockets)` adds `nonCashBalances` (in the order given) only when the list is non-empty. Update `CountInput`.
- Per-pocket preview: `pocketVariance(typed, bookBalance)` returns `{ amount, type }` like `variancePreview`. Expected per pocket is the pocket's current `balance` from the fund (label it as an estimate, like the existing expected cash note).

UI, `CountForm.tsx`:
- Non-cash pockets = `activePockets(fund.pockets)` without `type === 'CASH'`. When there are none, the form is unchanged.
- New `SectionCard` between the denomination calculator and the people card: icon `IconBuildingBank`, title "Saldo rekening dan e-wallet", subtitle "Isi saldo menurut rekening koran atau aplikasi, per kantong." One row per pocket: pocket name and `type · provider · account number` on the left, a `NumberInput` (Rp, thousand separator ".", decimalScale 0, required) on the right, and under it a small line "Menurut buku Rp X" plus the per-pocket `VarianceText` once a value is typed. Use a small subcomponent file if `CountForm.tsx` would pass ~300 lines.
- Variance in the summary uses the grand total. Summary rows: cash counted, non-cash (only when pockets exist), total counted, expected (book), then the variance as the total row; status line ok when balanced, warning otherwise.
- Pass `nonCashPockets` to validation and `toCountInput`. The reason field stays required whenever the total variance is not zero.
- i18n (id and en) for every new label; Indonesian is the primary language, plain and professional, no technical words (no "API", "server", "payload").

## Part C: form page polish (keep behavior)

- `VoucherForm.tsx`: keep the layout; make sure every section uses `SectionCard` consistently, labels and hints are aligned with the drawers' wording (for example "Dibayar dari kantong"), and the summary uses `FormSummaryCard`. Do not change payload logic.
- `ReplenishmentVoucherStep.tsx` / wizard step 2: tables should match `DocumentTable` styling where practical (header style, tabular numbers); if a checkbox table cannot use `DocumentTable`, copy its CSS classes (`DocumentTable.module.css`: `.th`, `.td`, `.num`) instead of restyling by hand.
- `SettlementDialog.tsx` already uses `DialogFrame`; only align the lines editor typography if it is visibly off. Do not change its submit logic.

## Verification (all required, report results honestly)

1. `npx tsc --noEmit -p .`, `npx eslint src/module/petty-cash src/i18n`, `npx vitest run` (all green), `npx prettier --write` on changed files only.
2. Browser check on the running dev server `http://localhost:5173` with Playwright (the browser session is already signed in as a superadmin on the Demo Site). Screenshot to `.playwright-mcp/` only and look at them. Pages: `/bank-cash/petty-cash/<fundId>/voucher/add`, `/bank-cash/petty-cash/<fundId>/replenishment/add`, `/bank-cash/petty-cash/<fundId>/count/add`. The signed-in user is the custodian of fund `KK-ENG` (id `6ae9b97974759b1aaae0581a`, which has pockets TUNAI, BCA 1102, GOPAY, DANA), so the count page refuses there by design; check whether another fund allows it, and otherwise verify the count form through component tests and say so.
3. Never submit a form or confirm a dialog against the Demo Site: no data may be created. Viewing and typing without saving is fine.
4. Update `src/module/petty-cash/README.md`: the Pockets section (count per pocket is done; remove it from "Not built yet") and a short "Forms" paragraph about `FormSummaryCard`.

## Report back

Files changed, what each part delivered, test and lint results with counts, screenshots looked at, anything skipped or uncertain (with the reason), and any test you had to change.
