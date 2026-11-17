# Asset Write-off Reports and "Menunggu Anda" Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the broken direct disposal with a signed write-off report flow (form page, document page with approve/reject) and add the "Menunggu Anda" hub that gathers every pending action of the assets module.

**Architecture:** Everything stays inside `src/module/assets`, split per layer into a `writeOff` area next to the existing asset files: domain types and pure rules, infrastructure (DTO, mapper, API calls through `apiClient`), TanStack Query hooks, then three new pages on their own routes. The sidebar entry "Aset" gets two children; the hub's decision count feeds a Navbar badge.

**Tech Stack:** React 18, TypeScript strict, Mantine 8 (`@mantine/dropzone`, `@mantine/dates`), TanStack Query 5, Vitest + Testing Library (`@test-utils`), dayjs.

**Spec:** `docs/superpowers/specs/2026-11-17-asset-write-off-design.md`

## Global Constraints

- No new dependency. Signature pad is drawn in-house on `<canvas>`.
- Files ≤ 400 lines; `@/` imports only; no `any`; no `console.log`.
- All HTTP only in `src/module/assets/infrastructure/*` through `apiClient` (`@/lib/http/apiClient`).
- Copy in `id` and `en`, new namespace `assetWriteOffs` in `src/i18n/locales/{id,en}/assetWriteOffs.ts`, registered in both `index.ts`, parity test `src/i18n/locales/assetWriteOffs.test.ts` (copy the shape of `assets.test.ts`).
- Never render API text that is a Joi message, a file path or an id. Business messages from the API (`message` of a 400) may be shown through `getApiErrorMessage`. The UI validates `reason` (≥ 3) and `description` (10–5000) before sending.
- No default signature, account or amount. No blinking. Respect `prefers-reduced-motion` for any transition.
- An asset is shown as disposed only when the API says `status: 'disposed'`.
- Contract values: types `sold|scrapped|fully_depreciated|damaged|lost`; statuses `PENDING_APPROVAL|APPROVED|REJECTED`; evidence JPG/PNG/PDF, ≤ 10 MB each, 1–5 files, not required for `lost`; signature PNG/JPG; description 10–5000; reject reason ≥ 3; depreciation `upTo` is `YYYY-MM` and never the current month.
- Image URLs: `${BASE_URL}/${filePath}` with `BASE_URL` from `@/lib/http/endpoints`.
- Commits: the user reviews the UI in the browser first. Work stays uncommitted on `feat/asset-write-off` until the user approves, then it is committed there (Task 11). No push.
- Verification command for every task: `yarn vitest run <paths>`; full gate in Task 11: `yarn test`.

## Review Focus

1. **Approval fails on ledger data** (the asset account is a locked petty-cash account): the report must stay "Menunggu persetujuan", the modal stays open with the API message, nothing looks posted. Test in Task 7.
2. **Asset already has a pending report** when the form opens: the form is not shown; a notice links to the pending report. Test in Task 6.
3. **Incident date outside [acquisition date, today]** (QA-AT/002 is acquired in the future): the date picker blocks it and the type cards explain why the form cannot be filed when no valid date exists. Test in Task 1 and Task 6.
4. **Old disposed assets with `disposalType: null`**: list shows "Dijual" when price > 0, else "Dilepas", and no BA link. Test in Task 1 and Task 10.
5. **Depreciation run partly fails** (locked period): `failed` and `skipped` per asset are listed after the run; the rest stays posted. Test in Task 9.

---

### Task 1: Domain types and rules

**Files:**
- Create: `src/module/assets/domain/writeOff.ts`, `src/module/assets/domain/writeOffRules.ts`
- Test: `src/module/assets/domain/writeOffRules.test.ts`
- Modify: `src/module/assets/domain/asset.ts` (add fields, see Produces)

