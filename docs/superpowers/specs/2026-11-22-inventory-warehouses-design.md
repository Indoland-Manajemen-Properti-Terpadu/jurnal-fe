# Persediaan: halaman Gudang (PRO-103)

Irisan 1 dari 3 revamp Persediaan (Gudang, Mutasi Stok, Stok Opname). Acuan: prototipe `#gudang`, tiket PRO-103, kontrak API live di sandbox, dan rangkuman PRO-102 / PRO-106.

## Tujuan

Mengganti placeholder `/inventory/warehouses` dengan halaman Gudang yang tersambung ke API: kelola lokasi penyimpanan dan lihat stok per lokasi. Stok tidak pernah diubah dari sini; qty dan nilai dibaca dari mutasi.

## Bukan tujuan

- Mutasi Stok, Pindah barang, dan Stok Opname (irisan 2 dan 3). Tautan ke sana disiapkan, halamannya belum.
- Pembekuan gudang saat opname. Yang dibaca sekarang hanya `runningOpname` dan `lastOpname` dari API gudang untuk banner dan info.
- Tombol tambah stok atau ubah saldo. Tidak ada.
- Komponen, warna, atau font baru.

## Layar

Mengikuti Standard A (daftar) dan B (detail) di `docs/ui-guidelines.md`.

1. **Daftar** `/inventory/warehouses`: `ModuleHeader` (aksi utama satu: Tambah gudang), ringkasan Gudang aktif / Total item / Nilai persediaan, pencarian dan filter status (Aktif, Nonaktif, Semua) dalam satu `Paper`, tabel Kode, Nama gudang (+ "Utama"), Kota, Penanggung jawab, Jumlah item, Nilai persediaan, Status, menu aksi. Menu: Ubah, Jadikan utama, Nonaktifkan atau Aktifkan, Hapus (hanya bila `canDelete`). Banner opname berjalan di baris yang bersangkutan hanya sebagai teks tautan.
2. **Detail** `/inventory/warehouses/:id`, halaman sendiri: header (nama, kode, kota), kartu Informasi gudang (alamat, kota/kode pos, penanggung jawab, telepon, catatan, dibuat oleh, Opname terakhir, Opname berjalan), tiga angka (jumlah item, nilai, item di bawah minimum), tab **Stok**, **Mutasi terakhir**, **Riwayat perubahan**. Tab di sini adalah isi satu dokumen, bukan sub-menu.
3. **Form tambah dan ubah**: dialog `ModalFrame` dengan bagian Identitas, Lokasi, Kontak, Catatan dan status, seperti prototipe. Kode terisi otomatis dari server dan dikunci bila `codeLocked`.
4. **Dialog**: Nonaktifkan (menampilkan semua alasan penolakan sekaligus dengan tautan solusi), Jadikan utama, Hapus, Atur stok minimum per produk.

Tanpa badge selain: status Aktif/Nonaktif dan "Utama". Item di bawah minimum ditandai dengan teks dan warna angka, bukan badge.

## Tambahan dari gudang-spec.md (lampiran PRO-103)

- Form tambah/ubah: spec menulis drawer samping, prototipe memakai dialog Mantine 720px. Ikut prototipe (aturan tiket); perbedaan ini dikonfirmasi ke Raga.
- Menutup form yang berubah menampilkan "Buang perubahan?". Validasi jalan saat Simpan, fokus pindah ke field pertama yang salah.
- Nonaktifkan yang lolos: dialog konfirmasi, lalu toast "{nama} dinonaktifkan" dengan tombol Batalkan. Aktifkan kembali tanpa konfirmasi.
- Status stok tiga nilai: Aman, Di bawah minimum, Habis. Qty tidak dijumlah antar produk, hanya nilai Rupiah.
- R9: kolom dan kartu nilai persediaan hanya untuk peran yang berhak. Sumber flag di API Gudang belum terbukti (opname memakai `canSeeValues`); dicek sebelum dipakai, tidak diasumsikan.
- Detail: tombol Ubah dan menu Jadikan utama / Nonaktifkan / Hapus. Tombol "Pindah barang" dan "Buat opname" sengaja belum ada (halamannya belum ada; tidak ada tombol palsu) dan menyusul di irisan 2 dan 3. Klik produk di tab Stok menuju Kartu stok juga menyusul di irisan 2.
- Dropdown gudang di FPPBJ, PO, dan Pesanan Penjualan sudah ada dari revamp Pembelian dan Penjualan; hanya diperiksa terhadap aturan: aktif saja, default gudang utama, label "(nonaktif)" untuk dokumen lama.
- Di luar cakupan: rak/bin, akun persediaan per gudang, saldo awal dari Gudang, batch dan nomor seri.

## Aturan yang ditampilkan

- Gudang utama tepat satu; tidak bisa dinonaktifkan atau dihapus.
- Kode dan nama unik per site (409 untuk duplikat, ditampilkan sebagai pesan di kolom).
- Nonaktifkan ditolak (409) dengan daftar alasan: gudang utama, masih ada stok, PO terbuka, opname berjalan. Pesan dibentuk di FE dari data yang dikirim server; tidak ada kata server atau kode error.
- Hapus hanya untuk gudang yang belum pernah dipakai.
- Peran: tombol disembunyikan lewat hak `JP-STOCK` (c r u d). Penegakan tetap di API.

## Struktur kode

`src/module/inventory/`: `domain` (tipe gudang, aturan nonaktif, tampilan stok), `infrastructure` (endpoint, DTO, mapper, adapter HTTP lewat `apiClient`, error), `presentation` (halaman, komponen, hook TanStack Query). Hak diambil dari `GET /v1/users/me/permissions` seperti modul lain. Teks di namespace `warehouses` (id dan en) dengan tes paritas. Rute dan README modul diperbarui; README inventory yang menyebut API 404 diganti.

## Integrasi dalam irisan ini

- Dropdown gudang di modul Pembelian sudah memakai `warehouses/options`; tidak diubah kecuali bentuk datanya berbeda.
- Detail Produk "Stok per gudang": hanya bila API produk atau `stock/balances` memberi datanya tanpa kontrak baru. Bila tidak, dicatat sebagai kebutuhan BE, bukan dipalsukan.

## Pendekatan yang dipertimbangkan

| Pilihan | Catatan |
|---|---|
| A. Dua halaman (daftar, detail), form sebagai dialog | Sesuai prototipe, aturan navigasi, dan pola Produk. **Dipilih.** |
| B. Daftar dengan drawer detail | Detail punya tiga tab dan tabel lebar, kurang cocok di drawer. |
| C. Form sebagai halaman penuh | Form hanya sembilan kolom; halaman penuh berlebihan dan beda dari prototipe. |

## Diserahkan ke pelaksana

- Bentuk body PATCH status, PUT stok minimum, dan 409 nonaktif: dipelajari dari gudang uji di Demo Site ("Uji ...", catatan "Data uji FE"). Tidak ada probe tulis ke gudang yang sudah ada.
- Urutan kolom dan lebar tabel mengikuti pola `PurchaseListPage` dan `ProductsPage`.
- Mutasi terakhir: 20 baris dari `stock/movements?warehouse=<id>`, tautan "Lihat semua" ke Mutasi Stok (aktif setelah irisan 2).

## Risiko dan konfirmasi

- Rekonsiliasi buku besar di Demo Site tidak cocok (akun persediaan kategori terpetakan ke akun bank). Mempengaruhi irisan 2, bukan Gudang.
- `SO/2026/11/0001` sedang berjalan di Gudang Utama; banner dan alasan nonaktif akan tampil di data sandbox.
