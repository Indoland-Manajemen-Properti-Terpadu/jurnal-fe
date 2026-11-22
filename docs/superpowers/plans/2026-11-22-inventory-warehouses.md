# Persediaan: halaman Gudang (PRO-103) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans (inline, same session). Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Mengganti placeholder `/inventory/warehouses` dengan daftar dan detail Gudang yang tersambung ke API live.

**Architecture:** Modul `src/module/inventory` dengan `domain` (tipe, aturan, validasi), `infrastructure` (DTO, mapper, adapter `apiClient`), `presentation` (hook TanStack Query, halaman, komponen). Pola mengikuti `settings/departments` (daftar, modal form, hook) dan `purchases` (kunci query per pengguna).

**Tech Stack:** React 18, TypeScript strict, Mantine 8, TanStack Query 5, Vitest + Testing Library, i18n `@/i18n` (id/en).

**Spec:** [design](../specs/2026-11-22-inventory-warehouses-design.md); lampiran Jira `gudang-spec.md` (PRO-103); prototipe `https://jurnalproapps.vercel.app/#gudang`.

## Global Constraints

- Identifier dan path bahasa Inggris; teks UI id (utama) dan en, sentence case: "Tambah gudang", bukan "Tambah Gudang".
- File maksimal 400 baris; tanpa `any`, tanpa `console.log`; impor lintas fitur hanya lewat `@/module/<fitur>`; tanpa `../../..`.
- HTTP hanya dari `infrastructure` lewat `@/lib/http/apiClient`; error lewat `toApiError`; tidak ada kata server, API, kode, atau stack di teks UI.
- Tidak ada komponen, warna, atau font baru. Badge hanya untuk status Aktif/Nonaktif dan "Utama".
- Stok tidak bisa diubah dari halaman ini. Qty tidak dijumlah antar produk; hanya nilai Rupiah yang dijumlah.
- Rute baru didaftarkan di `src/router/routes.ts`, `src/router/modules/inventory.tsx`, dan `navigationRegistry.ts` (`extraTitles`) serta README modul.
- Tidak ada commit atau push sebelum Anda menyetujui tampilan (aturan kerja Anda).
- Data uji di Demo Site diberi nama "Uji ..." dan catatan "Data uji FE", tidak dihapus.

## Review Focus

- Nonaktifkan gudang utama atau yang masih punya stok/PO/opname: dialog daftar alasan tanpa tombol Nonaktifkan, semua alasan sekaligus.
- Gudang tanpa penanggung jawab, alamat, atau kota: sel menampilkan "Belum ditunjuk" atau "-", tidak "undefined" atau kosong.
- Hak nilai persediaan tidak ada (peran tanpa hak): kolom dan kartu nilai tidak tampil, bukan Rp 0.
- Stok minimum kosong atau 0: status tidak "Di bawah minimum"; qty 0 berstatus "Habis".
- Pencarian atau filter tanpa hasil: kerangka tabel tetap, `EmptyState` dengan aksi atur ulang.
- Form ditutup saat ada perubahan: konfirmasi "Buang perubahan?"; kode terkunci tidak bisa diubah; nama duplikat (409) tampil di kolom nama.

## File Structure

| File | Tanggung jawab |
|---|---|
| `src/module/inventory/domain/warehouse.ts` | Tipe `Warehouse`, `WarehouseStockItem`, `WarehouseInput`, `BlockReason`; validasi form; `stockStatus`; urutan alasan blokir |
| `src/module/inventory/domain/warehouse.test.ts` | Tes aturan di atas |
| `src/module/inventory/infrastructure/warehouseApi.ts` | DTO, mapper, panggilan `/v1/warehouses*` dan `/v1/stock/movements?warehouse=` |
| `src/module/inventory/infrastructure/warehouseApi.test.ts` | Tes mapper dan query |
| `src/module/inventory/presentation/hooks/inventoryKeys.ts` | Kunci query per pengguna |
| `src/module/inventory/presentation/hooks/useWarehouses.ts` | Query, mutasi, hak akses, pesan error |
| `src/module/inventory/presentation/components/warehouses/*` | Tabel, form, dialog (utama, nonaktif, blokir, hapus, stok minimum), info, tab Stok, Mutasi, Riwayat |
| `src/module/inventory/presentation/pages/WarehousesPage.tsx` | Daftar (ganti placeholder) |
| `src/module/inventory/presentation/pages/WarehouseDetailPage.tsx` | Detail |
| `src/i18n/locales/{id,en}/warehouses.ts` + `warehouses.test.ts` | Teks dan tes paritas |

---

### Task 1: Domain gudang

**Files:** Create `domain/warehouse.ts`, `domain/warehouse.test.ts`.