**Interfaces:**
- Produces (`writeOff.ts`):
  - `WRITE_OFF_TYPES = ['sold','scrapped','fully_depreciated','damaged','lost'] as const`; `type WriteOffType`.
  - `type WriteOffStatus = 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED'`.
  - `interface WriteOffSnapshot { code; name; categoryName: string|null; location?; brand?; modelType?; serialNumber?; acquisitionDate: string; acquisitionCost: number; accumulatedDepreciation: number; bookValue: number; estimatedGainLoss: number }`.
  - `interface WriteOffResult { accumulatedDepreciation: number; bookValue: number; gainLoss: number }`.
  - `interface WriteOffFile { id: string; url: string; fileName: string; mimeType: string }`.
  - `interface WriteOffSignature { title: string; name: string|null; role: string; signedAt: string|null; state: 'signed'|'waiting'|'rejected'; imageUrl: string|null; note: string|null }`.
  - `interface WriteOffReport { id; number; assetId; type: WriteOffType; status: WriteOffStatus; incidentDate: string /*YYYY-MM-DD*/; description; proceedsAmount: number; proceedsAccount: AccountRef|null; gainLossAccount: AccountRef|null; attachments: WriteOffFile[]; snapshot: WriteOffSnapshot; result: WriteOffResult|null; signatures: WriteOffSignature[]; createdBy: { id: string; name: string }; submittedAt: string; decidedAt: string|null; waitingOnRoles: string[]; canDecide: boolean }`.
  - `interface WriteOffDraft { type: WriteOffType|null; incidentDate: string; description: string; hasProceeds: boolean; proceedsAmount: number; proceedsAccount: string; gainLossAccount: string; evidence: File[]; signature: Blob|null }`.
  - `interface WriteOffListParams { page: number; limit: number; status?: WriteOffStatus; type?: WriteOffType; search?: string; assetId?: string }`.
  - `interface DepreciationDue { months: number; amount: number; upTo: string /*YYYY-MM*/ }`.
  - `interface DepreciationRunResult { upTo: string; months: number; amount: number; plan: { code: string; months: number; from: string; to: string; amount: number }[]; skipped: { code: string; reason: string }[]; failed: { code: string; reason: string }[] }`.
- Produces (`asset.ts` additions): `AssetItem.depreciationDue: DepreciationDue` (`{months:0,amount:0,upTo:''}` when missing), `AssetItem.disposalType: WriteOffType|null`, `AssetItem.disposalReportId: string|null`; `AssetSummary.ownedCount: number`, `AssetSummary.pending: { count: number; totalAcquisitionCost: number }`. Remove `DisposalValues`.
- Produces (`writeOffRules.ts`):
  - `WRITE_OFF_LIMITS = { descriptionMin: 10, descriptionMax: 5000, maxFiles: 5, maxFileBytes: 10 * 1024 * 1024, evidenceMime: ['image/jpeg','image/png','application/pdf'], signatureMime: ['image/png','image/jpeg'], rejectReasonMin: 3 }`.
  - `proceedsRequired(type): boolean` (only `sold`); `proceedsAllowed(type): boolean` (all but `fully_depreciated`); `evidenceRequired(type): boolean` (all but `lost`).
  - `canBeFullyDepreciated(bookValue: number, residualValue: number): boolean` (`bookValue <= residualValue`).
  - `incidentDateBounds(acquisitionDate: string, today: string): { min: string; max: string } | null` (null when acquisition is after today).
  - `type WriteOffField = 'type'|'incidentDate'|'description'|'proceedsAmount'|'proceedsAccount'|'evidence'|'signature'`.
  - `validateWriteOffDraft(draft: WriteOffDraft, ctx: { today: string; acquisitionDate: string }): Partial<Record<WriteOffField, string>>` — values are i18n keys of `assetWriteOffs` (`errType`, `errDateRange`, `errDescriptionShort`, `errDescriptionLong`, `errPriceRequired`, `errProceedsAccount`, `errEvidenceRequired`, `errEvidenceTooMany`, `errSignatureRequired`).
  - `writeOffChecklist(draft, ctx): { key: WriteOffField; done: boolean }[]` in the order type, incidentDate, description, (proceeds when required or `hasProceeds`), evidence (when required), signature.
  - `validateEvidenceFile(file: { type: string; size: number }): 'errFileType' | 'errFileSize' | null`.
  - `disposalTypeLabelKey(type: WriteOffType|null, price: number): string` → `type_<type>` or, for null, `legacySold` when `price > 0` else `legacyDisposed`.
  - `documentTitleKey(type: WriteOffType): string` → `docTitle_<type>`.
  - `lastClosedMonth(today: string): string` → `YYYY-MM` of the previous month.

