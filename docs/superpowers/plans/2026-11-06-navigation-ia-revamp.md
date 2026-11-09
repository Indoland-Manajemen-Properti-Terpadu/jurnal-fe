# Navigation & Information Architecture Revamp

Status: **implemented on `feat/navigation-ia-revamp` (not committed)**. Phases 1-5 are done; phase 6 (new modules) is shown in the sidebar as `Segera` entries until the service has them.

What was built, and where it differs from the first proposal:

- **One registry** (`src/components/Navbar/navigationRegistry.ts`) feeds the sidebar, the active state, the breadcrumb and the access filter. `settingsMenu.ts` does the same for the settings pages.
- **Every module has a page and no badge**: the sidebar shows no status badges. A module that is not built yet (Biaya, Anggaran, Produksi, Pemenuhan, Gudang, Mutasi Stok, Stok Opname, Jurnal Umum, Penawaran, Pesanan Penjualan, Pembayaran Masuk, Retur Penjualan, Piutang Usaha, and in Settings Kelola Site, Periode Akuntansi, Alur Persetujuan) opens a base page built from the shared `PlannedModulePage` (shared `ModuleHeader`, what it is for, planned scope; copy in `plannedModules`). Screens that show sample figures (Aset Tetap, Tutup Buku) open with a `PrototypeNotice`. The planned scope text is a draft to be adjusted by the product owner.
- **Products live under Inventory**, as in the usual accounting suites: Inventory holds the item master (Produk & Jasa, Kategori Produk, Satuan) next to the stock side (Gudang, Mutasi Stok, Stok Opname). The categories and units tabs became pages. Contacts moved to the top group, next to the overview; there is no Master Data group any more.
- **A sub-menu item is a page, not a tab**: purchasing is split into `/purchases` (overview) and one list page each for requests, orders, receipts, bills, payments and returns, next to the payables report. Old `?tab=` links redirect. Sub-menu items use icons, never dots.
- **One place per task**: Opening Balances and Period Closing are sidebar entries only, so they were removed from the account list menu; the purchasing header no longer repeats the payables report button; the header user menu no longer repeats Settings.
- **Settings is one sidebar entry** with a side menu inside the settings area. Users & Access is three pages: Users (role cards, people table with a tab and count per role, search, access level), Roles & Permissions, Access History.
- **Access-aware**: sidebar and settings menu hide what a person cannot read (server menu ids); unknown rights hide nothing.
- Jurnal Umum is `soon` (no list endpoint; `GET /v1/journal` is 404). Rekonsiliasi Bank has no standalone page (it is per account). "Tambah Transaksi Jurnal" stays in the account list menu until Jurnal Umum exists.
- The rights hook is exported from `src/module/user-management/access.ts`, not `index.ts`, to avoid an import cycle; `useNavigationAccess` is the one shared-component reader and is listed in the app shell lint exemption.

## 1. Evidence (what exists today)

### Current sidebar (`src/components/Navbar/Navbar.tsx`)

| Group       | Items                                                                                       | Problem                                                                                                                                                                           |
| ----------- | ------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Utama       | Ringkasan, Laporan Keuangan, Perencanaan Anggaran                                           | Reports are an output, not a "main" entry. Anggaran is an empty placeholder page.                                                                                                 |
| Transaksi   | Kas & Bank (Akun Kas & Bank, Kas Kecil), Penjualan, Pembelian, Biaya, Persetujuan Perubahan | Biaya is a placeholder. Persetujuan Perubahan is an inbox, not a transaction type. Cash, sales and purchases are different cycles in one list.                                    |
| Operasional | Produk, Produksi, Pemenuhan                                                                 | 2 of 3 are placeholders. Produksi reuses the Penjualan icon (`Storefront`).                                                                                                       |
| Master Data | Daftar Akun, Asset, Kontak                                                                  | "Daftar Akun" is secretly the entire general-ledger hub (journals, saldo awal, rekonsiliasi). Aset is a browser-only prototype (`localStorage`). Label "Asset" is not Indonesian. |
| Pengaturan  | Umum ▸, Akuntansi ▸, Transaksi & Dokumen ▸, Pengguna & Akses, Profil                        | 9 settings pages expanded inline make the sidebar the longest part of the app. Profil belongs in the user menu.                                                                   |

### Structural problems

