# Persediaan: halaman Mutasi Stok (PRO-105) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans (inline, same session). Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Mengganti placeholder `/inventory/stock-movements` dengan Saldo stok, Riwayat mutasi, daftar Pindah barang, Kartu stok, serta form dan detail Pindah barang, tersambung ke API live.

**Architecture:** Memperluas modul `src/module/inventory` (domain, infrastructure, presentation) seperti irisan Gudang. Tab dan filter hidup di query string. Kartu dan visual memakai `components/metrics/`.

**Tech Stack:** React 18, TypeScript strict, Mantine 8, TanStack Query 5, Vitest + Testing Library, `@/i18n` (id/en).

**Spec:** [design](../specs/2026-11-22-inventory-stock-movements-design.md); lampiran `mutasi-stok-spec.md` dan `revisi-persediaan-harga-perolehan.md` (PRO-105); prototipe `#gudang/tab/moves`.

## Global Constraints

- Sama dengan irisan Gudang: identifier Inggris; teks id dan en sentence case; file maksimal 400 baris; tanpa `any` dan `console.log`; HTTP hanya dari `infrastructure`; impor lintas fitur lewat `@/module/<fitur>`; tanpa komponen, warna, atau font baru; tanpa kata server, API, atau kode di teks UI.
- Mutasi tidak bisa ditambah, diubah, atau dihapus dari UI. Qty antar produk tidak dijumlah; total qty hanya bila satu produk dipilih.
- Nilai (harga, nilai, rekonsiliasi) hanya tampil bila API mengirimnya, bukan `Rp 0`.
- Filter yang tidak ada di API (kategori dan status di saldo semua gudang, cari no. dokumen, banyak jenis) tidak dipalsukan di FE.
- Tidak ada push atau PR sebelum diminta. Satu commit untuk PRO-105. Data uji diberi nama "Uji ..." dan tidak dihapus.

## Review Focus

- Saldo pada tanggal sebelum ada mutasi: tabel kosong dengan keterangan, bukan galat.
- Gudang atau produk dari tautan yang tidak lagi ada: pilihan dikosongkan, bukan layar kosong.
- Pindah barang: asal sama dengan tujuan, qty melebihi tersedia, baris produk ganda, dan tanggal masa depan ditolak sebelum kirim; galat server (gudang diopname, periode terkunci, stok tidak cukup) tampil dengan kalimat yang bisa dipahami.
- Mutasi pembalik (Pembatalan) dan baris tanpa jurnal ("Tanpa jurnal") tampil jelas.
- Dokumen asal yang belum punya halaman (opname) tidak menuju tautan mati.

## Task 1: Domain

**Files:** Create `domain/stockBalance.ts`, `stockMovement.ts`, `stockCard.ts`, `stockTransfer.ts` dan tes di sebelahnya.

**Interfaces:**
- `BalanceRow { productId; name; sku; unit; quantities: Record<warehouseId, number>; totalQty; avgCost|null; value|null }`; `BalanceReport { asOf; warehouses: BalanceWarehouse[]; rows; summary: { inventoryValue|null; trackedProducts; belowMinCount; emptyCount }; reconciliation: { matches; stockValue; ledgerValue; accounts[] } | null }`; `reconciliationGap(report): number | null` (selisih mutlak antara nilai stok dan buku besar, null bila tidak ada).
- `StockMovement { id; date; type; typeLabel; isReversal; documentNumber; sourceType; sourceId; productId; productName; sku; unit; warehouse: {id;code;name}; quantityIn; quantityOut; unitCost|null; value|null; journalId|null; costBreakdown: {dpp;freight;vat}|null }`; `MovementTotals { count; inQty; outQty; inValue|null; outValue|null }`; `documentTarget(sourceType, sourceId): { kind: 'purchaseReceipt'|'transfer'|'opname'; id } | null`; `hasCostBreakdown(b): boolean` (benar hanya bila ongkir atau PPN > 0).
- `StockCard` dan `StockCardRow` sesuai respons `/stock/card`.
- `TransferInput { date; fromWarehouse; toWarehouse; memo; lines: {product; quantity}[] }`; `validateTransfer(input, available: (productId)=>number, today: string): TransferIssues`; `availableQty(report, productId, warehouseId): number`; `fillAllLines(report, warehouseId): TransferLine[]`.