- [ ] **Step 1: Write failing tests** in `writeOffRules.test.ts`:
  - `validateWriteOffDraft` with an empty draft returns keys for type, description, evidence, signature.
  - `sold` with `proceedsAmount: 0` → `proceedsAmount: 'errPriceRequired'`; `sold` with amount 8_000_000 and no account → `proceedsAccount: 'errProceedsAccount'`.
  - `damaged` with `hasProceeds: false` and amount 0 → no proceeds errors; with `hasProceeds: true`, amount 500_000, no account → `errProceedsAccount`.
  - `lost` with no evidence → no `evidence` error; `scrapped` with 6 files → `errEvidenceTooMany`.
  - description of 9 chars → `errDescriptionShort`; 5001 → `errDescriptionLong`.
  - `incidentDate` `2026-11-18` with today `2026-11-17` → `errDateRange`; `2026-03-01` with acquisition `2026-04-02` → `errDateRange`.
  - `incidentDateBounds('2026-11-30', '2026-11-17')` → `null`.
  - `canBeFullyDepreciated(3_843_750, 0)` → false; `(2_000_000, 2_000_000)` → true.
  - `validateEvidenceFile({type:'text/plain', size: 3})` → `errFileType`; `{type:'image/png', size: 10*1024*1024+1}` → `errFileSize`.
  - `disposalTypeLabelKey(null, 9_000_000)` → `legacySold`; `(null, 0)` → `legacyDisposed`; `('scrapped', 0)` → `type_scrapped`.
  - `lastClosedMonth('2026-11-17')` → `2026-10`; `('2026-01-05')` → `2025-12`.
  - `writeOffChecklist` for `lost` has no `evidence` row; for `sold` has `proceedsAmount` and `proceedsAccount` rows.
- [ ] **Step 2:** `yarn vitest run src/module/assets/domain/writeOffRules.test.ts` → FAIL (module not found).
- [ ] **Step 3:** Implement the two files and the `asset.ts` changes.
- [ ] **Step 4:** Same command → PASS. `yarn typecheck` will fail where `DisposalValues` is still used; that is fixed in Task 2 and Task 6.

### Task 2: Infrastructure (DTO, mapper, API)

**Files:**
- Create: `src/module/assets/infrastructure/writeOffDto.ts`, `writeOffMapper.ts`, `writeOffApi.ts`
- Test: `writeOffMapper.test.ts`, `writeOffApi.test.ts`
- Modify: `assetDto.ts`, `assetMapper.ts` (+ its test), `assetApi.ts` (+ its test): add `depreciationDue`, `disposalType`, `disposalReport`, summary `ownedCount`/`pending`; delete `disposeAsset`, `ASSET_ENDPOINTS.dispose`, `DisposalValues` uses.

**Interfaces:**
- Consumes: Task 1 types.
- Produces (`writeOffApi.ts`):
  - `WRITE_OFF_ENDPOINTS = { list: '/v1/asset-reports', detail: (id) => `/v1/asset-reports/${id}`, approve: (id) => …/approve, reject: (id) => …/reject, attachments: (id) => …/attachments, pdf: (id) => …/pdf, me: '/v1/users/me', runDepreciation: '/v1/assets/depreciation/run' }`.
  - `fetchWriteOffs(params: WriteOffListParams): Promise<Paginated<WriteOffReport>>` (send only defined params; the API rejects unknown ones).
  - `fetchWriteOff(id: string): Promise<WriteOffReport>`.
  - `createWriteOff(assetId: string, draft: WriteOffDraft): Promise<WriteOffReport>` — `FormData`: `assetId`, `type`, `incidentDate`, `description`, `proceedsAmount` (0 when not `hasProceeds` and not `sold`), `proceedsAccount` only when amount > 0, `gainLossAccount` only when set, `signature` as `signature.png`, each evidence file as `attachments`.
  - `approveWriteOff(id: string, signature: Blob, note: string): Promise<WriteOffReport>` (multipart; `note` only when non-empty).
  - `rejectWriteOff(id: string, reason: string): Promise<WriteOffReport>` (JSON `{ reason }`).
  - `addWriteOffAttachments(id: string, files: File[]): Promise<WriteOffReport>`.
  - `downloadWriteOffPdf(id: string): Promise<{ blob: Blob; fileName: string }>` (`responseType: 'blob'`; file name from `Content-Disposition`, fallback `berita-acara.pdf`).
  - `fetchCurrentUserId(): Promise<string>`.
  - `runDepreciation(input: { assetId?: string; upTo: string }): Promise<DepreciationRunResult>`.
