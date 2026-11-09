# PRD: Produk & Persediaan (Products & Inventory)

Status: draft untuk review product owner
Tanggal: 2026-11-07
Ruang lingkup: modul `products` (sudah ada) dan modul `inventory` (baru placeholder)

Dokumen ini membedakan tiga hal: **Fakta** (sudah dicek di kode atau di API), **Rekomendasi** (usulan standar), dan **Keputusan yang dibutuhkan** (harus diputuskan product owner / backend sebelum dibangun).

## 1. Latar belakang

Katalog produk dan jasa dipakai oleh Sales dan Purchases. Produk membawa pengaturan default: harga, akun, pajak, satuan, dan apakah stoknya dihitung. Sidebar sudah menampilkan grup Inventory (Products & Services, Product Categories, Units, Warehouses, Stock Movements, Stock Count), tetapi tiga menu terakhir belum punya isi.

## 2. Kondisi saat ini

### Fakta

- Form produk punya tiga section yang bisa dinyalakan sendiri-sendiri: Sales, Purchasing, Inventory. Baru: dijual dan dibeli aktif, stok tidak dilacak.
- Satu produk punya satu satuan. Kategori dan satuan punya halaman sendiri.
- Akun dipilih dari `GET /v1/accounts/simple`. Akun sisi kredit untuk akun penjualan, sisi debit untuk piutang, pembelian, dan persediaan.
- Search, halaman, dan jumlah per halaman di list tersimpan di URL (kembali dari detail tidak menghilangkan filter).
- Harga jual dan harga beli harus lebih dari 0 saat section-nya aktif.
- Modul Inventory hanya placeholder. `GET /v1/warehouses`, `/v1/stock-movements`, dan `/v1/inventory` menjawab 404, jadi backend belum punya resource stok sama sekali.
- Data di server (akun test, 56 produk terbaca): 55 dijual, 3 dibeli, 3 dilacak stoknya. 1 produk dijual dengan harga kosong/0 (dibuat sebelum validasi). 2 pasang nama kembar. Ada 1 produk (`sas`) yang tersimpan dengan dijual, dibeli, dan stok **semuanya mati**.

### Temuan: kemungkinan salah flow bisnis

| # | Temuan | Dampak | Prioritas |
|---|---|---|---|
| 1 | Produk boleh disimpan tanpa dijual dan tanpa dibeli (semua section mati). Produk seperti itu tidak bisa dipilih di transaksi mana pun. | Data sampah di katalog | Tinggi, mudah |
| 2 | Opsi "Tracked (stock item)" aktif, tetapi tidak ada stok sama sekali di sistem. Akun persediaan dan minimum stok tersimpan tetapi tidak berefek: tidak ada qty on hand, tidak ada peringatan stok menipis, tidak ada HPP. | User mengira stok dihitung padahal tidak. Risiko laporan salah | Tinggi |
| 3 | Akun piutang (Receivable) diminta di level produk. Standar akuntansi dan aplikasi sejenis menentukan piutang dari transaksi atau kontak (pengaturan pemetaan akun default), bukan dari produk. Dua produk dengan akun piutang berbeda dalam satu invoice menimbulkan pertanyaan: piutang mana yang dipakai? | Jurnal invoice ambigu | Tinggi, perlu keputusan |
| 4 | Produk dilacak stok dan dijual, tetapi tidak ada akun HPP (harga pokok penjualan). Saat dijual, jurnalnya harus Dr HPP, Cr Persediaan. | Laba kotor tidak benar saat stok aktif | Tinggi (syarat fase stok) |
| 5 | Akun kontra (contoh `1-20100 Akumulasi Penyusutan & Amortisasi`) muncul di pilihan akun penjualan karena sisi normalnya kredit. | Produk bisa terhubung ke akun yang tidak masuk akal | Sedang |
| 6 | Tidak ada pengecekan nama kembar. SKU otomatis tidak mencegah dua produk dengan nama sama. | Katalog berantakan, salah pilih saat transaksi | Sedang |
| 7 | Harga IDR boleh punya sampai 2 desimal dan dikirim apa adanya. Standar rupiah: bilangan bulat. Aturan akuntansi proyek juga memakai satuan minor. | Selisih pembulatan di invoice | Sedang |
| 8 | Produk hanya bisa dihapus. Tidak ada status nonaktif/arsip. Produk yang sudah dipakai transaksi tidak boleh hilang. | Riwayat transaksi kehilangan referensi | Sedang (cek perilaku backend dulu) |
| 9 | Harga 0 sekarang ditolak. Jasa gratis atau sampel gratis tidak bisa dibuat. | Pembatasan yang disengaja, perlu dikonfirmasi | Rendah |
| 10 | Menu Warehouses, Stock Movements, Stock Count tampil di sidebar tanpa penanda "segera hadir" (sesuai catatan UX: modul belum jadi harus diberi badge). | User menekan menu kosong | Rendah |

## 3. Standar yang disarankan

Rekomendasi, berdasarkan praktik umum aplikasi akuntansi (Jurnal.id, Accurate, Odoo, Xero).