**Interfaces:**
- Produces: `Warehouse { id; code; name; address; city; postalCode; phone; notes; picUser: {id;name}|null; isDefault; isActive; runningOpname: {id;number}|null; lastOpname: {id;number;date}|null; itemCount; inventoryValue|null; canDelete; codeLocked }`; `WarehouseInput { code; name; address; city; postalCode; picUserId: string|null; phone; notes; isDefault }`; `StockStatus = 'safe'|'belowMin'|'empty'`; `stockStatus(qty: number, minQty: number): StockStatus`; `validateWarehouse(input): Partial<Record<'code'|'name'|'phone', string>>` (nilai = kunci pesan); `WAREHOUSE_LIMITS = { code: 20, name: 100 }`; `WAREHOUSE_MENU = 'JP-STOCK'`.

- [ ] **Step 1: Tes gagal.** `stockStatus(0, 20) === 'empty'`, `stockStatus(5, 20) === 'belowMin'`, `stockStatus(20, 20) === 'safe'`, `stockStatus(3, 0) === 'safe'`; `validateWarehouse` menolak kode kosong (`'codeRequired'`), kode berisi spasi atau lebih dari 20 (`'codeInvalid'`), nama kosong (`'nameRequired'`) dan lebih dari 100 (`'nameTooLong'`), telepon `'abc'` (`'phoneInvalid'`), dan menerima `'+62 21-5150123'`.
- [ ] **Step 2: Jalankan** `npx vitest run src/module/inventory/domain/warehouse.test.ts`. Diharapkan FAIL (modul belum ada).
- [ ] **Step 3: Implementasi** sesuai signature di atas. Kode: huruf, angka, tanda hubung.
- [ ] **Step 4: Jalankan lagi.** Diharapkan PASS.

### Task 2: Adapter API dan kontrak tulis

**Files:** Create `infrastructure/warehouseApi.ts`, `infrastructure/warehouseApi.test.ts`.

**Interfaces:**
- Consumes: `Warehouse`, `WarehouseInput`, `WarehouseStockItem` dari Task 1.
- Produces: `fetchWarehouses(params: { search?; status?: 'active'|'inactive'; page?; limit? }): Promise<{ items: Warehouse[]; page; totalPages; totalResults; summary: { activeCount; totalCount; itemCount; inventoryValue|null } }>`; `fetchWarehouse(id)`; `fetchWarehouseStock(id)`; `fetchWarehouseAudit(id, page)`; `fetchWarehouseMoves(id)` (20 baris); `fetchPicOptions()`; `createWarehouse`, `updateWarehouse`, `setDefaultWarehouse`, `setWarehouseActive(id, isActive)`, `setMinStock(id, productId, minQty)`, `deleteWarehouse`; `toBlockReasons(error: ApiError): BlockReason[]`.

- [ ] **Step 1: Pelajari kontrak tulis di Demo Site.** Buat satu gudang "Uji Gudang FE" (catatan "Data uji FE") dengan `POST /v1/warehouses`; di gudang itu coba `PATCH /:id/status`, `PUT /:id/min-stock`, `PATCH /:id/default` (kembalikan utama ke GDG-001 segera), dan blokir nonaktif pada gudang utama (409, hanya dibaca). Catat body request dan bentuk `reasons` 409 di komentar ringkas `warehouseApi.ts`. Tidak ada probe tulis ke gudang yang sudah ada.
- [ ] **Step 2: Tes gagal.** Mapper: `inventoryValue` hilang menghasilkan `null`; `picUser: null` tetap null; `city: ''` tetap `''`; `toBlockReasons` mengubah bentuk 409 hasil Step 1 menjadi daftar `{ kind: 'default'|'stock'|'orders'|'opname'; ... }` dengan urutan tetap default, stok, PO, opname.
- [ ] **Step 3: Jalankan.** FAIL. **Step 4: Implementasi** mengikuti `departmentApi.ts` (`call` + `toApiError`). Query kosong tidak dikirim; `status` tidak dikirim untuk "Semua". **Step 5: Jalankan.** PASS.

### Task 3: Hook, kunci query, hak akses

**Files:** Create `hooks/inventoryKeys.ts`, `hooks/useWarehouses.ts`.

**Interfaces:**
- Produces: `useWarehouseList(params)`, `useWarehouse(id)`, `useWarehouseStock(id)`, `useWarehouseAudit(id)`, `useWarehouseMoves(id)`, `usePicOptions()`, `useWarehouseMutations()` (create, update, setDefault, setActive, setMinStock, remove; masing-masing invalidasi daftar dan detail), `useWarehouseRights(): MenuRights` (dari `JP-STOCK`), `useWarehouseErrorMessage()`.