- Produces (`writeOffMapper.ts`): `mapWriteOff(dto): WriteOffReport` — `incidentDate` cut to `YYYY-MM-DD`; `imageUrl` and attachment `url` as `${BASE_URL}/${filePath}`; `signatures[].state === 'rejected'` carries `note`; `decidedAt` = `rejectedAt ?? approvals[0]?.at ?? null`; `waitingOnRoles` = names of `pendingApprovers[].roles` not approved; an unknown `type` string maps to `'scrapped'` (guarded by `isWriteOffType`) so the page still renders, noted in the README.

- [ ] **Step 1: Write failing tests.**
  - `writeOffMapper.test.ts`: maps the live create response of `BA/ASET/2026/11/0001` (copy the JSON from the spec contract fields: number, `damaged`, two signatures, one attachment `uploads/1794908423545-a9addad32da4fdc3.png`) → `attachments[0].url === BASE_URL + '/uploads/1794908423545-a9addad32da4fdc3.png'`, `signatures[1].state === 'waiting'`, `waitingOnRoles` `['Chief Finance']`, `incidentDate` `'2026-11-10'`; a rejected DTO puts the reason in `signatures[1].note`.
  - `assetMapper.test.ts`: a row without `depreciationDue` maps to `{ months: 0, amount: 0, upTo: '' }`; with `{months:7, amount:656250, upTo:'2026-10'}` keeps it; `disposalReport: '6afc…'` → `disposalReportId`; summary maps `ownedCount: 5`, `pending: { count: 1, totalAcquisitionCost: 1000 }`.
  - `writeOffApi.test.ts` (mock `apiClient` like `assetApi.test.ts`): `createWriteOff` posts `FormData` to `/v1/asset-reports` with no `proceedsAccount` when amount is 0; `rejectWriteOff('r1','Akun salah')` posts `{ reason: 'Akun salah' }` to `/v1/asset-reports/r1/reject`; `fetchWriteOffs({page:1,limit:10,status:'PENDING_APPROVAL'})` sends exactly `{page:1,limit:10,status:'PENDING_APPROVAL'}`; `downloadWriteOffPdf` reads `BA-ASET-2026-11-0001.pdf` from `content-disposition`; `runDepreciation({upTo:'2026-10'})` posts `{ upTo: '2026-10' }`.
  - `assetApi.test.ts`: remove the dispose tests.
- [ ] **Step 2:** `yarn vitest run src/module/assets/infrastructure` → FAIL.
- [ ] **Step 3:** Implement.
- [ ] **Step 4:** Same command → PASS.

### Task 3: Query hooks and copy

**Files:**
- Create: `src/module/assets/presentation/hooks/useWriteOffQueries.ts`
- Create: `src/i18n/locales/id/assetWriteOffs.ts`, `src/i18n/locales/en/assetWriteOffs.ts`, `src/i18n/locales/assetWriteOffs.test.ts`; register in both locale `index.ts`
- Modify: `useAssetQueries.ts` (remove `useDisposeAsset`, `DisposalValues` import)

