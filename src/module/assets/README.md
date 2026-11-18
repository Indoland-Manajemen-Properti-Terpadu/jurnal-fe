# assets

Fixed asset register backed by the API. An asset is `pending` (no accounts or depreciation, not in the books), `active`, `fully_depreciated` or `disposed`. Assets arrive from ProApps as `pending`, or are added here; activating one chooses its ledger accounts and depreciation and posts the acquisition journal.

- **Routes:** `routes.assets.main` (`/assets`), `routes.legacyPaths.assets` (`/asset`), `routes.assets.new` (`/assets/new`), `routes.assets.edit` (`/assets/:id/edit`), `routes.assets.detail` (`/assets/:id`), `routes.assets.needsYou` (`/assets/needs-you`), `routes.assets.writeOffNew` (`/assets/write-offs/new?asset=:id`) and `routes.assets.writeOffDetail` (`/assets/write-offs/:id`). The router wraps every page in `AppShellLayout`. The sidebar has one entry, "Aset Tetap", with the decision count as its badge; Menunggu Anda has no entry of its own and opens from the panel under the asset list header.
- **Public API (`index.ts`):** `AssetPage`, `AssetDetailPage`, `NeedsYouPage`, `WriteOffFormPage`, `WriteOffDetailPage`. The sidebar badge count lives in the small [`asset-decisions`](../asset-decisions/README.md) module so the Navbar does not import this one.
- **Access:** the API needs create/update rights on the Asset menu (`JP-ASSET`); without them it answers `403`.
- **Layers:** `domain/` (types, rules, port), `infrastructure/` (DTO, mapper, `assetApi.ts` implements the port), `presentation/` (pages, components, query hooks).

## Screens

- **List:** status tabs Aktif (default), Habis Disusutkan and Dilepas with counts, search, sort and pagination (all server side, kept in the URL), totals from `/summary`. There is no "Semua" or pending tab: pending assets live in Menunggu Anda, and the API cannot leave pending out of an unfiltered list. An old `?status=pending` link opens Aktif. (PRO-93 finding 4 asked for a pending tab and was dropped on purpose.) The Dilepas tab shows "Hasil pelepasan" and "Jenis" (a disposal from before write-off reports, with no `disposalType`, reads "Dijual" when its price is above 0, else "Dilepas") with a link to the report. The unit card counts `ownedCount`.
- **Detail:** the header (status, code, actions), a notice for a pending asset (with the activate action), the book value strip, then one panel with pill tabs written like the list's (`Jurnal (2)`), kept in `?tab=`: **Detail Aset** (photo gallery, general information, specifications and warranty with a status badge, tags and notes; a side pane with the vendor and the ledger accounts), **Penyusutan** (terms, the yearly schedule with the current year marked, a short explanation using the asset's own figures) and **Jurnal** (the posted journals, each with a link to the journal detail). Missing photos, specifications or vendor show a slim prompt with the edit action instead of an empty card. Actions by status: edit, change depreciation, dispose (opens the report form). An active asset with a pending report shows a notice and its menu opens that report instead; a disposed asset links to the report that disposed it.
- **Dialogs** (`AssetDialogs`, one open at a time): add or edit, activate or change accounts and depreciation. The activation form shows the acquisition journal it will post and an estimate of the monthly depreciation; an account cannot be picked twice.

## Endpoints (`infrastructure/assetApi.ts`)

Verified against the sandbox and the "Assets" folder of the Postman collection "All Features".

