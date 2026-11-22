# Persediaan: halaman Mutasi Stok (PRO-105)

Irisan 2 dari 3 revamp Persediaan. Acuan: prototipe `#gudang/tab/moves`, `#gudang/kartu`, `#gudang/pindah/*`, lampiran `mutasi-stok-spec.md` dan `revisi-persediaan-harga-perolehan.md` (PRO-105), komentar revisi Raga, dan kontrak API live di sandbox. Dikerjakan di cabang `feat/inventory-warehouses` supaya dirilis bersama PRO-103.

## Tujuan

Mengganti placeholder `/inventory/stock-movements` dengan buku besar persediaan yang bisa dibaca: saldo per gudang, riwayat mutasi, kartu stok, dan pindah barang (satu-satunya transaksi yang dibuat dari sini). Angka stok hanya dibaca dari API; tidak ada tombol tambah, ubah, atau hapus mutasi.

## Bukan tujuan

- Stok Opname (irisan 3).
- Perubahan di Pembelian dan Pengaturan dari revisi harga perolehan (teks "Termasuk ongkir" di PO, kotak "PPN tidak dapat dikreditkan", kotak "Ongkir ikut dikembalikan", pilihan kebijakan ongkir dan status PKP). Itu halaman modul lain; hanya rincian harga di Riwayat dan Kartu stok yang dikerjakan di sini. Perlu keputusan terpisah.
- Cetak kartu stok dan serah terima pindah barang (belum ada format cetak yang disepakati).
- "Stok per gudang" di detail Produk (menunggu endpoint BE).

## Layar

Mengikuti Standard A (daftar) dan B (form dan detail).

1. **Mutasi Stok** `/inventory/stock-movements`: `ModuleHeader` (aksi utama: Pindah barang; sekunder: Ekspor), tiga tab pil dalam satu kartu seperti prototipe: **Saldo stok**, **Riwayat mutasi**, **Pindah barang**. Tab dan filter disimpan di query string (`?tab=history&warehouse=<id>`), supaya tautan dari Gudang membuka tampilan yang tepat.
   - **Saldo stok:** empat kartu (Nilai persediaan, Produk dilacak, Di bawah minimum, Habis) dengan ikon dan visual dari data nyata; banner rekonsiliasi (cocok atau selisih Rp x); toolbar Saldo per (tanggal), Gudang, cari produk atau SKU. Semua gudang: matriks produk × gudang dengan Total qty, Harga rata-rata, Nilai, dan baris total nilai. Satu gudang: Produk, Satuan, Qty, Stok min., Status, Harga rata-rata, Nilai; Stok min. dan Status hanya pada tanggal hari ini (datanya dari stok gudang). Klik produk atau angka membuka Kartu stok.
   - **Riwayat mutasi:** filter periode (default bulan berjalan), gudang, produk, jenis; tabel Tanggal, No. dokumen, Jenis, Produk, Gudang, Masuk, Keluar, Harga satuan (tooltip rincian DPP, PPN, ongkir bila ada), Nilai, Jurnal; footer total dari `totals` API (qty hanya bila produk dipilih); paging.
   - **Pindah barang:** daftar PDH (No., Tanggal, Dari, Ke, Produk, Status Selesai atau Dibatalkan).
2. **Kartu stok** `/inventory/stock-movements/card/:productId?warehouse=&from=&to=`: tautan kembali, kartu produk (nama, SKU, satuan, kategori), toolbar gudang dan periode, empat ringkasan (saldo awal, total masuk, total keluar, saldo akhir), tabel dengan baris saldo awal dan saldo akhir.
3. **Pindah barang baru** `/inventory/stock-movements/transfers/new?from=<id>&fill=all`: halaman form (tanggal, gudang asal dan tujuan, baris produk dengan kolom Tersedia, catatan). Produk hanya yang berstok di gudang asal pada tanggal itu.
4. **Detail pindah barang** `/inventory/stock-movements/transfers/:id`: informasi, barang, dan mutasi yang dihasilkan; aksi Batalkan dengan alasan wajib.

Badge hanya untuk status dokumen (Selesai, Dibatalkan). Jenis mutasi ditulis sebagai teks, bukan badge.

## Keputusan yang saya ambil

- **Pindah barang mengikuti API live:** langsung diposting, status `POSTED` atau `VOID`, batal wajib alasan. Prototipe menampilkan "Diajukan oleh" dan "Persetujuan Building Manager"; API tidak punya alur itu. Dikonfirmasi ke Zaki dan Raga.
- **Catatan** dikirim di `memo`. Kolom "Diserahkan kepada" tidak ada di API, jadi tidak ditampilkan.
- **Tab, bukan halaman terpisah, untuk daftar pindah barang** (prototipe dan panduan: tab hanya tampilan dari satu daftar mutasi). Form dan detail adalah halaman sendiri.
- **Filter yang belum ada di API tidak dipalsukan:** kategori dan status stok di Saldo (semua gudang), pencarian nomor dokumen, dan banyak jenis sekaligus. Dicatat sebagai kebutuhan BE.
- **Nilai** hanya tampil bila API mengirimnya, sama dengan Gudang.

## Struktur kode

`src/module/inventory/`: `domain` (saldo, mutasi, kartu, pindah barang), `infrastructure` (stockApi, transferApi), `presentation` (hook, halaman, komponen `components/stock/`, kartu dan visual dari `components/metrics/`). Teks namespace `stockMovements` (id dan en) dengan tes paritas. Rute baru di `routes.ts`, router, dan `navigationRegistry`. README modul diperbarui.

## Integrasi dengan Gudang (PRO-103)

- "Lihat semua di Mutasi Stok" membuka `?tab=history&warehouse=<id>`.
- Produk di tab Stok gudang membuka Kartu stok untuk produk dan gudang itu.
- Tombol "Pindah barang" di detail gudang membuka form dengan gudang asal terisi. Di dialog blokir nonaktif, alasan stok punya tautan "Pindah barang" yang mengisi semua produk dengan qty penuh.
- No. dokumen di tab Mutasi terakhir menuju dokumen asal.

## Risiko

- Rekonsiliasi di Demo Site selisih karena produk lama (sudah dilaporkan di PRO-104).
- Pindah barang ke atau dari gudang yang sedang diopname ditolak server; pesan server ditampilkan.