**Interfaces:**
- Produces: `writeOffKeys = { all: ['asset-write-offs'], list: (p) => [...,'list',p], detail: (id) => [...,'detail',id], pendingForAsset: (assetId) => [...,'pending',assetId], decisions: [...,'decisions'], me: ['current-user-id'] }`.
- `useWriteOffs(params)`, `useWriteOff(id)`, `usePendingWriteOffForAsset(assetId: string|undefined): UseQueryResult<WriteOffReport|null>` (list with `assetId`, `status: 'PENDING_APPROVAL'`, `limit: 1`), `useWriteOffDecisions(): { reports: WriteOffReport[]; count: number; isLoading }` (status pending, `limit: 100`, filter `canDecide`, `refetchInterval: 30_000`), `useCurrentUserId()` (`staleTime: Infinity`).
- Mutations (each invalidates `writeOffKeys.all` and `assetKeys.all`, notifies with `assetWriteOffs` copy, errors through `getApiErrorMessage`): `useCreateWriteOff(assetId)`, `useApproveWriteOff(id)` (`{ signature, note }`), `useRejectWriteOff(id)` (`reason`), `useAddWriteOffAttachments(id)`, `useDownloadWriteOffPdf()` (triggers a browser download from the blob), `useRunDepreciation()`.
- Copy fixed by the spec (id / en): `needsYouTitle` "Menunggu Anda" / "Waiting on you"; `formTitle` "Ajukan Berita Acara Pelepasan" / "File a disposal report"; `submit` "Ajukan berita acara" / "Submit report"; `approve` "Setujui & tandatangani" / "Approve and sign"; `reject` "Tolak" / "Reject"; `type_sold` "Dijual", `type_scrapped` "Dimusnahkan", `type_fully_depreciated` "Habis disusutkan", `type_damaged` "Rusak", `type_lost` "Hilang"; `legacySold` "Dijual"; `legacyDisposed` "Dilepas"; `status_PENDING_APPROVAL` "Menunggu persetujuan", `status_APPROVED` "Disetujui", `status_REJECTED` "Ditolak"; `allDoneTitle` "Semua beres"; `proceedsToggle` "Ada uang yang diterima? (misalnya klaim asuransi atau jual rongsokan)"; `eSigned` "Ditandatangani secara elektronik"; `approveConsequence` "Jurnal pelepasan akan dibukukan dan aset berstatus Dilepas." Everything else is the implementer's wording under `docs/ui-guidelines.md` and [[feedback-ui-copy-no-technical-wording]].

- [ ] **Step 1:** Write `assetWriteOffs.test.ts` (same keys, same placeholders, no empty values) → FAIL.
- [ ] **Step 2:** Add both locale files, register them, write the hooks.
- [ ] **Step 3:** `yarn vitest run src/i18n/locales/assetWriteOffs.test.ts && yarn typecheck` → PASS except for the dispose modal (removed in Task 6).

### Task 4: AssetIllustration

**Files:**
- Create: `src/module/assets/presentation/components/AssetIllustration.tsx`, `AssetIllustration.module.css`

**Interfaces:**
- Produces: `type AssetIllustrationName = 'hero' | 'sold' | 'scrapped' | 'fully_depreciated' | 'damaged' | 'lost' | 'approved' | 'rejected' | 'allDone' | 'submitted'`; `AssetIllustration({ name, size?: number })` renders an `aria-hidden` inline SVG.
- Style copies `src/module/period-closing/presentation/components/PeriodIllustration.tsx`: line drawing on theme CSS variables (`--mantine-color-primary-*`, `--mantine-color-secondary-*`), dark-mode aware, no hardcoded hex.

- [ ] **Step 1:** Build it; check every drawing in the browser at 48 px (type cards) and 160 px (empty, success).
- [ ] **Step 2:** `yarn lint:stylelint` → PASS.

### Task 5: SignaturePad

**Files:**
- Create: `src/module/assets/presentation/components/SignaturePad.tsx`, `SignaturePad.module.css`
- Test: `SignaturePad.test.tsx`

**Interfaces:**
- Produces: `SignaturePad({ value: Blob|null, onChange: (blob: Blob|null) => void, label: string, error?: string })`. Pointer events (mouse, pen, touch, `touch-action: none`), devicePixelRatio-aware canvas, exports PNG via `canvas.toBlob` on pointer up. Buttons: "Hapus" (clears, `onChange(null)`) and "Unggah gambar" (hidden `FileInput` accepting `WRITE_OFF_LIMITS.signatureMime`; the uploaded image is shown in place of the canvas). Keyboard users reach the upload button; the canvas has `role="img"` and an `aria-label`.

- [ ] **Step 1: Failing tests:** uploading a PNG calls `onChange` with that file and shows the preview; "Hapus" calls `onChange(null)`; uploading `text/plain` shows the error copy and does not call `onChange`.
- [ ] **Step 2:** `yarn vitest run src/module/assets/presentation/components/SignaturePad.test.tsx` → FAIL; implement; → PASS. (jsdom has no canvas drawing; drawing is checked in the browser in Task 11.)

