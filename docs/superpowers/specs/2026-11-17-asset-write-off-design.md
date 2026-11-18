# Asset write-off reports and "Menunggu Anda" — design

Date: 2026-11-17 · Module: `src/module/assets` · Branch: `feat/asset-write-off`

## Intent

The backend no longer disposes an asset directly. `POST /v1/assets/:id/dispose` now always answers `400 "Pelepasan aset harus lewat berita acara…"`, so the current "Lepas aset" dialog is broken in the sandbox. Every disposal now goes through a signed write-off report (berita acara pelepasan aset) that an approver (Chief Finance by default) signs; the journal is posted on approval.

The user wants:

1. The disposal flow replaced by a report flow with the best, most consistent UI in the app, with supporting illustrations and visuals.
2. One central place, inside the assets module but on its own page, for everything in Aset that needs someone's action. Its name is **"Menunggu Anda"** (en: "Waiting on you"), not "Persetujuan".
3. The "Pending" status tab removed from the asset list: a pending asset is found only through "Menunggu Anda".

## Goals

- A maker can file a report for an active asset in one calm page and see exactly the document they are signing while they fill it in.
- An approver opens one report by link, reads it as a document, and approves (signing) or rejects (with a reason) without leaving the page.
- Everyone sees in one place what is waiting on them in Aset: reports to decide, their own reports in flight, new assets to activate, depreciation not yet booked.
- The flow never looks like the asset is disposed before approval.

## Non-goals (this design)

- Asset deletion, asset photo upload, ProApps BAPP sync: separate slices from the same backend handoff.
- Approval step configuration in Settings (`ASSET_WRITE_OFF`): backend default (Chief Finance) is used as is.
- Editing or withdrawing a submitted report: the API has no endpoint for it. A rejected report is final; the maker files a new one.

## Anti-goals (a failure even if it works)

- The asset shows "Dilepas", or totals change, before the report is approved (UI guidelines, Financial Event Integrity).
- Raw technical text on screen: Joi messages such as `"reason" is required`, `proapps responded 404`, file paths, ids.
- A signature, account or amount filled in for the user (No Fabricated Defaults).
- A blinking red badge. The handoff asks for it; the calm interface rules and `prefers-reduced-motion` rule it out. A static count badge carries the same information.

## Constraints

- Stack and rules: React 18, Mantine 8 (`@mantine/dropzone` and `@mantine/dates` already installed), TanStack Query, module layers per `docs/architecture.md`, no new dependency, files ≤ 400 lines, `id` + `en` copy with a parity test (`docs/i18n.md`), money through the existing `formatAssetMoney` and the site precision.
- Layout standards A (hub) and B (form) of `docs/ui-guidelines.md`; navigation rules: a sub-menu item is its own page, icons not dots, one place per task.
- Contract, verified live on the Demo Site on 2026-11-17 (finance2):
  - `POST /v1/asset-reports` multipart: `assetId`, `type` (`sold|scrapped|fully_depreciated|damaged|lost`), `incidentDate` (not future, not before acquisition), `description` (10–5000), `proceedsAmount`, `proceedsAccount` (required when proceeds > 0), `gainLossAccount` (optional), `signature` (image, required), `attachments` (JPG/PNG/PDF ≤ 10 MB, 1–5, not required for `lost`). One pending report per asset.
  - `GET /v1/asset-reports` filters `status`, `type`, `search`, `assetId`, `page`, `limit`; rows carry `canDecide`.
  - `GET /v1/asset-reports/:id`: `number`, `status` (`PENDING_APPROVAL|APPROVED|REJECTED`), `snapshot` (code, name, category, location, brand, model, serial, acquisition date and cost, accumulated depreciation, book value, estimated gain/loss), `result` after approval (`accumulatedDepreciation`, `bookValue`, `gainLoss`), `attachments[]` and `signatures[]` (`title`, `name`, `role`, `signedAt`, `state` `signed|waiting|rejected`, `image.filePath` relative `uploads/...`, `note` = reject reason), `approvalPlan`, `pendingApprovers`, `canDecide`.
  - `POST …/approve` multipart `signature` + optional `note`; `POST …/reject` JSON `reason` (required); `POST …/attachments` (max 5 in total); `GET …/pdf` (`BA-ASET-YYYY-MM-NNNN.pdf`).
  - On approval: catch-up depreciation is posted first, then one journal (`Penghapusan Aset …` or `Penjualan Aset … (BA/ASET/…)`); the asset gets `status: disposed`, `disposalType`, `disposalReport` (an id string).
  - Approval can fail on bad ledger data (asset account is a locked petty-cash account): the report stays `PENDING_APPROVAL`, nothing is written, the message is a clean business sentence.
  - Business messages from the API are clean Indonesian and can be shown; Joi validation messages are not, so the UI validates those fields itself first.
  - Report rows carry `createdBy { id, name, email }`; the current user's id comes from `/v1/users/me`, so "Diajukan oleh Anda" filters on the client.
  - A report has no journal id; the approved report links to the asset's Jurnal tab (`/assets/:id?tab=journals`) instead.
  - `/v1/assets/summary` already returns `ownedCount` and `pending { count, totalAcquisitionCost }` (checked live).
  - `GET /v1/assets/:id` returns `depreciationDue { months, amount, upTo }` and `depreciatedThrough`. Zaki (BE) added the same `depreciationDue` to every `GET /v1/assets` row (`months` and `amount` are 0 for an asset that is not active); live since 2026-11-17 (Demo Site: AC/001 7 months Rp 656.250, GST/002 2 months Rp 22.500.000). The mapper still treats a missing field as "nothing due". The list endpoint rejects unknown query parameters, so no cache-busting parameter is added. `POST /v1/assets/depreciation/run` with optional `assetId` and `upTo` (not the current month) posts and returns a `plan` per asset, `skipped` and `failed`.
  - The asset has no field for a pending report. The asset detail page asks `GET /v1/asset-reports?assetId=:id&status=PENDING_APPROVAL` (one call); the list row menu always says "Lepas aset", and the form page, on load, shows the pending report instead of the form when one exists.

