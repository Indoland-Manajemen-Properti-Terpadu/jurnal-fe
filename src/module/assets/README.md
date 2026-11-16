# assets

Fixed asset register backed by the API. An asset is `pending` (no accounts or depreciation, not in the books), `active`, `fully_depreciated` or `disposed`. Assets arrive from ProApps as `pending`, or are added here; activating one chooses its ledger accounts and depreciation and posts the acquisition journal.

- **Routes:** `routes.assets.main` (`/assets`), `routes.legacyPaths.assets` (`/asset`) and `routes.assets.detail` (`/assets/:id`). The router wraps both pages in `AppShellLayout`.
- **Public API (`index.ts`):** `AssetPage`, `AssetDetailPage`.
- **Access:** the API needs create/update rights on the Asset menu (`JP-ASSET`); without them it answers `403`.
- **Layers:** `domain/` (types, rules, port), `infrastructure/` (DTO, mapper, `assetApi.ts` implements the port), `presentation/` (pages, components, query hooks).

## Screens

- **List:** status tabs with counts, search, sort and pagination (all server side, kept in the URL), totals from `/summary`. Row menu: detail, edit, activate (pending), dispose (active).
- **Detail:** the header (status, code, actions), a notice for a pending asset (with the activate action), the book value strip, then one panel with pill tabs written like the list's (`Jurnal (2)`), kept in `?tab=`: **Detail Aset** (photo gallery, general information, specifications and warranty with a status badge, tags and notes; a side pane with the vendor and the ledger accounts), **Penyusutan** (terms, the yearly schedule with the current year marked, a short explanation using the asset's own figures) and **Jurnal** (the posted journals, each with a link to the journal detail). Missing photos, specifications or vendor show a slim prompt with the edit action instead of an empty card. Actions by status: edit, change depreciation, dispose.
- **Dialogs** (`AssetDialogs`, one open at a time): add or edit, activate or change accounts and depreciation, dispose. The activation form shows the acquisition journal it will post and an estimate of the monthly depreciation; an account cannot be picked twice.

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
| Dispose                          | `POST /v1/assets/:id/dispose`: `disposalDate` (not in the future), `disposalPrice`, `proceedsAccount`, `gainLossAccount`                                                                                                       |
| Account lists                    | `GET /v1/accounts/simple?type=fixed_asset\|accumulated_depreciation\|depreciation_expense` (flat, already narrowed); `GET /v1/accounts` (nested, for the counter and disposal accounts)                                        |
| Disposal estimate                | `GET /v1/assets/:id/dispose-preview?disposalDate&disposalPrice` returns `catchUpDepreciation`, `accumulatedDepreciation`, `bookValue`, `gainLoss` (negative is a loss); `400` for a pending asset or a date before acquisition |
| Reference data                   | `GET /v1/tags`, `GET /v1/contacts?contactType=Supplier&search=&limit=20` (vendors)                                                                                                                                             |

The activation block is `assetAccount`, `creditAccount`, `accumDeprAccount`, `deprExpenseAccount` (all different), `depreciationMethod` (`straight_line`, `double_declining`, `none`), `usefulLifeYears`, `residualValue`, `accumulatedDepreciation` (depreciation before the asset was recorded) and `depreciationStartDate` (`null` = acquisition date). Without depreciation (`none`, life 0) only the asset and counter account are needed. There is no delete endpoint.

## Rules

- **Who can edit what** (`domain/assetRules.ts`, mirrored by the API): an asset pushed from ProApps keeps its master data there, so only its tags can change; an asset made in Jurnal can change name, category and notes at any time and code, date and cost only while pending; a disposed asset is closed. The edit request sends only the fields the asset allows, because the API rejects the rest.
- **Activation journal:** debit the asset account for the cost; credit the accumulated depreciation account for the depreciation before recording, and the counter account for the book value.
- **Disposal:** depreciation not yet posted up to the month before the disposal date is posted first. The gain or loss in the dialog is an estimate (`price - net book value`); the API posts the final figure. Only an active asset can be disposed.
- **Revising an active asset:** if the accounts or the opening depreciation change, the old acquisition journal is voided with a reversing journal and a new one is posted; the API refuses once depreciation has been posted.
- **Numbers come from the API:** accumulated depreciation, book value, monthly estimate and the schedule (`year`, `months`, `beginning`, `expense`, `accumulated`, `ending`). `domain/depreciation.ts` only holds the live monthly estimate of the form (straight line and double declining match the API's `monthlyEstimate`) and display helpers. Money sums in rules use `@/lib/money`.
- The totals exclude pending assets (the API's definition), so a register that only has pending assets shows `Rp 0` there.
- Category is free text (`categoryName`).
- A `proappsSyncError` on an asset (the hand-over to ProApps did not go through) is shown as a calm notice; the asset is saved in Jurnal. In the sandbox this appears on every new asset because ProApps cannot be reached.

## Form guards (PRO-85)

- The acquisition date cannot be later than today (date picker `maxDate` and the form rule `errDateFuture`). The API now also answers `400` "Tanggal perolehan tidak boleh di masa depan" and the notification shows that message.
- Asset, accumulated depreciation and depreciation expense accounts come from `/v1/accounts/simple?type=...` (`useAssetAccountsOfKind`), so each field lists only accounts of its own group. The API does not refuse a wrong category itself; the filter is only here. The counter account still lists every account.
- The disposal gain/loss account is optional: empty makes the API use the account mapped to asset disposal gain/loss. The form shows the API's error as is.
- The disposal dialog shows the figure of `dispose-preview` (debounced 400 ms, previous figure kept while loading) instead of a local calculation, plus the depreciation booked first. A date in the future is not sent; a `400` of the preview is shown in the panel.
- Depreciation starts in the month of "Mulai disusutkan" (verified: start 2026-11-01 gives 2 months in 2026). The schedule always comes from the API.
- Still needing the backend: the "Total Nilai Perolehan" card sums only active assets while its hint counts every registered one, and an asset cannot be deleted (no endpoint).

## Details, vendor and photos

- Optional facts on the add/edit form and the detail page: `brand`, `modelType`, `serialNumber`, `warrantyUntil`, `condition` (`new`, `second`, `refurbished`), `location`, `vendor` and `photos`. They follow the `details` edit right, so an asset from ProApps shows them read-only.
- **Vendor:** the form sends `vendorContactId` (a Supplier contact; `null` on edit removes it). The API copies name, phone, email and address from the contact on every read (`vendor`). The picker (`AssetVendorField`) searches `GET /v1/contacts?contactType=Supplier` (cached by the API for 60 s) and can add a contact through `ContactQuickCreateModal` (contacts `index.ts`), shown only with create right on the Contacts menu (`JP-CNTCT`, `useMenuRight`). A contact with `needsReview` (made automatically from ProApps) shows a warning in the picker.
- **Photos:** up to 5 links as text, no upload. The API takes `http(s)://...` or a path starting with a single `/`, no spaces (`validatePhotos`). An edit sends every detail field, `null` clears one.
- The journal detail (`GET /v1/journal/detail/:id`) embeds `asset` for an asset entry; `journal-entries` shows it as the "Aset Terkait" card with a link here.

## Not built

Tag management (tags are only picked from `/v1/tags`), account-and-depreciation edit of a pending asset outside the activation dialog, and asset deletion (no endpoint).

## i18n

Namespace `assets` (`id` primary, `en`). `src/i18n/locales/assets.test.ts` checks identical keys, placeholders and no empty values.