| Action                           | Request                                                                                                                                                                                                                        |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| List                             | `GET /v1/assets`: `page`, `limit` (max 100), `status`, `search`, `category`, `sortBy` (`code,name,acquisitionDate,acquisitionCost,netBookValue,createdAt`), `sortOrder`; other keys answer `400`                               |
| Detail, totals, journals         | `GET /v1/assets/:id` (with `schedule`), `/summary`, `/:id/journals`                                                                                                                                                            |
| Add                              | `POST /v1/assets`: `code`, `name`, `acquisitionDate`, `acquisitionCost`; optional `categoryName`, `notes`, `tags` (ids) and an `activation` block that books the asset at once                                                 |
| Activate                         | `POST /v1/assets/:id/activate` with the activation block                                                                                                                                                                       |
| Edit data                        | `PATCH /v1/assets/:id`                                                                                                                                                                                                         |
| Change accounts and depreciation | `PATCH /v1/assets/:id` with `{ activation }`                                                                                                                                                                                   |
| Account lists                    | `GET /v1/accounts/simple?type=fixed_asset\|accumulated_depreciation\|depreciation_expense` (flat, already narrowed); `GET /v1/accounts` (nested, for the counter and disposal accounts)                                        |
| Disposal estimate                | `GET /v1/assets/:id/dispose-preview?disposalDate&disposalPrice` returns `catchUpDepreciation`, `accumulatedDepreciation`, `bookValue`, `gainLoss` (negative is a loss); `400` for a pending asset or a date before acquisition |
| Reference data                   | `GET /v1/tags`, `GET /v1/contacts?contactType=Supplier&search=&limit=20` (vendors)                                                                                                                                             |

The activation block is `assetAccount`, `creditAccount`, `accumDeprAccount`, `deprExpenseAccount` (all different), `depreciationMethod` (`straight_line`, `double_declining`, `none`), `usefulLifeYears`, `residualValue`, `accumulatedDepreciation` (depreciation before the asset was recorded) and `depreciationStartDate` (`null` = acquisition date). Without depreciation (`none`, life 0) only the asset and counter account are needed. `POST /v1/assets/:id/dispose` now always answers `400`; every disposal goes through a write-off report (below).

## Rules