- [ ] **Step 1: Tes** `useWarehouseRights` mengembalikan semua `false` sebelum hak terbaca dan mengikuti `create/update/delete` setelahnya (pola `useDepartments.test.tsx`). **Step 2: FAIL. Step 3: Implementasi** dengan kunci diawali subjek token seperti `purchaseKeys`. **Step 4: PASS.**

### Task 4: Teks id/en

**Files:** Create `src/i18n/locales/id/warehouses.ts`, `en/warehouses.ts`, `warehouses.test.ts`; modify kedua `index.ts`.

- [ ] **Step 1: Tes paritas** kunci dan placeholder id sama dengan en (salin `products.test.ts`). **Step 2: FAIL. Step 3:** isi teks dari `gudang-spec.md` bagian 5 (pesan error, judul dan isi dialog, toast) dan istilah prototipe; daftarkan namespace `warehouses`. **Step 4: PASS.**

### Task 5: Halaman daftar

**Files:** Create `WarehouseTable.tsx`, `WarehouseFormModal.tsx`, `WarehouseStatusDialogs.tsx`, `WarehouseDeleteDialog.tsx`, `WarehouseSetDefaultDialog.tsx`; replace `pages/WarehousesPage.tsx`.

- [ ] **Step 1: Tes render** halaman dengan hook di-mock: tombol Tambah gudang hanya ada bila `create`; baris gudang utama menampilkan "Utama" dan tidak punya Nonaktifkan atau Hapus; Hapus hanya bila `canDelete`; hasil kosong menampilkan `EmptyState` di dalam tabel. **Step 2: FAIL.**
- [ ] **Step 3: Implementasi.** `ModuleHeader` (satu CTA), tiga angka ringkasan (Gudang aktif "x dari y", Total item, Nilai persediaan bila hak), satu `Paper` berisi pencarian dan filter status (default Aktif), tabel kolom sesuai prototipe. Form di `ModalFrame` 720px, bagian Identitas, Lokasi, Kontak, Catatan dan status; kode `readOnly` bila `codeLocked`; "Buang perubahan?" saat ditutup dengan perubahan; 409 nama atau kode ke kolomnya. Nonaktifkan lolos memakai `ConfirmModal` lalu notifikasi dengan tombol Batalkan; blokir menampilkan alasan dan tautan (stok: ke Pindah barang, PO: ke Pembelian, opname: ke `routes.inventory.stockTake`, utama: aksi Jadikan utama). **Step 4: PASS.**

### Task 6: Halaman detail

**Files:** Create `WarehouseInfoCard.tsx`, `WarehouseStockTab.tsx`, `WarehouseMovesTab.tsx`, `WarehouseAuditTab.tsx`, `MinStockDialog.tsx`; create `pages/WarehouseDetailPage.tsx`; modify `routes.ts`, `router/modules/inventory.tsx`, `navigationRegistry.ts`, `modules/inventory/index.ts`.

- [ ] **Step 1: Tes** tab Stok: satu baris `empty`, satu `belowMin`, satu `safe`; tanpa hak nilai kolom Nilai tidak ada; tidak ada baris total qty; `MinStockDialog` menolak angka negatif. **Step 2: FAIL.**
- [ ] **Step 3: Implementasi.** Rute `inventory.warehouseDetail = '/inventory/warehouses/:id'`, judul di `extraTitles`. Header (nama, kode, kota, "Utama" bila ya), aksi Ubah dan Pindah barang (placeholder sampai irisan 2), menu aksi; kartu info; tiga angka; tab Stok (cari produk, filter status, aksi Atur stok minimum), Mutasi terakhir (20 baris, tautan Lihat semua), Riwayat perubahan. **Step 4: PASS.**

### Task 7: Dokumentasi dan verifikasi

**Files:** Modify `src/module/inventory/README.md`, `docs/modules/README.md` bila perlu, `docs/migration/STATUS.md` bila memuat inventory.

- [ ] **Step 1:** README modul: rute, endpoint, aturan, namespace, kebutuhan BE (hak nilai untuk gudang bila tidak ada, stok per gudang di Produk bila belum ada). **Step 2:** `npx tsc --noEmit`, `npx eslint src/module/inventory src/router src/i18n`, `npx vitest run src/module/inventory src/i18n src/router`, `npx vite build`. Diharapkan semua lulus; laporkan apa adanya bila ada yang gagal. **Step 3:** Jalankan aplikasi dan cek daftar dan detail di browser terhadap Demo Site (login finance2); laporkan bila tidak sempat dicoba. **Step 4:** Berhenti dan tunjukkan tampilan; commit hanya setelah Anda menyetujuinya.