1. **Three sources of truth for the menu tree**: `Navbar.tsx#getNavGroups`, `HeaderNav.tsx#SECTION_TITLES` (breadcrumbs) and `settingsMenu.ts`. They already disagree: `/setting-budget` shows the breadcrumb title "Penjualan" (`HeaderNav.tsx:51`).
2. **Core accounting pages have no menu entry**: Jurnal Umum (journal list), Saldo Awal, Tutup Buku & Kunci Periode and Rekonsiliasi are reachable only through buttons/modals inside Daftar Akun or the dashboard. Tutup Buku even lives under a settings URL (`/settings/general-journal/closing-books`).
3. **No permission filtering**: every user sees every menu. The server already publishes a menu catalog and per-user rights.
4. **Placeholders shipped as menus**: Biaya, Anggaran, Produksi, Pemenuhan render `BaseModulePage`; Arus Kas, Ringkasan Bisnis, Laba Rugi vs Anggaran and Manajemen Anggaran reports show fixed sample numbers.

### Server menu catalog (`GET /v1/menus`, checked live 2026-11-06 with finance2@proapps.id / Super Admin)

```
JP-GL      General Ledger      crud   └ JP-GL-BB Balance Sheet (r)
JP-SALES   Sales               crud
JP-PRDCT   Products            crud   (incl. categories, units, tax)
JP-CNTCT   Contacts            crud   (incl. contact groups)
JP-PC      Kas Kecil           crud   └ VCH, CNT, RMB, ADV, CST, APR, DSB, APR-BM, APR-CF, CTL
JP-PURCH   Purchase            crud   └ PAY, APR-PR, APR-PO, APR-PAY, RPT (Laporan Pembelian)
JP-SETT    Settings            crud   └ UM (User Mgmt, cru), CT (Role Mgmt, crud),
                                         AS (Approval/pending changes, ru),
                                         AF (Alur Persetujuan, ru), SITE (Manage Sites, cru)
```

Default roles: Super Admin, Admin, Accountant, Banker, Receivable Clerk, Payable Clerk, Expenditure Clerk, Warehousing, Production, Building Manager, Chief Finance.

**Server menus without a screen in the app:** Alur Persetujuan (JP-SETT-AF), Manage Sites (JP-SETT-SITE). Laporan Pembelian (JP-PURCH-RPT) exists only as a tab inside Pembelian, not in the report catalog.

**App menus without any server support (GET returned 404):** assets, expenses/costs, budgets, production, fulfillment, warehouses/stock, receivable aging report, cash bank transfer resources beyond journal posting. The approval-flow endpoint could not be located (Postman connector needs re-login; see §7).

## 2. Target sidebar

Grouped by accounting cycle, ordered by daily frequency: work inbox → revenue → expenditure → treasury → books → reports. Each group ≤ 5 items; items with children expand in place, one level deep only.

```
UTAMA
  Ringkasan                         /dashboard                       (all)
  Kotak Persetujuan  [badge]        /pending-changes                 JP-SETT-AS  (phase 2: unified inbox, §5)

PENJUALAN                                                           JP-SALES
  Faktur Penjualan                  /sales
  Penerimaan Pembayaran             /sales?tab=payments  (or own route)
  Piutang Usaha                     report: receivable aging        (needs server, §6)

PEMBELIAN                                                           JP-PURCH
  Permintaan & Pesanan              /purchases (PR, PO tabs)
  Penerimaan Barang                 /purchases (receipts)
  Tagihan & Pembayaran              /purchases (bills, payments)    JP-PURCH-PAY
  Hutang Usaha                      /purchases/payables              JP-PURCH-RPT

KAS & BANK
  Rekening Kas & Bank               /bank-cash                       JP-GL
  Kas Kecil                         /bank-cash/petty-cash            JP-PC
  Rekonsiliasi Bank                 (entry to existing reconciliation flow)  JP-GL

AKUNTANSI                                                           JP-GL
  Jurnal Umum                       journal list (new route, §4.3)
  Daftar Akun                       /general-journal
  Saldo Awal                        /general-journal/beginning-balance
  Tutup Buku & Kunci Periode        /accounting/period-closing (new URL, old one redirects)
  Aset Tetap                        /assets          (hidden until server exists)

DATA INDUK
  Kontak                            /contact                         JP-CNTCT
  Produk & Jasa                     /products                        JP-PRDCT

LAPORAN
  Laporan Keuangan                  /result-reports                  JP-GL / JP-GL-BB

────────────── (pinned to bottom, like the reference "Others")
  Pengaturan                        /settings → settings area (§3)   JP-SETT*
  [user card ▸ menu: Profil Saya, Ganti Bahasa, Keluar]
```