### Task 6: Report form page (Part A)

**Files:**
- Create: `presentation/pages/WriteOffFormPage.tsx` (+ `.test.tsx`), `presentation/components/WriteOffTypeCards.tsx`, `WriteOffEvidenceDropzone.tsx`, `WriteOffSheet.tsx` (+ `.module.css`, the paper document shared with Task 7), `WriteOffChecklist.tsx`, `presentation/hooks/useWriteOffForm.ts`
- Modify: `src/router/routes.ts` (`assets.writeOffNew: '/assets/write-offs/new'`, `assets.writeOffDetail: '/assets/write-offs/:id'`, `assets.needsYou: '/assets/needs-you'`), `src/router/modules/assets.tsx`, `src/module/assets/index.ts`, `AssetDetailHeader.tsx` (`onDispose` → navigate), `AssetDetailPage.tsx`, `useAssetDialogs.ts` and `AssetDialogs.tsx` (drop `dispose`)
- Delete: `AssetDisposalModal.tsx`; the old `dispose*` keys in `src/i18n/locales/{id,en}/assets.ts` that nothing uses any more

**Interfaces:**
- Consumes: Tasks 1–5; `useAsset`, `useDisposalPreview`, `useAssetAccounts`, `AccountSelect`, `MoneyInput`, `UnsavedChangesGuard`, `ModuleHeader`.
- Produces: `WriteOffSheet({ model: WriteOffSheetModel })` with `WriteOffSheetModel = { titleKey: string; number: string|null; status: WriteOffStatus|null; snapshot: Pick<WriteOffSnapshot,'code'|'name'|'categoryName'|'location'|'brand'|'modelType'|'serialNumber'|'acquisitionDate'|'acquisitionCost'>; incidentDate: string; description: string; figures: { bookValue: number; catchUp: number; received: number; gainLoss: number; estimate: boolean } | null; attachments: { name: string; url: string|null; isImage: boolean }[]; signatures: WriteOffSignature[] }`; `useWriteOffForm(asset: AssetItem)` returns the Mantine form, `errors` from `validateWriteOffDraft`, `checklist`, `previewModel: WriteOffSheetModel`, `submit()`.
- Page behaviour (spec Part A): reads `?asset=`; missing or unknown asset → not-found state with a link to the list; asset not `active` → notice and back link; `usePendingWriteOffForAsset` returns a report → notice "Aset ini sudah punya berita acara yang menunggu persetujuan" with a button to it, no form. `fully_depreciated` card disabled with its reason when `!canBeFullyDepreciated(preview.bookValue, asset.residualValue)`. Date picker `minDate`/`maxDate` from `incidentDateBounds`; when it returns null the form shows why and the submit stays disabled. Preview figures from `useDisposalPreview(asset.id, incidentDate, received)`. On success navigate to `routes.assets.writeOffDetail` with `state: { justSubmitted: true }`.
- Breadcrumb: add `{ prefix: '/assets/write-offs', titleKey: 'assetWriteOffs', groupKey: 'groupAccounting' }` to `extraTitles` and the `navigation` locale key.

- [ ] **Step 1: Failing tests** (`WriteOffFormPage.test.tsx`, mock `apiClient` like `AssetDetailPage.test.tsx`):
  - renders the five type cards and the sheet title changes to the `damaged` title after picking "Rusak".
  - with a pending report from `/v1/asset-reports` the form is absent and the link points to `/assets/write-offs/r1`.
  - the submit button is disabled and names the missing items until type, description (≥ 10), one evidence file and a signature are given; then it posts `FormData` to `/v1/asset-reports` and navigates to `/assets/write-offs/<id>`.
  - a 400 `{ message: 'Aset ini sudah punya berita acara yang menunggu persetujuan' }` shows that sentence and keeps the typed description.
  - "Habis disusutkan" is disabled when the preview book value (3_843_750) is above `residualValue` (0).
  - asset acquired after today → the date-range explanation is shown and submit is disabled.
- [ ] **Step 2:** `yarn vitest run src/module/assets/presentation/pages/WriteOffFormPage.test.tsx` → FAIL.
- [ ] **Step 3:** Implement; update `AssetDetailPage.test.tsx` for the dispose menu item that now navigates.
- [ ] **Step 4:** `yarn vitest run src/module/assets src/router` and `yarn typecheck` → PASS.