## Approaches considered

1. **Every view is a page** — hub, report form, report detail each on a route. Deep link to one report for the approver; the document gets a full page; the browser back button behaves. More routes and pages. **Picked by the user.**
2. Hub plus modals/drawers — fastest to build, but a long form with a signature pad is cramped in a modal and a report has no link of its own.
3. Form as a page, detail as a drawer — fast decisions, still no deep link and a squeezed document.

## Routes and navigation

| Constant | Path | Page |
|---|---|---|
| `routes.assets.main` | `/assets` | asset list (unchanged path) |
| `routes.assets.needsYou` | `/assets/needs-you` | Menunggu Anda (hub) |
| `routes.assets.writeOffNew` | `/assets/write-offs/new?asset=:id` | report form |
| `routes.assets.writeOffDetail` | `/assets/write-offs/:id` | report document |
| `routes.assets.detail` | `/assets/:id` | asset detail (unchanged) |

Sidebar: "Aset" becomes an item with two children, each with a Phosphor duotone icon: **Daftar Aset** (`Toolbox`) and **Menunggu Anda** (`BellRinging` or `HandWaving`, builder's pick). The form and the report detail are registered as `extraTitles` so the breadcrumb reads Akuntansi / Aset / Berita Acara. "Menunggu Anda" gets a static count badge (builder's call, see below): the number of pending reports where `canDecide` is true, from `GET /v1/asset-reports?status=PENDING_APPROVAL&limit=100`, refreshed every 30 seconds like the pending-changes badge. The `Navbar` badge union grows from `'pendingChanges'` to include `'assetDecisions'`; the import from the module repeats the documented known gap of pending-changes and is listed in the module README.

## Part A — report form (`/assets/write-offs/new`)

Entry points: "Lepas aset" in the asset row menu and the asset detail header (active assets only) navigate here. When the asset already has a pending report, the same button reads "Lihat berita acara" and opens it. The asset detail page shows a calm notice for a pending report ("Berita acara BA/ASET/… menunggu persetujuan") with a link. `AssetDisposalModal`, `disposeAsset` and the `dispose` dialog key are removed.

Layout (Standard B): `ModuleHeader` "Ajukan Berita Acara Pelepasan", subtitle "<code> · <name>", back button. Grid 8/4.