Hidden behind a "coming soon" flag (not deleted, routes keep working for dev): Biaya, Anggaran, Produksi, Pemenuhan, Aset Tetap. When a module ships, flipping its status to `live` puts it back in the right group with no layout change.

Why this shape:

- Matches the standard cycles every accountant recognises (order-to-cash, procure-to-pay, treasury, record-to-report) and the reference design's top level (Accounting / Purchasing / Sales / Inventory / Reporting).
- Sub-menus mirror the document flow of the cycle, so a non-accountant can follow "request → order → receive → bill → pay" top to bottom.
- Pembelian sub-items open the existing hub on the matching tab; no page is rebuilt. If deep links per tab are not wanted, keep Pembelian as one link (decision D3).

## 3. Settings area ("Admin Panel")

Sidebar shows **one** entry, `Pengaturan`. Inside, the existing `SettingsLayout` gets a left secondary nav (desktop) / select (mobile), driven by `settingsMenu.ts`:

```
Perusahaan          Profil Perusahaan · Preferensi Umum · Site (JP-SETT-SITE, only if allowed)
Akuntansi           Pemetaan Akun · Pajak · Periode Akuntansi
Transaksi & Dokumen Termin Pembayaran · Metode Pembayaran · Format Penomoran · Tag
Pengguna & Akses    Pengguna · Peran & Hak Akses · Alur Persetujuan (JP-SETT-AF) · Riwayat Akses
```

Breadcrumb: `Pengaturan › Pengguna & Akses › Pengguna`, as in the reference "Settings › Admin Panel › Administrators".

## 4. Pengguna & Akses screen (inspired by the reference, fitted to our API)

Route stays `/settings/user-management`. Layout (Standard A):

1. **ModuleHeader**: "Pengguna & Akses", one-line explanation ("Akses ditentukan oleh peran. Setiap peran membuka menu dan fitur tertentu."), one primary action **Tambah Pengguna**.
2. **Peran overview strip**: one card per role in use, sorted by member count (top 3 visible, horizontal scroll or "Lihat semua peran" for the rest; 11 default roles is too many for a fixed grid). Each card: role name, default/custom badge, up to 3 member rows (avatar initials, name, email, Aktif/Nonaktif badge), footer button **Kelola** → role detail with the existing `PermissionMatrix`.
3. **Daftar Pengguna** panel: pill tabs `Semua (n) · <Role> (n) …` with counts, search, sort, table columns _Pengguna (avatar + nama) · Email · Peran · Tingkat Akses · Status · ⋮_. Row menu: Ubah, Atur ulang kata sandi, Nonaktifkan.
4. **Riwayat Akses** moves from a tab to its own settings item (audit log is a different task than managing people).

"Tingkat Akses" is a summary derived in `domain/` from the role's matrix: _Akses Penuh_ (all supported rights on all menus), _Hanya Lihat_ (read only), _Terbatas_ (anything else). Pure function, unit-tested.

API constraints that shape this (from `user-management/README.md` and the live check):

- Users list has no text search and no per-role filter → counts, tabs and search are computed client-side over the full list (sites have few users; load up to 100 and show a note beyond that). A server-side `accessRole` filter + `q` search is a backend request (§6).
- No per-role member count → derived from the users list.

### 4.3 Jurnal Umum list

There is no journal list menu today. `GET /v1/journal/audit-logs` works; the list endpoint shape must be confirmed in Postman before building. Fallback: point "Jurnal Umum" at the existing journal-entry report page until a list page is built.

## 5. Kotak Persetujuan (phase 2)

Approvals are spread over four places: Persetujuan Perubahan, PR/PO/payment approvals inside Pembelian, and petty-cash approvals (APR, APR-BM, APR-CF, DSB). One inbox with source tabs (Perubahan dari ProApps · Pembelian · Kas Kecil), each tab shown only if the person holds that approval right, gives approvers one place to work and one badge count. Starts as a shell that links to the existing approval screens; no approval logic moves.