### Task 7: Report document page (Part B)

**Files:**
- Create: `presentation/pages/WriteOffDetailPage.tsx` (+ `.test.tsx`), `presentation/components/WriteOffTimeline.tsx`, `WriteOffDecisionCard.tsx`, `WriteOffApproveModal.tsx`, `WriteOffRejectModal.tsx`, `WriteOffEvidenceGallery.tsx`
- Modify: `src/router/modules/assets.tsx`, `index.ts`

**Interfaces:**
- Consumes: `WriteOffSheet` (Task 6), `SignaturePad`, `AssetIllustration` (`approved`/`rejected` stamp, `submitted` for `location.state.justSubmitted`), hooks of Task 3.
- Behaviour per spec Part B. Decision card only when `canDecide && status === 'PENDING_APPROVAL'`. "Tambah bukti" while pending and `attachments.length < 5`. Approved: link to `/assets/:assetId?tab=journals`. Figures: `result` when approved (`estimate: false`), else snapshot estimate (`estimate: true`).

- [ ] **Step 1: Failing tests:**
  - pending report with `canDecide: true` shows "Setujui & tandatangani" and "Tolak"; with `canDecide: false` neither.
  - rejecting with "ab" shows the length error and sends nothing; with "Akun aset belum benar" posts `{ reason }` and the page shows "Ditolak" and the reason.
  - approve posts multipart to `/v1/asset-reports/r1/approve`; a 400 `{ message: 'Akun kas kecil KK-QA (Kas Kecil Test QA Claude) tidak boleh dipakai di jurnal manual. Gunakan menu Kas Kecil.' }` keeps the modal open with that sentence and the status badge still reads "Menunggu persetujuan" (Review Focus 1).
  - approved report shows the "DISETUJUI" stamp, `result.gainLoss` without "perkiraan", and a link to the asset's journals.
  - a signature with `imageUrl: null` and `state: 'signed'` shows "Ditandatangani secara elektronik".
- [ ] **Step 2:** `yarn vitest run src/module/assets/presentation/pages/WriteOffDetailPage.test.tsx` → FAIL; implement; → PASS.

### Task 8: Pending report on the asset detail page

**Files:**
- Modify: `AssetDetailPage.tsx`, `AssetDetailHeader.tsx`, `AssetDetailNotices.tsx`, `AssetDetailPage.test.tsx`

**Interfaces:**
- Consumes: `usePendingWriteOffForAsset(id)` (only for `active` assets).
- Produces: `AssetWriteOffNotice({ report, onOpen })`; header item reads "Lihat berita acara" and opens the report when one is pending, else "Lepas aset" and navigates to `writeOffNew?asset=<id>`. A disposed asset with `disposalReportId` shows a link "Berita acara" in the header.

- [ ] **Step 1: Failing tests:** active asset with a pending report shows the notice with `BA/ASET/2026/11/0001` and the header item "Lihat berita acara"; without one, "Lepas aset" navigates to `/assets/write-offs/new?asset=a1`.
- [ ] **Step 2:** run `yarn vitest run src/module/assets/presentation/pages/AssetDetailPage.test.tsx` → FAIL; implement; → PASS.

### Task 9: "Menunggu Anda" hub (Part C)

**Files:**
- Create: `presentation/pages/NeedsYouPage.tsx` (+ `.test.tsx`), `presentation/components/NeedsYouTiles.tsx`, `NeedsYouDecisionList.tsx`, `NeedsYouPendingAssets.tsx`, `NeedsYouDepreciation.tsx`, `NeedsYouOwnReports.tsx`, `WriteOffHistoryTable.tsx`
- Modify: `src/router/modules/assets.tsx`, `index.ts` (export `NeedsYouPage`, `useWriteOffDecisions`)

