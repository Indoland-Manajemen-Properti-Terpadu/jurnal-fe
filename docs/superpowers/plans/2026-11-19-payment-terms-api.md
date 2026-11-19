# Payment terms (Syarat Pembayaran) on the API — PRO-95

Branch: `feat/payment-terms-pro-95` (from `origin/develop-frontend`). Jira: PRO-95 (FE), paired BE ticket PRO-92 (Aldi, Need to Test).

## Goal

Settings > Syarat Pembayaran manages the full payment term (advance, billing split, due date, retention) against `/v1/settings/payment-terms`, instead of the old `name + days` page. Scope is the CRUD of terms only. Using a term in vendor quotations, PO/SPK, DP and invoices is a separate Purchases ticket.

## What the sandbox API showed (Demo Site, 2026-11-19)

- `GET /v1/settings/payment-terms` and `GET /v1/payment-terms` return the same body. Shape: `{ code, message, data: { data: PaymentTerm[], pagination: { total, page, limit, totalPages } } }`, default limit 50.
- **The ticket writes snake_case; the API is camelCase.** Query: `q`, `appliesTo`, `isActive`, `page`, `limit`. Body: `name`, `appliesTo`, `description`, `usageExample`, `advanceType`, `defaultAdvancePercent`, `billingSplit`, `defaultInstallments`, `advanceOutsideInstallments`, `periodUnit`, `defaultPeriods`, `hasDueTerm`, `defaultDueDays`, `dueBasis`, `hasRetention`, `defaultRetentionPercent`, `defaultMaintenanceMonths`. snake_case is rejected with 400 (`"is_active" is not allowed`). Status body is `{ isActive }`.
- Enums: `appliesTo` goods | service | both (not `services`); `advanceType` none | partial | full; `billingSplit` single | milestone | recurring; `periodUnit` monthly | quarterly | semiannual | yearly; `dueBasis` receipt_date | vendor_invoice_date.
- Server validation (Indonesian messages, shown as is): name required; due days required while `hasDueTerm` (default true) and ≥ 0; partial advance needs 1–99; milestone installments ≥ 2; recurring periods ≥ 2; retention only on milestone and needs percent and maintenance months; unknown fields are rejected. `advanceType: full` stores 100 even when 50 is sent.
- Each term carries `summary { paymentLabel, billingLabel, dueLabel }`, `usageCount`, `usageBreakdown { purchase, sale }`, `canDelete`. Net 30 has `usageCount 4` (3 purchase, 1 sale) and `canDelete false`: sales use the same terms.
- Verified on the test term (step 1, 2026-11-19): `PUT` replaces the whole term. A field left out is reset (percent, installments, retention fields become null, `advanceOutsideInstallments` false), and sending explicit nulls gives the same result, so the form can simply omit irrelevant fields. `PATCH /:id/status` returns the full updated term (200). `summary` is recomputed on every change (e.g. "3 termin (di luar uang muka) + retensi 5% selama 6 bulan"), so the list never builds its own labels.
- Not verified: the 409 body of `DELETE` on a used term. The only used term on the Demo Site is Net 30, shared by 3 purchases and 1 sale, and a delete that is not blocked would remove it, so it was not tried. The 409 handling is built from the ticket text and covered by a test with a stubbed answer; confirm with Aldi on PRO-92 or on a term made used through a purchase document.

## Decisions (approved by the user)

1. Use `/v1/settings/payment-terms`, camelCase.
2. Add and edit are their own pages (Standard B), not a modal.
3. Rebuild the existing page to the new model. There is no mock in this repo (the page already calls the API with `name + days`); the "remove mock" item becomes removing the old two-field modal and the unused validators.

## Design