- **Who can edit what** (`domain/assetRules.ts`, mirrored by the API): an asset pushed from ProApps keeps its master data there, so only its tags can change; an asset made in Jurnal can change name, category and notes at any time and code, date and cost only while pending; a disposed asset is closed. The edit request sends only the fields the asset allows, because the API rejects the rest.
- **Activation journal:** debit the asset account for the cost; credit the accumulated depreciation account for the depreciation before recording, and the counter account for the book value.
- **Disposal:** only through an approved write-off report. On approval the API posts the depreciation still due, then the disposal journal (`Penghapusan Aset … (BA/ASET/…)`, or `Penjualan Aset …` for a sale). Until then the asset stays active and in the totals.
- **Revising an active asset:** if the accounts or the opening depreciation change, the old acquisition journal is voided with a reversing journal and a new one is posted; the API refuses once depreciation has been posted.
- **Numbers come from the API:** accumulated depreciation, book value, monthly estimate and the schedule (`year`, `months`, `beginning`, `expense`, `accumulated`, `ending`). `domain/depreciation.ts` only holds the live monthly estimate of the form (straight line and double declining match the API's `monthlyEstimate`) and display helpers. Money sums in rules use `@/lib/money`.
- The totals exclude pending assets (the API's definition), so a register that only has pending assets shows `Rp 0` there.
- Category is free text (`categoryName`).
- A `proappsSyncError` on an asset (the hand-over to ProApps did not go through) is shown as a calm notice; the asset is saved in Jurnal. In the sandbox this appears on every new asset because ProApps cannot be reached.

## Form guards (PRO-85)

- The acquisition date cannot be later than today (date picker `maxDate` and the form rule `errDateFuture`). The API now also answers `400` "Tanggal perolehan tidak boleh di masa depan" and the notification shows that message.
- Asset, accumulated depreciation and depreciation expense accounts come from `/v1/accounts/simple?type=...` (`useAssetAccountsOfKind`), so each field lists only accounts of its own group. The API does not refuse a wrong category itself; the filter is only here. The counter account still lists every account.
- The disposal gain/loss account is optional: empty makes the API use the account mapped to asset disposal gain/loss.
- The report form shows the figures of `dispose-preview` (debounced 400 ms, previous figure kept while loading) in its live document.
- Depreciation starts in the month of "Mulai disusutkan" (verified: start 2026-11-01 gives 2 months in 2026). The schedule always comes from the API.
- Still needing the backend: an asset cannot be deleted from this screen yet (the endpoint exists; the screen is a later slice).

## Details, vendor and photos

- Optional facts on the add/edit form and the detail page: `brand`, `modelType`, `serialNumber`, `warrantyUntil`, `condition` (`new`, `second`, `refurbished`), `location`, `vendor` and `photos`. They follow the `details` edit right, so an asset from ProApps shows them read-only.
- **Vendor:** the form sends `vendorContactId` (a Supplier contact; `null` on edit removes it). The API copies name, phone, email and address from the contact on every read (`vendor`). The picker (`AssetVendorField`) searches `GET /v1/contacts?contactType=Supplier` (cached by the API for 60 s) and can add a contact through `ContactQuickCreateModal` (contacts `index.ts`), shown only with create right on the Contacts menu (`JP-CNTCT`, `useMenuRight`). A contact with `needsReview` (made automatically from ProApps) shows a warning in the picker.
- **Photos:** up to 5, picked on the add/edit page (JPG, PNG or WebP, 5 MB each). Two steps: `POST /v1/assets/photos` (multipart, field `photos`, content type left to the browser) answers `urls`, which are then sent in `photos` of the JSON create or `PATCH` together with the saved ones. Saved photos can be removed from the asset; the file stays on the server. 400 messages of the upload are shown as they are. An edit sends every detail field, `null` clears one.
- **Add/edit page:** `AssetFormPage` replaces the old modal; activation and revising accounts remain dialogs.
- **Account check (PRO-93):** `useAssetAccountCheck` compares an active asset's saved accounts with the `fixed_asset`, `accumulated_depreciation` and `depreciation_expense` account groups. A mismatch shows a warning on the detail page and the revise dialog, and holds "Bukukan" in Menunggu Anda.
- **Separation of duties:** `separateDuties` removes the decision from whoever filed the report, whatever `canDecide` says.
- The journal detail (`GET /v1/journal/detail/:id`) embeds `asset` for an asset entry; `journal-entries` shows it as the "Aset Terkait" card with a link here.

## Write-off reports and Menunggu Anda

Verified live on the Demo Site on 2026-11-17. Code: `domain/writeOff.ts`, `domain/writeOffRules.ts`, `infrastructure/writeOffApi.ts`, `presentation/hooks/useWriteOffQueries.ts`, `useWriteOffForm.ts`.

| Action | Request |
| --- | --- |
| List | `GET /v1/asset-reports`: `page`, `limit`, `status` (`PENDING_APPROVAL`, `APPROVED`, `REJECTED`), `type`, `search`, `assetId`; rows carry `canDecide` and `createdBy` |
| Detail | `GET /v1/asset-reports/:id`: `snapshot`, `result` (after approval), `attachments`, `signatures` (`signed`, `waiting`, `rejected`; the reject reason is the `note`), `pendingApprovers`, `canDecide` |
| File | `POST /v1/asset-reports` multipart: `assetId`, `type` (`sold`, `scrapped`, `fully_depreciated`, `damaged`, `lost`), `incidentDate` (acquisition date to today), `description` (10–5000), `proceedsAmount`, `proceedsAccount` (needed when money came in), optional `gainLossAccount`, `signature` (image), `attachments` (JPG/PNG/PDF, 10 MB, 1–5; none needed for `lost`). One pending report per asset |
| Approve | `POST …/approve` multipart `signature` + optional `note`. A failure (for example a locked petty-cash asset account) changes nothing |
| Reject | `POST …/reject` JSON `reason` (at least 3 characters) |
| Evidence | `POST …/attachments` while pending, 5 files in all |
| PDF | `GET …/pdf` (`BA-ASET-YYYY-MM-NNNN.pdf`) |
| Depreciation | `GET /v1/assets` rows and the detail carry `depreciationDue { months, amount, upTo }`; `POST /v1/assets/depreciation/run` with `upTo` (never the current month) and optional `assetId` returns `plan`, `skipped`, `failed` |

- **Form** (`WriteOffFormPage`): type cards ("Habis disusutkan" only when the book value is at or below the residual value), date (defaults to today, limited to acquisition date…today), chronology, money received (required for a sale, behind a switch for other types), evidence dropzone, signature pad (drawn or uploaded) and a live document with a checklist; the submit button waits for the checklist. An asset with a pending report shows that report instead.
- **Document** (`WriteOffDetailPage`): laid out like a purchasing document. Header with the number, a status badge (yellow waiting, green approved, red rejected: colour only carries real state) and the PDF; "…" holds the links to the asset and its journals. A strip of four facts (type, incident date, book value, gain or loss), then cards on the left (chronology, values, evidence with "Tambah bukti" while pending, the asset as filed, signatures) and the Persetujuan card on the right: a timeline built like the purchasing approvals, the reject reason, and Setujui / Tolak when `canDecide`. On a phone the approval comes first.
- **Shared pieces:** `AssetCard` (titled card), `AssetHighlights` (the fact strip), `WorkRow` and `WorkList.module.css` (rows divided by hairlines, edge to edge, as in the purchasing work queue) and `StepTimeline`. They copy the purchasing ones rather than import them, because modules do not import each other's internals.
- **Panel on the asset list** (`NeedsYouCard`, data from `useNeedsYou`): a standard card with up to four rows, most urgent first (reports to decide, pending assets, depreciation behind, the user's own reports), each opening where it is handled (`/assets/needs-you#needs-you-pending` and `#needs-you-depreciation` scroll to their group), and "Buka semua" with a neutral count. It sits beside the totals, which turn two by two there.
- **Menunggu Anda** (`NeedsYouPage`): a fact strip whose tiles jump to their group, then one card per group (reports to decide; pending assets with an "Aktifkan" button; depreciation behind with the one primary button "Bukukan sampai <bulan lalu>", which lists what failed or was skipped), the user's own pending reports (`createdBy.id` against `/v1/users/me`) and the report history. The sidebar badge (`asset-decisions`) counts reports where `canDecide`, refreshed every 30 s.
- **Failure handling:** the approve and reject dialogs cannot be closed while the request runs. "Nothing was posted" is said only for a 4xx answer (`isRefusedByServer`); a timeout or 5xx says the outcome is not certain. A report page that fails to load for any reason but a 404 shows a retry, not "not found" (`isNotFoundError`). A gain/loss account is not sent for a fully depreciated report, whose form hides it. An uploaded signature is limited to 10 MB like evidence.
- **After a posting** (approval, depreciation run) the write-offs and assets are refreshed, and so are the journals and ledger reports, by key prefix (`LEDGER_QUERY_KEYS` in `useWriteOffQueries.ts`; those keys belong to other modules). The pending tile of the hub counts from `/summary`, since the list is one page of at most 100.
- Signature and evidence images are `BASE_URL` + `filePath`. Messages that name a raw field (`"reason" is required`) are never shown; `getApiErrorMessage` falls back to the plain sentence.
- **Known gaps:** the hub lists at most 100 pending and 100 active assets (the API page size). The API has no edit or withdrawal of a report and no "all but pending" list filter.

## Not built

Tag management (tags are only picked from `/v1/tags`), account-and-depreciation edit of a pending asset outside the activation dialog, asset deletion and photo upload from this screen (the endpoints exist).

## i18n

Namespaces `assets` and `assetWriteOffs` (`id` primary, `en`). `src/i18n/locales/assets.test.ts` and `assetWriteOffs.test.ts` check identical keys, placeholders and no empty values.