**Interfaces:**
- Consumes: `useWriteOffDecisions`, `useWriteOffs`, `useCurrentUserId`, `useAssets({ status: 'pending', … })`, `useAssets({ status: 'active', limit: 100 })` filtered on `depreciationDue.months > 0`, `useAssetSummary`, `useRunDepreciation`, `AssetDialogs` (activation dialog).
- Layout per spec Part C. "Diajukan oleh Anda": pending reports where `createdBy.id === currentUserId`. "Bukukan sampai <bulan>" calls `runDepreciation({ upTo: lastClosedMonth(today) })` after a confirm modal that lists the plan figures already shown; afterwards a result panel lists `failed` and `skipped` with their reasons. History table: `useWriteOffs` with status/type tabs and search, standard empty state inside the table frame. All groups empty → `AssetIllustration name="allDone"` and "Semua beres".

- [ ] **Step 1: Failing tests:** tiles show `2`, `1`, and "Rp 23.156.250" for the Demo Site figures (AC/001 656_250 + GST/002 22_500_000); a group with no items is not rendered; all empty shows "Semua beres"; the run posts `{ upTo: '2026-10' }` (fake today `2026-11-17`) and a response with `failed: [{ code: 'GST/002', reason: 'Periode Oktober 2026 dikunci' }]` lists that line (Review Focus 5); "Diajukan oleh Anda" lists only rows whose `createdBy.id` is the `/v1/users/me` id.
- [ ] **Step 2:** `yarn vitest run src/module/assets/presentation/pages/NeedsYouPage.test.tsx` → FAIL; implement; → PASS.

### Task 10: Navigation, asset list and disposed columns

**Files:**
- Modify: `src/components/Navbar/navigationRegistry.ts` (Aset item → `children`: Daftar Aset `routes.assets.main` icon `Toolbox`, Menunggu Anda `routes.assets.needsYou` with `badge: 'assetDecisions'`; `match: '/assets'`), `Navbar.tsx` (child badges; `badge` union `'pendingChanges' | 'assetDecisions'`; count from `useWriteOffDecisions` through `@/module/assets`), `src/i18n/locales/{id,en}/navigation.ts`
- Modify: `AssetTableFilters.tsx`, `useAssetListParams.ts` (statuses without `pending`; a `?status=pending` URL falls back to all), `AssetStatsGrid.tsx` (unit card uses `ownedCount`), `AssetTable.tsx`/`AssetTableRow.tsx` (on the `disposed` tab: "Jenis" from `disposalTypeLabelKey`, "BA" link when `disposalReportId`, header "Hasil pelepasan")
- Modify tests: `AssetPage.test.tsx`, Navbar tests if present
- Modify: `src/module/assets/README.md` (routes, endpoints, rules, the Navbar import listed as a known gap like pending-changes), `docs/modules/README.md` if it lists module routes

**Interfaces:**
- Consumes: `useWriteOffDecisions().count`.

- [ ] **Step 1: Failing tests:** asset list has no "Pending" tab and `?status=pending` shows all owned assets; disposed tab shows "Dijual" for a null-type row with price 9_000_000, "Dilepas" for price 0, "Dimusnahkan" with a link to `/assets/write-offs/<id>` for a `scrapped` row (Review Focus 4); only one sidebar entry is active on `/assets/needs-you`.
- [ ] **Step 2:** `yarn vitest run src/module/assets src/components/Navbar src/router` → FAIL; implement; → PASS.

### Task 11: Verify, review with the user, commit

- [ ] **Step 1:** `yarn test` → typecheck, prettier, lint ratchet, vitest and build all PASS. Report any baseline failure separately from this change.
- [ ] **Step 2:** `yarn dev`, sign in as finance2 on the Demo Site and walk through, with screenshots at desktop and 390 px width: file a `damaged` report for AC/001 (draw the signature with the mouse), open it, reject it; file a `scrapped` report for another active asset with clean accounts and approve it; open the hub (decisions, pending asset UJI-FUTURE/001, depreciation AC/001 and GST/002 — do not run the depreciation unless the user asks); check the disposed tab columns and the sidebar badge. Test data stays (see [[feedback-keep-api-test-data]]).
- [ ] **Step 3:** Show the screenshots to the user. Iterate until the user approves.
- [ ] **Step 4:** Commit on `feat/asset-write-off` (spec, plan, code) in logical commits: `feat(assets): write-off report form and document pages`, `feat(assets): Menunggu Anda hub and asset list changes`, `docs(assets): write-off design, plan and README`. End each message with the attribution line from the session. No push.