- [ ] **Step 1: Tes gagal.** `documentTarget('GoodsReceipt', 'r1')` kind purchaseReceipt; `'StockTransfer'` kind transfer; `'StockOpname'` kind opname; sumber tak dikenal null. `hasCostBreakdown({dpp:3500,freight:0,vat:0})` false, `{..., freight:350}` true. `validateTransfer`: asal sama tujuan (`'sameWarehouse'`), tanpa baris (`'noLines'`), produk ganda (`'duplicateProduct'`), qty 0 (`'quantityRequired'`), qty melebihi tersedia (`'overAvailable'`), tanggal masa depan (`'futureDate'`), asal kosong (`'fromRequired'`). `fillAllLines` hanya produk berqty > 0 di gudang itu. `reconciliationGap` null tanpa rekonsiliasi.
- [ ] **Step 2: Jalankan** `./node_modules/.bin/vitest run src/module/inventory/domain`. FAIL. **Step 3: Implementasi.** **Step 4: PASS.**

## Task 2: Adapter API

**Files:** Create `infrastructure/stockApi.ts`, `transferApi.ts`, dan tes.

**Interfaces:**
- `fetchBalances({asOf?, warehouse?, q?}): Promise<BalanceReport>`; `fetchMovements({startDate?, endDate?, warehouse?, product?, type?, page?, limit?}): Promise<{items; page; totalPages; totalResults; totals}>`; `fetchStockCard({product, warehouse?, startDate?, endDate?}): Promise<StockCard>`; `exportStock(scope: 'balances'|'movements', params): Promise<Blob>`.
- `listTransfers({page?, limit?, status?, warehouse?, startDate?, endDate?})`, `getTransfer(id)`, `createTransfer(input)`, `voidTransfer(id, reason)`; `StockTransfer { id; number; date; from; to; items; memo; status: 'posted'|'void'; voidReason|null; createdByName|null }`.
- Kontrak (terbukti di sandbox): saldo `GET /v1/stock/balances`; riwayat `GET /v1/stock/movements` (filter `startDate`, `endDate`, `warehouse`, `product`, `type`); kartu `GET /v1/stock/card?product=`; ekspor `GET /v1/stock/export?scope=`; pindah barang `POST /v1/stock/transfers` dengan `{transactionDate, fromWarehouse, toWarehouse, items:[{product, quantity}], memo}`; batal `POST /v1/stock/transfers/:id/void` dengan `{reason}`; status `POSTED`/`VOID`.

- [ ] **Step 1: Tes gagal** untuk mapper (nilai hilang jadi null, bukan 0; `journalTransaction` kosong menjadi tanpa jurnal; `costBreakdown` nol semua menjadi null), pembentuk query (hanya nilai yang dipilih), dan body create (tanggal `YYYY-MM-DD`, `memo` kosong tidak dikirim). **Step 2: FAIL. Step 3: Implementasi** mengikuti `warehouseApi.ts` (`call` + `toApiError`). **Step 4: PASS.**

## Task 3: Hook, teks, rute

**Files:** Create `presentation/hooks/useStockQueries.ts`, `useTransferMutations.ts`; extend `inventoryKeys.ts`; create `src/i18n/locales/{id,en}/stockMovements.ts` dan `stockMovements.test.ts`; modify kedua `index.ts`, `routes.ts`, `router/modules/inventory.tsx`, `navigationRegistry.ts` (+ teks `navigation`).

**Interfaces:** `useBalances(params)`, `useMovements(params)`, `useStockCard(params)`, `useTransfers(params)`, `useTransfer(id)`, `useStockRights(): { card: MenuRights; transfer: MenuRights }` (menu `JP-STOCK-CARD`, `JP-STOCK-TRF`), `useTransferMutations(): { create; void }`; rute `inventory.stockCard = '/inventory/stock-movements/card/:productId'`, `inventory.transferNew = '/inventory/stock-movements/transfers/new'`, `inventory.transferDetail = '/inventory/stock-movements/transfers/:id'`.