- **Routes:** `settings.paymentTerms` (list), `settings.paymentTermNew` `/settings/payment-terms/new`, `settings.paymentTermEdit` `/settings/payment-terms/:id/edit`. Registered in `src/router/modules/settings.tsx`.
- **No separate detail page.** The usage info ("Dipakai {n} dokumen") is a column in the list and a notice at the top of the edit page, which also carries the note "Perubahan hanya berlaku untuk penawaran berikutnya, dokumen yang sudah ada tidak berubah." This covers ticket item 2 without a fourth screen. Say so in the ticket comment.
- **List page (Standard A):** search (`q`), filter Untuk, filter status, table with name, Untuk, Pembayaran/Tagihan/Jatuh tempo from `summary`, usage count, status switch, actions; pagination from `pagination`; inactive terms stay with an "Nonaktif" badge; empty state "Buat termin pertama"; skeleton while loading; an error state with retry.
- **Delete:** `canDelete === false` disables the action with the tooltip "Termin sudah dipakai di Pembelian, nonaktifkan saja". Confirmation dialog otherwise. On 409 show the server message and offer a "Nonaktifkan" button that calls the status endpoint.
- **Form page (Standard B):** cards for Informasi (name, Untuk, description, usage example), Uang muka (none / partial with percent / full shows 100), Penagihan (single / milestone with installments and "DP di luar termin" when advance is partial / recurring with unit and periods), Jatuh tempo (switch, days, basis), Retensi (only milestone, percent and maintenance months). Fields appear and disappear by choice; a hidden field is not sent. Side card: short plain-language preview built from the same labels as `summary`.
- **Layers (docs/architecture.md):**
  - `domain/paymentTerm.ts`: types (`PaymentTerm`, `PaymentTermFormValues`, enums as union types), `defaultPaymentTermForm`, `visibleFields(values)`, validators that return an i18n key, `toPaymentTermPayload(values)` that drops irrelevant fields, `toFormValues(term)`.
  - `infrastructure/paymentTermApi.ts` + DTO mapper: list with params, get, create, update, setStatus, delete; replaces the old term functions in `settingApi.ts`. Endpoint constants move to `API_SETTINGS` with `/v1/settings/payment-terms`.
  - `presentation/hooks/usePaymentTermQueries.ts` (and `usePaymentTermListParams.ts` for the filters kept in the address): list (params in the query key), detail, create, update, setStatus, delete; each mutation invalidates and shows a toast; the delete hook exposes the 409 case.
  - `presentation/pages/PaymentTermPage.tsx` (list), `PaymentTermFormPage.tsx` (add and edit), components `PaymentTermFilters`, `PaymentTermTable`, `PaymentTermFormSections` under `presentation/components/paymentTerms/`.
- **i18n:** new keys under `settingsPages.paymentTerm.*` in both `id` and `en`, parity test kept green, no technical wording (no "server", "API", field names). Reuse the server messages for validation errors it returns.
- **Other modules:** `purchases/listPaymentTerms` keeps calling `/v1/payment-terms` (same body, `id`, `name`, `days` unchanged), so no change there. The Purchases and Sales dropdowns do not filter inactive terms or `appliesTo`; that is a risk to report, not part of this ticket.
- **Docs:** update `src/module/settings/README.md` (endpoints, routes, domain rules, known gaps).

## Steps

Each step is test first where the code can be rendered or unit tested, and ends with `typecheck`, `lint` and the affected tests.

1. **Verify the open API points** — done 2026-11-19 on the test term, now named "Uji FE" (PUT clearing and PATCH response confirmed; the 409 body is still open, see above). Quote the requests and answers in the ticket comment.
2. **Domain:** write `paymentTerm.test.ts` first (visibility per choice, each validation, payload drops irrelevant fields, partial 1–99, full = 100, milestone ≥ 2, recurring ≥ 2, retention only for milestone, due days ≥ 0), then `paymentTerm.ts`.
3. **Infrastructure:** mapper and API tests (query params in camelCase, body in camelCase, pagination parsing, status body), then `paymentTermApi.ts`; remove the old term functions and types.
4. **Hooks:** list, detail, mutations, status and delete-409 handling, with tests for the 409 path.
5. **List page:** table, filters, pagination, states, status switch, delete flow; component tests for filters, empty, disabled delete and the 409 offer.
6. **Form page and routes:** add and edit, conditional fields, server error display, usage notice on edit; render tests for the conditional fields and the payload sent.
7. **i18n, README, cleanup:** keys in `id` and `en`, parity and hard-coded-text guards, README, delete the old modal code and `validatePaymentTermDays`/`Name` if unused.
8. **Check in a browser** on the Demo Site: add each mechanism (none, partial, full, milestone with retention, recurring), edit a used term, toggle, delete an unused one, 409 on Net 30, refresh persists. Screenshots for the user before any commit (UI iteration rule).
9. **Report:** comment on PRO-95 in Indonesian after the change is live, move it to Need to Test, note the camelCase correction and the missing detail page for Raga, tag Aldi on PRO-92 for anything the API still owes, then give the user the feedback.

## Out of scope

Using terms in vendor quotations, PO/SPK, DP and invoices; filtering Purchases and Sales dropdowns by `isActive` or `appliesTo`; changing the backend.

## Risks and open points

- **A test term was created on the Demo Site by mistake** while probing validation (a probe meant to fail returned 201). Id `6afe6fd7ca6ac145046c0095`, renamed "Uji FE" and left in place (the user said rename or delete are both fine). It is currently: no advance, single billing, 14 days from receipt, active, unused, so it can be edited or deleted freely during the browser check.
- The 409 body of DELETE is unverified; step 4 relies on the ticket text and a stubbed test.
- Sales also use these terms, so the "Hapus tidak boleh untuk yang dipakai" rule and the note on the edit page apply to sales documents too; the ticket text only mentions purchases.
- Purchases and Sales dropdowns will still list inactive terms.