1. **Tipe produk eksplisit:** Barang (stok dilacak), Barang non-stok, Jasa. Tipe menentukan section yang tampil. Ini lebih jelas daripada tiga saklar bebas.
2. **Minimal satu peran:** produk harus dijual atau dibeli (atau keduanya).
3. **Akun per peran:** akun penjualan (pendapatan), akun pembelian (beban/HPP), akun persediaan (aset), akun HPP. Piutang dan hutang berasal dari pengaturan default atau kontak.
4. **Stok sebagai buku besar pergerakan:** qty on hand tidak diedit langsung, tetapi hasil jumlah pergerakan (stok awal, pembelian masuk, penjualan keluar, penyesuaian, transfer).
5. **Metode biaya satu saja di awal:** rata-rata bergerak (moving average). FIFO bisa fase berikutnya.
6. **Arsip, bukan hapus,** untuk produk yang pernah dipakai.
7. **Harga rupiah bilangan bulat.**
8. **Unik:** SKU unik. Nama kembar diberi peringatan, bukan diblokir.
9. **Stok negatif:** default diblokir saat penjualan, dengan pengaturan untuk mengizinkan.

## 4. Persyaratan

### Fase 0: perapihan produk (frontend, tanpa backend baru)

- F0-1 Wajib minimal satu peran (dijual atau dibeli). Pesan error jelas. **Selesai 2026-11-07.**
- F0-2 Peringatan nama kembar saat simpan (tidak memblokir).
- F0-3 Sembunyikan akun kontra dari pilihan akun penjualan dan akun pendapatan. *(menunggu persetujuan)*
- F0-4 Harga IDR bilangan bulat (tolak desimal). *(butuh keputusan #3 di bawah)*
- F0-5 Beri penanda "Segera hadir" pada tiga menu Inventory yang masih placeholder.
- F0-6 Opsi Tracked diberi catatan "stok belum dihitung otomatis" sampai fase 1 selesai, atau dinonaktifkan sementara. *(butuh keputusan #2)*

### Fase 1: fondasi persediaan (butuh backend)

- F1-1 Resource gudang: tambah, ubah, nonaktifkan. Satu gudang default.
- F1-2 Pergerakan stok: stok awal, masuk dari Bill pembelian, keluar dari Invoice penjualan, penyesuaian manual. Setiap baris mencatat produk, gudang, qty, biaya satuan, sumber transaksi, tanggal.
- F1-3 Qty on hand per produk per gudang, tampil di list dan detail produk.
- F1-4 HPP: akun HPP di produk, jurnal otomatis saat penjualan barang stok (Dr HPP, Cr Persediaan) dengan moving average.
- F1-5 Stok awal terhubung ke saldo awal (Beginning Balances) supaya nilai persediaan sama dengan buku besar.
- F1-6 Aturan stok negatif dan pengaturannya.

### Fase 2: kontrol stok

- F2-1 Stock Count (stok opname): hitung fisik, selisih jadi penyesuaian otomatis dengan jurnal.
- F2-2 Peringatan stok di bawah minimum (badge di list, kartu di dashboard).
- F2-3 Transfer antar gudang.
- F2-4 Laporan: kartu stok, nilai persediaan, stok menipis.

### Fase 3: kenyamanan

- Impor dan ekspor produk (CSV/Excel), barcode, deskripsi dan foto lebih dari satu, varian, paket (bundle), daftar harga per pelanggan, konversi satuan beli dan jual.

## 5. Keputusan yang dibutuhkan

1. **Akun piutang di produk:** pindahkan ke pengaturan pemetaan akun default (usulan), atau tetap di produk? Perlu konfirmasi apa yang dipakai backend saat membuat jurnal invoice.
2. **Tracked tanpa stok:** nonaktifkan opsi sampai fase 1 siap, atau biarkan dengan catatan?
3. **Harga:** rupiah bulat saja? Apakah ada kasus harga desimal (misalnya per liter) yang sah?
4. **Harga 0:** perlu produk gratis? Jika ya, bolehkan 0 lewat tanda "gratis" yang eksplisit.
5. **Metode biaya:** moving average cukup untuk tahap awal?
6. **Hapus produk yang sudah dipakai:** apa yang dilakukan backend sekarang, dan apakah perlu status arsip?
7. **Gudang:** apakah properti punya lebih dari satu lokasi stok sejak awal, atau satu gudang default cukup?

## 6. Metrik keberhasilan

- 0 produk aktif tanpa peran (dijual/dibeli).
- Nilai persediaan di laporan sama dengan saldo akun persediaan di buku besar (selisih 0).
- Waktu menambah produk di bawah 1 menit untuk barang dan jasa.
- Jumlah produk dengan nama kembar menurun setelah peringatan aktif.

## 7. Risiko

- Fase 1 menyentuh jurnal otomatis (HPP). Kesalahan di sini mengubah laba. Perlu tes akuntansi dan review dari orang keuangan.
- Produk lama yang dilacak stok belum punya stok awal. Perlu langkah migrasi (isi stok awal sekali).
- Backend belum punya resource stok. Jadwal fase 1 bergantung pada tim backend.

## 8. Di luar cakupan

Manufaktur (modul `production`), pengiriman (`fulfillment`), multi-mata-uang, lot dan serial number.