- [ ] **Step 1:** tes paritas teks dan tes `useStockRights` (semua false sebelum hak terbaca). **Step 2:** FAIL. **Step 3:** implementasi, kunci query diawali subjek pengguna. **Step 4:** PASS, ditambah `routes.test.ts`.

## Task 4: Halaman Mutasi Stok dan tab Saldo stok

**Files:** Replace `pages/StockMovementsPage.tsx`; create `components/stock/StockMovementsTabs.tsx`, `BalancesTab.tsx`, `BalanceMetrics.tsx`, `ReconciliationBanner.tsx`, `BalanceMatrix.tsx`, `useStockSearchParams.ts`.

- [ ] **Step 1: Tes** matriks: kolom qty per gudang aktif, sel kosong tampil "-", baris total nilai, nilai disembunyikan bila API tidak mengirim; banner "Cocok dengan buku besar" vs "Selisih Rp x"; tombol Pindah barang hanya dengan hak buat. **Step 2:** FAIL. **Step 3:** implementasi (kartu memakai `MetricCard` dan visual: sebaran nilai per produk, cincin produk dilacak, status stok). **Step 4:** PASS.

## Task 5: Tab Riwayat mutasi dan Pindah barang

**Files:** Create `components/stock/HistoryTab.tsx`, `MovementsTable.tsx`, `CostTooltip.tsx`, `TransfersTab.tsx`; helper `DocumentCell.tsx` (no. dokumen sebagai tautan hanya bila `documentTarget` punya halaman).

- [ ] **Step 1: Tes** baris pembatalan menulis "Pembatalan"; tanpa jurnal menulis "Tanpa jurnal" dan dengan jurnal menautkan ke detail jurnal; tooltip hanya bila ada ongkir atau PPN; footer memakai `totals`, qty hanya bila produk dipilih; opname tidak menjadi tautan sampai halamannya ada. **Step 2:** FAIL. **Step 3:** implementasi. **Step 4:** PASS.

## Task 6: Kartu stok

**Files:** Create `pages/StockCardPage.tsx`, `components/stock/StockCardTable.tsx`, `StockCardSummary.tsx`.

- [ ] **Step 1: Tes** baris saldo awal dan saldo akhir, kolom Gudang hanya bila "Semua gudang", saldo berjalan dari API, nilai disembunyikan tanpa hak nilai. **Step 2:** FAIL. **Step 3:** implementasi. **Step 4:** PASS.

## Task 7: Pindah barang (form, detail, batal)

**Files:** Create `pages/TransferFormPage.tsx`, `TransferDetailPage.tsx`, `components/stock/TransferLinesEditor.tsx`, `VoidTransferDialog.tsx`.

- [ ] **Step 1: Tes** kolom Tersedia mengikuti gudang asal dan tanggal; mengganti gudang asal saat ada baris meminta konfirmasi; `?fill=all` mengisi semua produk berstok; dialog batal menolak alasan kosong; kirim hanya setelah validasi lolos. **Step 2:** FAIL. **Step 3:** implementasi (`ModalFrame` untuk dialog, Standard B untuk form). **Step 4:** PASS.

## Task 8: Integrasi Gudang, dokumentasi, verifikasi

**Files:** Modify `WarehouseMovesTab.tsx`, `WarehouseStockTab.tsx`, `WarehouseDetailPage.tsx`, `WarehouseActionDialogs.tsx`, `README.md`.

- [ ] **Step 1:** "Lihat semua" ke `?tab=history&warehouse=<id>`, produk ke Kartu stok, tombol Pindah barang di detail (dengan hak buat) dan tautan di dialog blokir. **Step 2:** README modul. **Step 3:** `tsc`, `eslint`, `stylelint`, `prettier --check`, seluruh `vitest`, `vite build`; cek di browser terhadap data Demo Site. **Step 4:** berhenti dan tunjukkan tampilan; commit setelah disetujui.