## 6. Missing modules (recommendation, needs product + server)

| Priority | Module                                           | Why                                                                | Server today                 |
| -------- | ------------------------------------------------ | ------------------------------------------------------------------ | ---------------------------- |
| 1        | Jurnal Umum list                                 | Core book of entry; every accounting system has it                 | partial (confirm)            |
| 1        | Alur Persetujuan screen                          | Server menu exists, no screen                                      | endpoint not found yet       |
| 1        | Piutang Usaha (aging)                            | Purchases has payables aging; sales has none                       | none                         |
| 2        | Biaya (expense)                                  | Common daily entry for non-accountants                             | none                         |
| 2        | Aset Tetap (server-backed)                       | Prototype in browser storage only; depreciation must post journals | none                         |
| 2        | Penawaran & Pesanan Penjualan, Retur/Nota Kredit | Completes order-to-cash like purchases' flow                       | none                         |
| 3        | Anggaran                                         | Budget vs actual reports already exist as samples                  | none                         |
| 3        | Persediaan: Gudang, Mutasi Stok, Stok Opname     | Only if inventory tracking is in product scope                     | none                         |
| 3        | Site management                                  | Server menu exists, restricted accounts only                       | `/v1/site` 403 for this user |

## 7. Implementation phases

Each phase is shippable alone; behavior-preserving except where noted.

**Phase 1 — Single navigation registry** (no visual change)

- New `src/components/Navbar/navigationRegistry.ts`: `{ id, labelKey, icon, route, matchPrefixes, menuId?, status: 'live'|'comingSoon', children? }` grouped by section.
- Navbar, HeaderNav breadcrumbs and settings layout read from it; delete `SECTION_TITLES` duplication; fix the `/setting-budget` title.
- Tests: every path in `routes.ts` resolves to exactly one nav owner (single navigation owner rule); breadcrumb snapshot per route; `activeNavigation` tests stay green.

**Phase 2 — Regroup + hide placeholders** (visual change, needs approval D1/D2)

- Apply §2 groups; Profil and Keluar move to a user-card menu; Pengaturan collapses to one entry.
- `comingSoon` items hidden from the sidebar; their routes remain.
- New URL for Tutup Buku with a redirect from the old one (`legacyPaths`).
- i18n: new group/item keys in `id` and `en`, parity tests; "Asset" → "Aset Tetap".

**Phase 3 — Permission-aware sidebar**

- Read `GET /v1/users/me/permissions` (existing `myPermissionsApi`) once per session via TanStack Query; filter items whose `menuId` has `read: false`. Items without `menuId` always show.
- Route guard shows a friendly "Anda belum punya akses ke halaman ini" page instead of an error. Server stays the judge; this is UX only.
- Legacy superadmin with empty `accessRole` sees everything (matches mappers).

**Phase 4 — Settings area** (§3): secondary nav in `SettingsLayout`, Riwayat Akses as its own page, Periode Akuntansi entry.

**Phase 5 — Pengguna & Akses revamp** (§4): role strip, role tabs with counts, client search, access-level summary.

**Phase 6+ — New modules** (§5, §6), each through the feature-scaffold workflow once the server contract exists.

## 8. Decisions needed

- **D1** Hide placeholder modules (Biaya, Anggaran, Produksi, Pemenuhan, Aset prototype) from the sidebar? Recommended: yes.
- **D2** Collapse Pengaturan into one sidebar entry with its own secondary nav? Recommended: yes.
- **D3** Pembelian/Penjualan as expandable sub-menus pointing to hub tabs, or one link each? Recommended: sub-menus, because approvers and clerks jump straight to one document type.
- **D4** Phase 3 (permission filtering) was marked out of scope in `user-management/README.md`. OK to bring it in?
- **D5** Re-login the Postman connector (or `postman login` for the CLI) so the approval-flow, journal-list and site endpoints can be confirmed before phases 4–6.

## 9. Verification per phase

`npm run lint`, `npm run typecheck`, `npm test`; manual run as Super Admin (finance2@proapps.id) and as a narrower role (e.g. a Payable Clerk test user, to be created only with approval) to confirm hidden/visible menus; collapsed rail and mobile drawer checked; no route returns 404 after the regroup.