```
┌ Ajukan Berita Acara Pelepasan ───────────────────────────── [← Kembali] ┐
│ AC/001 · AC Split Gree 1 PK                                             │
├──────────────────────────────────────────┬──────────────────────────────┤
│ ① Apa yang terjadi?                      │  ┌ PRATINJAU DOKUMEN ──────┐ │
│ ┌────────┐┌────────┐┌────────┐           │  │ BERITA ACARA KERUSAKAN  │ │
│ │ 🏷 Dijual││ 🗑 Dimus-││ ⚡ Rusak │ …     │  │ ASET                    │ │
│ │ ada uang ││ nahkan   ││ tidak    │       │  │ Nomor: diberikan saat   │ │
│ │ diterima ││          ││ diperbaiki│      │  │ diajukan                │ │
│ └────────┘└────────┘└────────┘           │  │ Aset  AC/001 …          │ │
│ ② Kapan dan bagaimana kejadiannya         │  │ Kronologi  (live text)  │ │
│   Tanggal kejadian [__/__/____]           │  │ ─────────────────────── │ │
│   Kronologi [............] 54/5000        │  │ Nilai buku   3.843.750  │ │
│ ③ Uang yang diterima (sold: wajib)        │  │ Diterima            0   │ │
│   Jumlah [Rp ____]  Akun penerimaan [▾]   │  │ Rugi pelepasan 3.843.750│ │
│   ▸ Pengaturan lanjutan (akun laba/rugi)  │  │ ┌Dibuat oleh┐┌Disetujui┐│ │
│ ④ Bukti pendukung  [ drop files here ]    │  │ │ (ttd)     ││ Chief   ││ │
│   [thumb][thumb][pdf]   2/5               │  │ │ Edi F.    ││ Finance ││ │
│ ⑤ Tanda tangan Anda                      │  │ └───────────┘└─────────┘│ │
│   [ draw pad ............ ] Hapus · Unggah│  └─────────────────────────┘ │
│                                          │  ✓ Jenis dipilih             │
│                                          │  ✓ Kronologi ≥ 10 huruf      │
│                                          │  ○ Bukti (min. 1)            │
│                                          │  ○ Tanda tangan              │
│                                          │  [   Ajukan berita acara   ] │
└──────────────────────────────────────────┴──────────────────────────────┘
```

- **① Type cards** (radio cards, keyboard reachable): Dijual, Dimusnahkan (scrapped), Habis disusutkan, Rusak, Hilang, each with an icon and a one-line plain explanation. "Habis disusutkan" is disabled with its reason when the book value on the chosen date is above the residual value (from `dispose-preview`). The document title in the preview follows the type.
- **② Date and chronology**: date limited to [acquisition date, today]; textarea with a live counter (10–5000), a placeholder that asks for what, where, who found it.
- **③ Money received**: `sold` → amount and receiving account required. Other types (except `fully_depreciated`) → collapsed "Ada uang yang diterima? (misalnya klaim asuransi atau jual rongsokan)"; opening it shows the same two fields. The gain/loss account sits under "Pengaturan lanjutan", empty by default (the API picks its own). Account pickers reuse `AccountSelect` with the existing preferred types.
- **④ Evidence**: `Dropzone`, JPG/PNG/PDF ≤ 10 MB, up to 5, thumbnails for images and a file tile for PDFs, each removable; the section says "tidak wajib" for `lost`.
- **⑤ Signature**: a canvas pad drawn in-house (pointer events, works with mouse, pen and touch, exported to PNG), with Clear, and "Unggah gambar tanda tangan" as an alternative. Keyboard users use the upload path.
- **Right column (sticky)**: a paper-styled live preview of the document, the financial effect from `dispose-preview` (debounced as today: book value, catch-up depreciation, money received, estimated gain or loss in the existing colors), and a readiness checklist. The one primary button lives under the checklist and is disabled until every item is ticked; its tooltip names what is missing.
- **Submit**: success navigates to the report page with a short success state. Failure keeps every value and shows the API's business message in an alert at the top of the form.
- **Leaving with unsaved input** uses the existing leave guard pattern from journal entries.

## Part B — report document (`/assets/write-offs/:id`)

```
┌ BA/ASET/2026/11/0002  [Menunggu persetujuan]           [Unduh PDF] ┐
├──────────────────────────────────────────────┬────────────────────┤
│  ┌───────────── kertas ──────────────────┐   │ Perjalanan dokumen │
│  │ BERITA ACARA PEMUSNAHAN ASET          │   │ ● Diajukan 17 Nov  │
│  │ Nomor BA/ASET/2026/11/0002            │   │ ● Menunggu Chief   │
│  │ Aset, kronologi, bukti (galeri)       │   │   Finance          │
│  │ Nilai: buku, diterima, laba/rugi      │   │ ○ Dibukukan        │
│  │ ┌Dibuat oleh─┐ ┌Disetujui oleh┐       │   ├────────────────────┤
│  │ │  (ttd img) │ │  menunggu…   │       │   │ Keputusan Anda     │
│  │ └────────────┘ └──────────────┘       │   │ [Setujui & tanda-  │
│  │           [ stempel DISETUJUI ]       │   │  tangani]  [Tolak] │
│  └───────────────────────────────────────┘   │ + Tambah bukti     │
└──────────────────────────────────────────────┴────────────────────┘
```

