# Sales Revamp Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the sales list, create modal, detail and payment flow with a draft/send invoice workflow, a stepper form, receivable statistics and a public invoice page, on the fixed backend.

**Architecture:** Keep the `src/module/sales` layers. `domain/` holds pure rules (status, receivables view, actions, step validation, payloads' inputs); `infrastructure/` maps the new DTO fields and talks to the new endpoints; `presentation/` is rebuilt as pages (`SaleMainPage`, `SaleFormPage`, `SaleDetailPage`, `PublicInvoicePage`) over TanStack Query hooks. Server flags (`canEdit`, `canDelete`, `displayStatus`) are trusted; the UI holds no copy of those rules.

**Tech Stack:** React 18, TypeScript strict, Mantine 8, TanStack Query 5, Vitest, i18n via `@/i18n` (`id` primary, `en`).

**Spec:** `docs/superpowers/specs/2026-11-05-sales-revamp-design.md`

## Global Constraints

- Branch `feat/sales-revamp` (from `develop-frontend`). No commit, push or merge unless the user asks. Steps below say "checkpoint" where a commit would normally go; do not run it without being asked.
- Money in integer minor units via `@/lib/money` and `domain/saleMoney.ts`; no float arithmetic on money in views.
- Files at most 400 lines, no `any`, no `console.log`, no `../../../` imports, no cross-feature internals (use `@/module/<feature>` only). Do not import from `@/module/purchases`.
- Colours: brand blue and neutrals; red only for real overdue or delete confirmation, green only for paid. No hex, no px font sizes (`src/theme/noHardcodedStyles.test.ts`).
- UI copy has no technical wording (no "server", "API", "endpoint"). Indonesian business messages from the backend are shown as written for Indonesian users and replaced by a generic sentence for English users.
- Every new string exists in `id` and `en` in namespace `sales` (or `saleDetail` for the detail page); parity tests must pass. Indonesian uses "Draf", English "Draft".
- Glossary: Faktur Penjualan, Piutang Usaha / Sisa Tagihan, Terkirim, Belum Lunas, Lunas, Jatuh Tempo, Void, Catat Pembayaran, Setor ke Akun (Kas & Bank), DPP, PPN, Pemotongan PPh, Total Tagihan Akhir.
- Out of scope: Tukar Faktur, Pemesanan Penjualan, Penawaran Penjualan. Drafts offer Edit and Delete only (no Void). Only drafts are editable.
- Test data created on the live demo API is deleted afterwards (a voided invoice cannot be deleted, so do not void test data).
- Verification commands: `npx vitest --run src/module/sales src/i18n src/router src/theme`, `npx tsc --noEmit`, `npx eslint src/module/sales src/router`, `npm run lint:ratchet`, `npm run prettier:changed`.

## Review Focus

- Customer or product with no email, so `emailError` comes back: save and send still succeeds and shows a warning, never an error.
- `send` rejected with an Indonesian business message (product mapped to a petty-cash account): message shown politely, invoice stays a draft, form keeps its values.
- `billed = 0` or `received` far below 1% of `billed`: no division by zero; shows no percentage or "<1%".
- Summary with a date range where nothing is overdue (`oldestDueDate: null`): the overdue card shows Rp 0 and no "tertua" text, and is not red.
- Very large amounts (Rp 7 miliar) and 3,000+ overdue invoices: cards and table do not overflow at phone width.
- Double click on Simpan & Kirim: only one request (pending state blocks resubmit).
- Opening `/sales/:id/edit` for a non-draft or a `canEdit: false` sale: redirected to the detail page.
- `/invoice/:token` with an unknown token: a calm not-found state, no crash, no login redirect.

---

### Task 1: Domain status, receivables view and actions

**Files:**
- Modify: `src/module/sales/domain/sale.ts` (types), `src/module/sales/domain/saleFormat.ts`, `src/module/sales/domain/saleTotals.ts` (remove `filterSalesByTab`, `SaleTab`, `summarizeSales`, `isPastDue`, `SaleListSummary` once no caller remains)
- Create: `src/module/sales/domain/saleStatus.ts`, `src/module/sales/domain/saleReceivables.ts`, `src/module/sales/domain/saleActions.ts`
- Test: `saleStatus.test.ts`, `saleReceivables.test.ts`, `saleActions.test.ts` next to them; update `saleTotals.test.ts`

**Interfaces:**
- Produces in `sale.ts`: `SaleDisplayCode = 'DRAFT'|'UNPAID'|'PAID'|'OVERDUE'|'VOID'`; `SaleDisplayStatus = { code: SaleDisplayCode; label: string }`; `Sale` gains `displayStatus: SaleDisplayStatus`, `canEdit: boolean`, `canDelete: boolean`, `createdByApi: boolean`, and `SaleItem` gains `unit?: string | null`; `SaleListParams` gains `paymentStatus?: SaleDisplayCode | SaleDisplayCode[]`, `excludeDraft?: boolean`, `sortBy?: string`, `sortOrder?: 'asc'|'desc'`; new `ReceivablesSummary = { overdue: {amount:number; count:number; oldestDueDate:string|null}; notDue: {amount:number; count:number}; total: {amount:number; count:number}; billed: number; received: number }`; `SaleStatusCounts = Record<SaleDisplayCode | 'sent' | 'all', number>`; `SendSaleResult = { sale: Sale; emailSent: boolean; emailError: string }`.
- Produces in `saleStatus.ts`: `saleStatusTone(code: SaleDisplayCode): { color: string; variant: 'light'|'filled'|'outline' }`; `SALE_TABS = ['draft','sent'] as const`, `type SaleTab`, `tabParams(tab: SaleTab, status: SaleDisplayCode | 'all'): Pick<SaleListParams,'paymentStatus'|'excludeDraft'>` (draft -> `{ paymentStatus: 'DRAFT' }`; sent with status `all` -> `{ paymentStatus: ['UNPAID','PAID','OVERDUE'] }`, which also leaves Void out; sent with status X -> `{ paymentStatus: X }`; `excludeDraft` is not used by the UI).
- Produces in `saleReceivables.ts`: `buildReceivablesView(summary: ReceivablesSummary, now: number): { overdueAmount; overdueCount; oldestOverdueDays: number | null; outstandingAmount; notDueAmount; overdueShare: number; receivedAmount; receivedPercent: number | null; receivedPercentLabel: string | null }` where `receivedPercent` is `null` when `billed` is 0, rounded to a whole number, and `receivedPercentLabel` is `'<1'` when `0 < percent < 1`.
- Produces in `saleActions.ts`: `saleActions(sale: Pick<Sale,'displayStatus'|'canEdit'|'canDelete'|'createdByApi'>): { edit: boolean; remove: 'hidden'|'disabled'|'enabled'; send: boolean; resend: boolean; pay: boolean; pdf: boolean; link: boolean; void: boolean }`.

- [ ] **Step 1: Write failing tests.** `saleStatus.test.ts`: `tabParams('draft','all')` equals `{ paymentStatus: 'DRAFT' }`; `tabParams('sent','all')` equals `{ paymentStatus: ['UNPAID','PAID','OVERDUE'] }`; `tabParams('sent','OVERDUE')` equals `{ paymentStatus: 'OVERDUE' }`. `saleReceivables.test.ts`: billed 0 -> `receivedPercent` null; billed 7_366_387_456 and received 6_510_000 -> `receivedPercentLabel` `'<1'`; billed 400 received 100 -> 25; `oldestDueDate` null -> `oldestOverdueDays` null; `oldestDueDate` 45 days before `now` -> 45; `outstandingAmount` equals `overdue.amount + notDue.amount` in integer cents. `saleActions.test.ts`: DRAFT with `canEdit/canDelete` true -> `{ edit:true, remove:'enabled', send:true, pay:false, void:false, resend:false }`; UNPAID -> `{ pay:true, resend:true, void:true, edit:false, send:false }`; PAID -> `pay:false`; VOID -> only `pdf:true`; `createdByApi:true` with `canDelete:false` -> `remove:'disabled'`; `canDelete:false` and `createdByApi:false` -> `remove:'hidden'`.
- [ ] **Step 2: Run** `npx vitest --run src/module/sales/domain` — Expected: FAIL (modules missing).
- [ ] **Step 3: Implement** the three modules and the type changes per Interfaces. `getSaleStatusConfig` stays (the `contacts` module imports it) and keeps its current behavior. Remove the old tab filter and client-side summary only after Task 4 stops using them (delete them in Task 4 step, not here); here only add.
- [ ] **Step 4: Run** the same command — Expected: PASS.
- [ ] **Step 5: Checkpoint** (no commit unless asked).

### Task 2: DTO, mapper and API layer

**Files:**
- Modify: `src/module/sales/infrastructure/saleDto.ts`, `saleMapper.ts`, `saleApi.ts`, `saleMapper.test.ts`
- Create: `src/module/sales/infrastructure/saleReceivablesApi.ts` (summary, counts), `salePayloads.ts` (multipart builders), `salePayloads.test.ts`

**Interfaces:**
- Consumes: Task 1 types.
- Produces in `saleApi.ts` (all through `apiClient`): `fetchSales(params)` (serialises `paymentStatus` arrays as a comma list; passes `excludeDraft`, `sortBy`, `sortOrder`); `createSale(values: CreateSaleFormValues, mode: 'draft'|'send'): Promise<SendSaleResult>`; `updateSale(id: string, values: CreateSaleFormValues): Promise<Sale>`; `sendSale(id: string, sendEmail: boolean): Promise<SendSaleResult>`; `voidSale(id: string, reason: string): Promise<Sale>`; `deleteSale(id: string): Promise<void>`; `fetchPublicInvoice(token: string): Promise<Sale>`; `createSalePayment(payload: CreateSalePaymentPayload): Promise<unknown>` now multipart.
- Produces in `saleReceivablesApi.ts`: `fetchReceivablesSummary(range: { startDate?: string; endDate?: string }): Promise<ReceivablesSummary>`; `fetchSaleStatusCounts(filters: { search?: string; startDate?: string; endDate?: string }): Promise<SaleStatusCounts>`.
- Produces in `salePayloads.ts`: `buildSaleFormData(values: CreateSaleFormValues, mode: 'draft'|'send'|'update'): FormData` (appends `status` = `DRAFT` or `SENT` and `sendEmail` = `true` only for `send`; appends nothing for `status` when `update`), `buildPaymentFormData(payload: CreateSalePaymentPayload): FormData` (`tags[]` per tag, `attachments` per file).
- `CreateSalePaymentPayload` gains `attachments?: File[]`.

- [ ] **Step 1: Probe the contracts the spec left open, using `scratchpad/api.py` and `mp.py` against a throwaway draft:** (a) does `PUT /v1/sales/:id` take multipart or JSON and which fields; (b) `GET /v1/sales/public/:linkToken` shape, using a token from `POST /v1/sales/:id/invoice-link` on an existing sent sale; (c) the shape of `unit` on `GET /v1/products`; (d) why `GET /v1/sales/:id/print` fails from the browser (headers, blob handling, token). Record answers in the module README "Contract facts" section. Delete the throwaway draft.
- [ ] **Step 2: Write failing tests.** `saleMapper.test.ts`: a DTO with `displayStatus {code:'OVERDUE',label:'Jatuh Tempo'}`, `canEdit:false`, `canDelete:false`, `createdByApi:true` maps to the same fields; a DTO without `displayStatus` maps `status` `DRAFT` to code `DRAFT` and `PAID` to `PAID` (fallback for the customer module's list). `salePayloads.test.ts`: `buildSaleFormData(values,'draft')` has `status` `DRAFT` and no `sendEmail`; `'send'` has `status` `SENT` and `sendEmail` `true`; `'update'` has neither; two payment tags produce two `tags[]` entries; three files produce three `attachments` entries; a nominal discount `1000.005` is sent as `1000.01`.
- [ ] **Step 3: Run** `npx vitest --run src/module/sales/infrastructure` — Expected: FAIL.
- [ ] **Step 4: Implement** per Interfaces. Mapper rounding rules stay as in the README. `emailSent` and `emailError` come from the response body next to `data`; confirm the exact placement in Step 1 and handle both (`data.emailSent` or `data.data.emailSent`) only if the probe shows it.
- [ ] **Step 5: Run** the same command plus `npx tsc --noEmit` — Expected: PASS.
- [ ] **Step 6: Checkpoint.**

### Task 3: Query hooks and shared presentation pieces

**Files:**
- Modify: `src/module/sales/presentation/hooks/useSaleQueries.ts` (split if it nears 400 lines: mutations to `useSaleMutations.ts`)
- Create: `src/module/sales/presentation/hooks/useSaleMutations.ts`, `useReceivables.ts`, `saleErrorMessage.ts`, `src/module/sales/presentation/components/shared/SaleStatusBadge.tsx`, `MetricCard.tsx`, `SegmentBar.tsx`, `RingStat.tsx`, `ReasonModal.tsx` (+ `.module.css` where needed)
- Test: `saleErrorMessage.test.ts`

**Interfaces:**
- Consumes: Task 2 API.
- Produces: `useSaleReceivables(range)`, `useSaleStatusCounts(filters)`; `useCreateSale()`, `useUpdateSale(id)`, `useSendSale()`, `useVoidSale()`, `useDeleteSale()` — each invalidates `saleKeys.all` on success and on error, blocks a second submit while pending, and shows a warning notification (not an error) when `emailSent === false`; `usePublicInvoice(token)`; `useDepositAccounts()` returns only accounts with `isBankAndCash`; `useSaleTagOptions()` from `SALE_ENDPOINTS.tags`; `saleErrorMessage(error: unknown, language: 'id'|'en', fallback: string): string` (Indonesian server messages as written for `id`, generic fallback for `en` and for validation or unknown failures).
- Components: `SaleStatusBadge({ status: SaleDisplayStatus })`, `MetricCard`, `SegmentBar({ segments: { value: number; label: string; tone: 'danger'|'primary'|'muted' }[] })`, `RingStat({ percent: number | null })`, `ReasonModal` (min 3 characters). Modelled on the visual language of `src/module/purchases/presentation/components/shared/` but written locally.

- [ ] **Step 1: Write failing test** `saleErrorMessage.test.ts`: `id` with message `Akun kas kecil ... Gunakan menu Kas Kecil.` returns the message as written; `en` with the same error returns the fallback; a 400 validation error returns the fallback; a plain `Error` returns the fallback.
- [ ] **Step 2: Run** `npx vitest --run src/module/sales/presentation` — Expected: FAIL.
- [ ] **Step 3: Implement** hooks and components. Query keys keep the existing `saleKeys` shape and add `receivables(range)` and `counts(filters)` under `saleKeys.all`.
- [ ] **Step 4: Run** the same command and `npx tsc --noEmit` — Expected: PASS.
- [ ] **Step 5: Checkpoint.**

### Task 4: List page, statistics and filters

**Files:**
- Modify: `src/module/sales/presentation/pages/SaleMainPage.tsx`, `SaleTable.tsx`, `SaleTableRow.tsx`, `SaleStatsGrid.tsx` (rebuild), `SaleTableSkeletonRows.tsx`
- Create: `src/module/sales/presentation/components/list/SaleFilters.tsx`, `SaleRowActions.tsx`, `src/module/sales/presentation/hooks/useSaleListState.ts`
- Modify: `domain/saleTotals.ts` (delete `filterSalesByTab`, `SaleTab`, `summarizeSales`, `isPastDue`, `SaleListSummary` and their tests)
- Modify: `src/components/HeaderNav/HeaderNav.tsx` only if `/sales` is not yet in `SECTION_TITLES`

**Interfaces:**
- Consumes: `tabParams`, `buildReceivablesView`, `saleActions`, `SaleStatusBadge`, hooks from Task 3.
- Produces: `useSaleListState(): { tab: SaleTab; status: SaleDisplayCode | 'all'; range: [string | null, string | null]; search: string; page: number; limit: number; setTab; setStatus; setRange; setSearch; setPage; setLimit; params: SaleListParams }`; changing tab, status, range or search resets `page` to 1; changing tab resets `status` to `'all'`.

- [ ] **Step 1: Write failing test** for `useSaleListState` logic as a pure reducer `saleListReducer` in `domain`-free presentation file `useSaleListState.ts` (exported for test): tab change resets status and page; search change resets page; the resulting `params` use `tabParams` and send `startDate` and `endDate` only when set.
- [ ] **Step 2: Run** `npx vitest --run src/module/sales/presentation/hooks` — Expected: FAIL.
- [ ] **Step 3: Implement the page per the spec's list section:** pill tabs **Draf (n)** and **Terkirim (n)** with counts from `useSaleStatusCounts`; filters row (status select hidden on the Draf tab, date range, search); three statistic cards (Lewat Jatuh Tempo with amount as the main number and "N faktur · tertua D hari", Sisa Tagihan with a two-segment `SegmentBar` and "Rp X belum jatuh tempo", Sudah Diterima with `RingStat` and "P% dari total penjualan") fed by `useSaleReceivables(range)`; table inside the single `Paper`; `EmptyState` inside the table shell; row actions from `saleActions` (Draf: Edit, Hapus, Kirim; Terkirim: Lihat, Unduh PDF, Salin Tautan, Kirim Ulang, Catat Pembayaran). "Buat Faktur" navigates to `routes.sales.add`. Delete uses a confirm dialog. Remove the create modal usage; `CreateSale*` files are deleted in Task 5.
- [ ] **Step 4: Run** `npx vitest --run src/module/sales` and `npx tsc --noEmit` — Expected: PASS.
- [ ] **Step 5: Browser check** with the dev server (`npm run dev`) and the demo login: tabs and counts, each status filter, date range updates both the table and the cards, empty state, phone width 390 px has no horizontal scroll. Screenshots are kept in the scratchpad.
- [ ] **Step 6: Checkpoint.**

### Task 5: Stepper create and edit page

**Files:**
- Create: `src/module/sales/presentation/pages/SaleFormPage.tsx`, `components/form/SaleStepper.tsx`, `StepGeneral.tsx`, `StepLines.tsx`, `StepExtras.tsx`, `SaleLinesTable.tsx`, `SaleTotalsPanel.tsx`, `FormActionBar.tsx`, `hooks/useSaleForm.ts`; `domain/saleForm.ts`, `domain/saleForm.test.ts`
- Delete: `CreateSaleModal.tsx`, `CreateSaleGeneralTab.tsx`, `CreateSaleItemsTab.tsx`, `CreateSaleAdditionalTab.tsx`, `CreateSaleSummary.tsx`, `hooks/useCreateSaleForm.ts`
- Modify: `src/router/routes.ts` (`sales.add: '/sales/new'`, `sales.edit: '/sales/:id/edit'`, `sales.publicInvoice: '/invoice/:token'`), `src/router/modules/sales.tsx`, `src/router/modules/app.tsx` (public route), `src/module/sales/index.ts` (export `SaleFormPage`, `PublicInvoicePage`)

**Interfaces:**
- Consumes: `calculateSaleTotals`, `buildSaleFormData` via `createSale`/`updateSale`, lookups from Task 3.
- Produces in `domain/saleForm.ts`: `SaleStepId = 'general'|'lines'|'extras'`; `validateStep(step: SaleStepId, values: CreateSaleFormValues): Record<string,string>` (error keys are i18n keys under `sales.validation.*`); `canSaveDraft(values): boolean` (customer set and at least one line with product, quantity > 0); `canSend(values): boolean` (`canSaveDraft` plus due date not before transaction date and every line price >= 0); `emptySaleForm(today: string): CreateSaleFormValues`; `saleToFormValues(sale: Sale): CreateSaleFormValues`. `CreateSaleItemForm` gains `unit: string`.

- [ ] **Step 1: Write failing tests** in `saleForm.test.ts`: `validateStep('general', { customer: '' })` has a `customer` error; `validateStep('lines', ...)` errors on zero lines and on quantity 0; `canSaveDraft` false without lines, true with customer and one valid line; `canSend` false when `dueDate` is before `transactionDate`; `saleToFormValues` of a sale with an item unit `Jam` keeps `unit: 'Jam'`.
- [ ] **Step 2: Run** `npx vitest --run src/module/sales/domain/saleForm.test.ts` — Expected: FAIL.
- [ ] **Step 3: Implement the domain file, then the page.** Steps per spec: (1) Informasi Umum (no price-includes-tax switch, no totals), (2) Rincian Produk & Jasa with the unit column auto-filled from the selected product and `disabled`, the price-includes-tax switch and a live `SaleTotalsPanel` marked as estimate, (3) Diskon & Tambahan with discount, withholding, message, memo, attachments, and the final breakdown (Subtotal, Diskon, DPP, PPN, Pemotongan PPh, Total Tagihan Akhir). `FormActionBar`: Kembali, Lanjut on steps 1-2; on step 3 **Simpan sebagai Draf** (default button) and **Simpan & Kirim** (the only primary). "Simpan sebagai Draf" is also available on steps 1-2 when `canSaveDraft`. Edit mode loads the sale, redirects to `routes.sales.detail` when `canEdit` is false, and calls `updateSale` (no status). After a successful send with `emailError`, navigate to the detail page and show the warning.
- [ ] **Step 4: Run** `npx vitest --run src/module/sales src/router` and `npx tsc --noEmit` — Expected: PASS (`routes.test.ts` confirms every new constant resolves to a page).
- [ ] **Step 5: Live simulation** in the browser: create a draft, edit it, delete it; create and send with a product that has a valid receivable account (find one by probing; the petty-cash mapped product is known to fail). Clean up test data.
- [ ] **Step 6: Checkpoint.**

### Task 6: Detail page and payment modal

**Files:**
- Modify: `src/module/sales/presentation/pages/SaleDetailPage.tsx`, `components/detail/SaleSidebar.tsx`, `SaleOverviewCard.tsx`, `SaleItemsCard.tsx`, `PaySaleModal.tsx`
- Create: `components/detail/SaleActionBar.tsx`, `SaleTimeline.tsx`, `PaymentProgress.tsx`, `components/PaymentExtras.tsx` (tags and attachments fields)

**Interfaces:**
- Consumes: `saleActions`, `ReasonModal`, `useSendSale`, `useVoidSale`, `useDeleteSale`, `useDepositAccounts`, `useSaleTagOptions`.
- Produces: `SaleActionBar({ sale: Sale })`, `SaleTimeline({ sale: Sale })` (steps Draf, Terkirim, Lunas derived from `displayStatus.code`; Void shows as a closed state).

- [ ] **Step 1: Write failing test** `PaySaleModal` payload helper `buildPaymentPayload(values, sale)` in `domain/salePayment.ts` with `salePayment.test.ts`: amount 0 invalid, amount above `remainingAmount` invalid, amount equal to remaining valid; payload carries `tags` and `attachments`; more than 5 files or a file above 5 MB invalid.
- [ ] **Step 2: Run** `npx vitest --run src/module/sales/domain/salePayment.test.ts` — Expected: FAIL.
- [ ] **Step 3: Implement.** Detail actions follow `saleActions`: Draf = Edit, Hapus, Kirim; Terkirim = Catat Pembayaran, Unduh PDF, Salin Tautan, Kirim Ulang, Void (with `ReasonModal`); Lunas = PDF and link; Void = PDF. Show a key-facts row (total, received, remaining, due date), the payment progress bar and the timeline. The payment modal offers only accounts with `isBankAndCash`, a tags field and up to 5 attachments, and is never opened for a draft, paid or void invoice.
- [ ] **Step 4: Run** `npx vitest --run src/module/sales` and `npx tsc --noEmit` — Expected: PASS.
- [ ] **Step 5: Live simulation:** pay a sent invoice with a tag and a file against the demo API (use a small test invoice created in Task 5); confirm tag and attachment appear in the payment detail; clean up what can be cleaned.
- [ ] **Step 6: Checkpoint.**

### Task 7: Public invoice page and PDF/link fixes

**Files:**
- Create: `src/module/sales/presentation/pages/PublicInvoicePage.tsx`, `components/public/PublicInvoiceView.tsx`
- Modify: `src/module/sales/infrastructure/saleApi.ts` (download and link calls per Task 2 Step 1 findings), `presentation/hooks/useSaleMutations.ts` (`useDownloadInvoicePdf`, `useCopyInvoiceLink`)

**Interfaces:**
- Consumes: `usePublicInvoice(token)`.
- Produces: `PublicInvoicePage` default export mounted at `routes.sales.publicInvoice` outside the app shell, no login required, no redirect on 401/404.

- [ ] **Step 1: Write the failing test** `saleFormat` additions in `saleFormat.test.ts`: `invoiceFilename('INV/001')` returns `Faktur-INV_001.pdf` (existing behavior pinned) and an invoice link helper `buildInvoiceLink(origin: string, token: string): string` returns `https://app.example/invoice/abc` for origin `https://app.example` and token `abc`.
- [ ] **Step 2: Run** `npx vitest --run src/module/sales/domain` — Expected: FAIL for the new helper.
- [ ] **Step 3: Implement** the helper, the page (number, customer, lines, totals, status, loading and not-found states, print-friendly) and the corrected PDF download and link copy based on the Task 2 Step 1 findings. "Salin Tautan" copies the invoice link and confirms politely; PDF failures show a generic Indonesian or English sentence.
- [ ] **Step 4: Browser check:** download a PDF from the list and the detail; open `/invoice/<real token>` in a logged-out window; open `/invoice/unknown`.
- [ ] **Step 5: Checkpoint.**

### Task 8: i18n, README, final verification

**Files:**
- Modify: `src/i18n/locales/id/sales.ts`, `src/i18n/locales/en/sales.ts`, `src/i18n/locales/id/saleDetail.ts`, `en/saleDetail.ts`, `src/module/sales/README.md`, `docs/modules/README.md` only if it lists sales details
- Test: `src/i18n/locales/sales.test.ts`, `saleDetail.test.ts` (existing parity tests)

- [ ] **Step 1:** Add every key introduced in Tasks 3-7 to `id` and `en` (Indonesian first; English "Draft", "Sent", "Unpaid", "Paid", "Overdue", "Record Payment", "Deposit To (Cash & Bank)"). Remove keys for deleted components.
- [ ] **Step 2:** Rewrite the module README: routes table (`main`, `add`, `edit`, `detail`, public `publicInvoice`), endpoints, domain rules (displayStatus, tab queries, receivables view, actions from server flags), contract facts verified on 2026-11-05 (including the Task 2 Step 1 answers), known gaps (out-of-scope documents, `APP_BASE_URL` per environment, void invoices cannot be deleted).
- [ ] **Step 3: Run the full verification:** `npx vitest --run`, `npx tsc --noEmit`, `npx eslint src/module/sales src/router src/i18n`, `npm run lint:ratchet`, `npm run prettier:changed`. Expected: all green; if the ratchet baseline drops, update it per `docs/architecture.md`.
- [ ] **Step 4: Browser pass at 1440 px and 390 px** with the demo account: list, create draft, edit, delete, send, pay (tag and file), void, PDF, public page. Test data removed.
- [ ] **Step 5: Final review** of the whole diff for accidental changes, secrets and generated files; report to the user what changed, files affected, verification output and unresolved issues.
