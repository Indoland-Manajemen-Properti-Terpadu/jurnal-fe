# Persediaan: halaman Stok Opname (PRO-107)

> Irisan 3 dari 3. Dikerjakan inline di cabang `feat/inventory-warehouses`, tanpa commit sampai review akhir. Spec: lampiran `stok-opname-spec.md` (PRO-107), prototipe `#gudang/tab/opname`, kontrak API live di sandbox.

**Tujuan:** mengganti placeholder `/inventory/stock-take` dengan daftar, form buat, detail (hitung, ringkasan selisih, riwayat), dialog persetujuan, dan pengaturan akun selisih, plus pembekuan gudang di halaman lain.

## Kontrak API (terbukti)

| Kebutuhan | Panggilan |
|---|---|
| Daftar | `GET /v1/stock/opnames?warehouse&status&startDate&endDate&q&page&limit` (jawaban memuat `summary {running, pending, diffThisMonth}` dan `canSeeValues`) |
| Detail | `GET /v1/stock/opnames/:id` (baris punya `bookQty`, `diffQty`, `unitCost`, `costEditable`, `allowedReasons`, `isFound`, `needsRecount`) |
| Buat | `POST /v1/stock/opnames` `{warehouse, date, scope:{type:'all'|'category'|'manual', categoryIds, productIds}, counterUser, notes}` |
| Ubah header (draf) | `PUT /v1/stock/opnames/:id` `{date, scope, counterUser, notes}` |
| Isi hitungan | `PUT /v1/stock/opnames/:id` `{lines:[{product, countedQty, reason|null, note, unitCost, needsRecount}]}`; produk di luar daftar menjadi "ditemukan" |
| Alur | `POST /:id/start`, `/submit`, `/approve`, `/reject {reason}`, `/cancel {reason}` |
| Pratinjau jurnal | `GET /:id/journal-preview` → `{entries[{accountNumber, accountName, reasons, count, debit, credit}], missing[]}` |
| Opname berjalan | `GET /v1/stock/opnames/running?warehouseId=` |
| Akun selisih | `GET /v1/settings/opname-accounts`; `PUT` dengan `{accounts: {<alasan>: <accountId>}}` |
| Hak | `JP-STOCK-OPN` (c r u: petugas, hitung buta), `JP-STOCK-OPN-REV` (r u d: Accounting), `JP-STOCK-OPN-APR` (r u: Building Manager) |

## Keputusan

- Hitung buta: server tidak mengirim saldo buku, selisih, harga, atau nilai untuk peran tanpa hak REV atau APR (`canSeeValues=false`). Kolom, kartu, dan ringkasan itu tidak digambar, bukan diisi nol.
- Tombol mengikuti hak API (REV: isi alasan, kirim, batalkan; APR: setujui, tolak), bukan peran buatan di FE.
- Cetak lembar hitung dan berita acara belum dibuat: belum ada format cetak yang disepakati dan BE menandainya belum tersedia. Hapus draf juga tidak ada di API.

## Tugas

1. Domain `opname.ts`: tipe, alasan sesuai arah selisih, kesiapan kirim, langkah, aksi per status dan hak. Tes dulu.
2. Adapter `opnameApi.ts` dan `opnameAccountsApi.ts`, kunci query dan hook. Tes mapper dan body.
3. Teks `stockTake` (id/en), rute `stockTakeNew`, `stockTakeDetail`, `opnameAccounts`, judul navigasi.
4. Daftar opname.
5. Form buat opname.
6. Detail: stepper, banner, tab Hitung (simpan otomatis per baris), Ringkasan selisih, Riwayat, dialog.
7. Pengaturan Akun selisih opname.
8. Pembekuan (O4) di Pindah barang, detail pindah barang, Gudang, dan tautan nomor SO dari Mutasi Stok.
9. README, verifikasi penuh, cek di browser dengan data Demo Site.