- The sheet reads like the printed document: title by type, number, asset facts from `snapshot`, chronology, evidence gallery (images open in a lightbox, PDFs download), figures (`result` when approved, else `snapshot` estimate, labelled "perkiraan"), signature blocks from `signatures[]` (image, name, role, date; "menunggu" for waiting; the reject note for rejected). An approved report shows a soft "DISETUJUI" stamp; a rejected one a "DITOLAK" stamp with the reason. Old records without a signature image show "Ditandatangani secara elektronik".
- Side column: a timeline (submitted → waiting on role → posted or rejected), then the decision card only when `canDecide`. "Setujui & tandatangani" opens a modal with the same signature pad and an optional note, plus one sentence on what happens next ("Jurnal pelepasan akan dibukukan dan aset berstatus Dilepas"). "Tolak" opens a modal with a required reason (UI checks ≥ 3 chars before sending). "Tambah bukti" while pending and under 5 files. A link back to the asset and, once approved, to its journal.
- Signature and evidence image URLs are built from the API base URL plus `filePath` in the mapper.

## Part C — "Menunggu Anda" hub (`/assets/needs-you`)

Standard A, built after Parts A–B.

```
┌ Menunggu Anda ─────────────────────────────────────────────────────┐
│ Hal-hal di Aset yang perlu tindakan Anda.                           │
├────────────────┬────────────────────┬──────────────────────────────┤
│ 2 berita acara │ 1 aset baru        │ Penyusutan 3 aset, 2 bulan   │
│ perlu keputusan│ perlu diaktifkan   │ Rp 27.500.000 belum dibukukan│
├────────────────┴────────────────────┴──────────────────────────────┤
│ Perlu keputusan Anda       (cards: type icon, number, asset,       │
│                             submitter, date, amount → open)        │
│ Aset baru dari ProApps     (rows → Aktifkan opens the existing     │
│                             activation dialog)                     │
│ Penyusutan belum dibukukan (rows + "Bukukan sampai Oktober 2026")  │
│ Diajukan oleh Anda         (own reports in flight, status chips)   │
│ Riwayat berita acara  →    (filterable table: status, type, search)│
└────────────────────────────────────────────────────────────────────┘
```

- Depreciation group data: `GET /v1/assets?status=active` rows with `depreciationDue.months > 0`; "Bukukan sampai <bulan>" calls `POST /v1/assets/depreciation/run` with `upTo` and shows `skipped` and `failed` (for example a locked period) per asset after the run.
- Each group shows only when it has items; the three tiles jump to their group. Everything empty shows the "Semua beres" illustration.
- The pending tab leaves the asset list in the same release; the list's summary uses `ownedCount`, and the hub tile shows `pending.count` and its acquisition total.
- The Sold/Disposed list gets a "Jenis" column (null `disposalType`: "Dijual" if price > 0, else "Dilepas") and a "BA" link, and "Harga jual" becomes "Hasil pelepasan".

## Visual language

- A new `AssetIllustration` component in the same style as `PeriodIllustration` (inline line SVG, theme classes, `aria-hidden`): `hero` for the form header, one small drawing per report type for the type cards, `approved` and `rejected` stamps, `allDone` for the empty hub, `submitted` for the success state.
- Brand blue and neutrals dominate; orange for loss and warnings, teal for gain and approved, red only for rejected.
- Tabler icons in content, Phosphor duotone in the sidebar, Figtree, existing tokens.

## Decided by the user

- Hub content: reports, pending assets and depreciation due (option B). Pending assets live only in the hub.
- Name "Menunggu Anda"; own page inside the assets module.
- Every view is a page (approach 1).
- Work on `feat/asset-write-off`; commit there when done.
- Depreciation due in the hub comes from the asset list (option a, built by BE).

## Builder's calls (left to the builder)

- File split inside `src/module/assets` (a `writeOff` sub-area in each layer is fine), query keys, the exact Phosphor icon.
- Signature pad internals (line width, smoothing).
- Whether the PDF downloads or opens in a new tab.
- Test depth: domain rules and mapper fully, pages with the existing page-test pattern, an i18n parity test.

- Badge counts decisions only (reports where `canDecide`), the one thing that blocks someone else; pending assets and depreciation are shown in the hub but do not raise the badge.
- Release: Parts A, B and C ship together from this branch, so an approver is never left without the hub. They are still built and committed in the order below.

## Order of work

1. Part A + Part B (they replace the broken dispose flow and need each other).
2. Part C, the pending-tab removal and the disposed-list columns.
