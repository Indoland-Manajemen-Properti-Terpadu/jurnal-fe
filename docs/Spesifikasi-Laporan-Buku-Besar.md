# Spesifikasi Laporan Buku Besar

Dokumen ini menjelaskan fitur **Buku Besar** (General Ledger) seperti yang sudah jadi di prototype Dashboard Jurnal, supaya tim BE dan FE bisa membangunnya di aplikasi produksi. Prototype adalah acuan perilaku dan tampilan; angka di prototype dihitung di browser, sedangkan di produksi hitungannya pindah ke BE.

Bahasa antarmuka: **Indonesia**, huruf kapital hanya di awal kalimat, kecuali nama akun.

| Bagian | Pemilik |
|---|---|
| Aturan hitung (§3), API (§4) | BE |
| Halaman, interaksi, ekspor (§5) | FE |
| Kriteria selesai (§6) | BE + FE, diuji QA |

---

## 1. Tujuan

Menjawab pertanyaan: **"Untuk setiap akun, berapa saldonya di awal periode, transaksi apa saja yang terjadi, dan berapa saldonya di akhir?"**

- Disajikan untuk **rentang tanggal**, tanpa pembanding.
- Per akun: saldo awal, setiap baris jurnal di rentang itu dengan **saldo berjalan**, lalu saldo akhir.
- Angkanya dari **jurnal otomatis semua modul** (Penjualan, Pembelian, Gudang, Kas & Bank, jurnal umum).
- Setiap baris bisa dibuka ke jurnal transaksinya, setiap akun ke detail akunnya.
- **Syarat kebenaran:** saldo awal, mutasi, dan saldo akhir tiap akun = angka akun yang sama di **Neraca Saldo** untuk rentang yang sama; total mutasi debit = total mutasi kredit = total di **Jurnal Umum**.

---

## 2. Acuan di prototype

| File | Isi |
|---|---|
| `src/pages/LaporanKeuangan/BukuBesar.jsx` | Halaman: kartu periode, callout, statistik, toolbar, tabel per akun, ekspor |
| `src/pages/LaporanKeuangan/ledger.js` | `buildLedger` (semua jurnal), `generalLedger(ledger, from, to)`, `trialBalance` (sumber saldo awal/akhir), `CATEGORY_ORDER` |
| `src/pages/LaporanKeuangan/ledgerExport.js` | Ekspor PDF / Excel / CSV khusus Buku Besar |
| `src/pages/LaporanKeuangan/PeriodFilter.jsx` | Filter periode bersama (Buku Besar memakai mode tanpa pembanding) |
| `docs/Spesifikasi-Laporan-Neraca.md`, `docs/Spesifikasi-Laporan-Laba-Rugi.md` | Laporan yang angkanya harus cocok |

Rute prototype: `#laporan/buku-besar`.

---

## 3. Aturan hitung (BE)

### 3.1 Sumber data

- Semua baris jurnal terposting. Jurnal draft/batal tidak ikut.
- **Mutasi** = baris jurnal dengan **dari ≤ tanggal ≤ sampai**.
- **Saldo awal** = semua baris jurnal **sebelum** tanggal dari, dengan aturan §3.2.

### 3.2 Saldo awal

- **Akun neraca** (aset, liabilitas, ekuitas): seluruh jurnal sebelum tanggal dari.
- **Akun laba rugi** (Pendapatan, HPP, Beban, Pendapatan/Beban Lainnya): hanya jurnal sejak **1 Januari tahun tanggal dari** sampai sebelum tanggal dari. Laba rugi tahun-tahun sebelumnya belum ditutup, jadi dipindah ke saldo awal **Laba Ditahan (3-10002)**, sama seperti Neraca.
- Karena aturan ini, Laba Ditahan bisa muncul dengan saldo awal walau akunnya sendiri tidak punya jurnal.

### 3.3 Saldo menurut saldo normal

Saldo ditulis menurut **saldo normal** akun (field `normal` di Daftar Akun):

| Saldo normal | Contoh akun | Saldo berjalan |
|---|---|---|
| Debit | Kas & Bank, piutang, persediaan, aset tetap, HPP, beban | saldo sebelumnya + debit − kredit |
| Kredit | Hutang, kewajiban, ekuitas, pendapatan | saldo sebelumnya + kredit − debit |

- Saldo akhir = saldo awal + mutasi menurut aturan di atas = saldo baris jurnal terakhir.
- Saldo negatif berarti berlawanan dengan saldo normalnya (mis. bank bersaldo kredit / cerukan).
- Pembulatan 2 desimal; nilai −0 dinormalkan jadi 0.

### 3.4 Urutan

- Akun dikelompokkan per **kategori**, urut seperti Daftar Akun (Kas & Bank … Beban Lainnya), lalu per kode akun.
- Baris jurnal dalam satu akun urut tanggal, lalu nomor jurnal.
- Satu jurnal yang punya beberapa baris ke akun yang sama tampil sebagai beberapa baris.

### 3.5 Akun yang ikut

- Akun yang punya mutasi di rentang **atau** saldo awal ≠ 0.
- Total mutasi debit dan kredit seluruh akun dikembalikan untuk pemeriksaan keseimbangan.

---

## 4. Usulan API (BE)

Nama dan bentuk boleh disesuaikan dengan konvensi BE; isi datanya yang wajib.

### 4.1 `GET /reports/general-ledger`

| Parameter | Wajib | Isi |
|---|---|---|
| `from` | ya | Tanggal mulai `YYYY-MM-DD` |
| `to` | ya | Tanggal akhir `YYYY-MM-DD` |
| `q` | tidak | Pencarian (lihat §5.4); boleh juga dikerjakan FE |
| `account_codes` | tidak | Batasi ke akun tertentu (untuk halaman besar / paging) |

Respons:

```json
{
  "from": "2026-01-01",
  "to": "2026-11-04",
  "groups": [
    {
      "key": "Kas & Bank", "label": "Kas & Bank",
      "accounts": [
        {
          "code": "1-10004", "name": "BCA A/C", "category": "Kas & Bank", "normal": "debit",
          "opening": 0, "debit": 0, "credit": 0, "closing": 0,
          "rows": [
            {
              "journal_id": "…", "journal_no": 17009, "date": "2026-06-01",
              "module": "Pembelian", "title": "Pembayaran Vendor", "ref": "PV-0003",
              "memo": "Pelunasan FKT/2026/06/0011",
              "debit": 0, "credit": 0, "balance": 0
            }
          ]
        }
      ]
    }
  ],
  "totals": { "debit": 266758600, "credit": 266758600 },
  "journal_count": 64,
  "modules": { "Penjualan": 20, "Pembelian": 30, "Gudang": 14 }
}
```

- `opening`, `closing`, dan `balance` sudah bertanda menurut saldo normal (§3.3). `debit`/`credit` akun = total mutasi di rentang.
- `rows` perlu tautan ke jurnal transaksi (`journal_id`) supaya FE bisa membuka halaman jurnal.

### 4.2 Volume data

Buku Besar bisa ribuan baris untuk satu tahun. Usulan:
- Ringkasan akun (tanpa `rows`) di satu panggilan, lalu `rows` per akun diambil saat bloknya dibuka, **atau** paging per akun (`GET /reports/general-ledger/accounts/{code}?from=&to=&page=`).
- Saldo awal dihitung dengan agregasi di database, bukan menjumlah baris di aplikasi.
- Target respons < 2 detik untuk ringkasan satu tahun.

### 4.3 Ekspor

Ekspor bisa di FE (seperti prototype) atau di BE, terutama bila datanya besar: `GET /reports/general-ledger/export?format=pdf|xlsx|csv&from=&to=&hide_empty=true|false`. Isi file mengikuti §5.6.

---

## 5. Halaman (FE)

Urutan dari atas: tombol kembali → judul dan aksi → kartu periode → callout (jika ada) → kartu statistik → kartu tabel.

### 5.1 Judul dan aksi

- Judul **Buku Besar**, deskripsi "Saldo awal, setiap jurnal dengan saldo berjalan, dan saldo akhir per akun dari jurnal Penjualan, Pembelian, dan Gudang. Klik nama akun untuk detail akun, klik nomor jurnal untuk rincian jurnalnya."
- Kanan: tombol ikon **Cetak** dan menu **Ekspor** (PDF, Excel, CSV).

### 5.2 Kartu periode dan callout

- Kartu periode yang sama dengan laporan lain, **tanpa** isian pembanding: Bulan ini (default), Bulan lalu, Kuartal ini, Tahun ini, Tahun lalu, Tanggal lain.
- Callout **peringatan** bila total mutasi debit ≠ kredit: "Debit dan kredit tidak sama", sebut selisihnya, minta periksa jurnal dokumen di periode itu.

### 5.3 Kartu statistik

| Sel | Angka | Baris bawah |
|---|---|---|
| Akun bertransaksi | "N akun" yang punya mutasi | "dari M akun bersaldo atau bermutasi" |
| Total mutasi debit | Rp… | "N jurnal · <periode>" atau "Belum ada jurnal" |
| Total mutasi kredit | Rp… | <periode> |
| Keseimbangan | "Seimbang" (hijau) atau "Selisih Rp…" (merah) | "Total debit = total kredit" / "Debit dan kredit tidak sama" |

### 5.4 Toolbar

Tidak ikut dicetak.
- Kiri: kotak cari "Cari akun, no. jurnal, atau keterangan…".
  - Bila kode/nama akun cocok → seluruh blok akun tampil.
  - Selain itu → hanya baris jurnal yang nomor, keterangan, atau catatannya cocok; akun tanpa baris cocok disembunyikan.
  - Saldo akhir akun yang disaring tetap saldo akhir sebenarnya, dengan keterangan "(semua jurnal akun ini)".
- Kanan: switch **Sembunyikan akun tanpa transaksi** (default aktif; mati = akun yang hanya punya saldo awal ikut tampil) dan tombol **Ciutkan semua akun / Buka semua akun**.

### 5.5 Tabel

**Kepala laporan** di tengah: nama perusahaan, "Buku Besar", "<dari> s.d. <sampai>".

**Kolom:** Tanggal | No. Jurnal | Keterangan | Debit | Kredit | Saldo.

**Baris per kategori:**
- Judul kategori (huruf kapital kecil, mis. "KAS & BANK").
- Per akun:
  - **Judul akun**: tombol ciutkan (caret), kode, nama akun biru (ke detail akun dengan rentang laporan), keterangan "· saldo normal debit/kredit".
  - **Saldo awal per <sehari sebelum dari>** dengan angka di kolom Saldo.
  - **Baris jurnal**: tanggal, nomor jurnal biru "#17009" (ke halaman jurnal transaksi), keterangan = jenis transaksi + nomor dokumen (mis. "Pembayaran Vendor PV-0003") dengan catatan baris di bawahnya bila ada, debit, kredit, saldo berjalan. Seluruh baris bisa diklik.
  - Bila tidak ada mutasi: "Tidak ada transaksi di periode ini."
  - **Saldo akhir <nama akun>**: total debit, total kredit, saldo akhir. Tetap tampil walau blok diciutkan.
- Baris akhir: **Total mutasi periode** (debit, kredit). Disembunyikan saat mencari.
- Kosong: "Belum ada jurnal di periode ini." atau "Tidak ada akun atau jurnal yang cocok dengan "…"."

**Keterangan jurnal:** judul jurnal tanpa tanggal di belakangnya (sudah ada di kolom Tanggal) dan tanpa mengulang nomor dokumen bila sudah ada di judul.

**Format angka:** tanpa "Rp", pemisah ribuan titik, negatif dalam kurung merah. Debit/kredit nol ditulis "–"; saldo nol ditulis "0,00".

**Catatan kaki:** "Saldo mengikuti saldo normal akun: akun debit (aset, beban) bertambah saat didebit, akun kredit (liabilitas, ekuitas, pendapatan) bertambah saat dikredit. Angka dalam kurung berarti saldonya berlawanan dengan saldo normal. Saldo awal dari jurnal sebelum <dari>; akun pendapatan dan beban mulai 1 Januari."

**Ponsel (< 768px):** tabel bisa digulir horizontal.

### 5.6 Ekspor

Isi file mengikuti switch "Sembunyikan akun tanpa transaksi"; **pencarian dan blok yang diciutkan diabaikan** (semua tampil). Nama file `buku-besar-<dari>_<sampai>.<ext>`.

| Format | Isi |
|---|---|
| PDF | A4 portrait, kop biru tua (nama perusahaan, "Buku Besar", periode), header tabel biru diulang tiap halaman. Per kategori: pita judul kategori. Per akun: pita judul akun, baris saldo awal, baris jurnal, pita saldo akhir. Judul akun tidak ditinggal sendirian di kaki halaman. Saldo negatif merah. "Halaman x dari y" |
| Excel (.xlsx) | Kop 3 baris, header beku, kolom Tanggal, No. Jurnal, Keterangan, Debit, Kredit, Saldo; baris kategori dan judul akun di-merge; angka sebagai angka dengan format `#,##0.00;[Red](#,##0.00);"-"` |
| CSV | Satu baris per baris jurnal dengan Kategori, Kode akun, Nama akun, Tanggal, No. jurnal, Keterangan, Catatan, Debit, Kredit, Saldo di setiap baris (mudah difilter). Ditambah baris "Saldo awal" dan "Saldo akhir" per akun |

Catatan kaki ekspor: "Dihitung dari N jurnal antara <dari> dan <sampai>. Saldo mengikuti saldo normal akun; angka dalam kurung berarti berlawanan dengan saldo normalnya. Diekspor <tanggal hari ini>."

---

## 6. Kriteria selesai

**Hitungan (BE)**
- [ ] Saldo awal, total debit, total kredit, dan saldo akhir tiap akun = Neraca Saldo untuk rentang yang sama.
- [ ] Saldo akhir akun neraca per X = saldo akun itu di Neraca per X (cerukan tampil negatif di sini).
- [ ] Total mutasi debit = total mutasi kredit = total di Jurnal Umum untuk rentang yang sama.
- [ ] Saldo berjalan mengikuti saldo normal; saldo baris terakhir = saldo akhir.
- [ ] Saldo awal akun laba rugi mulai 1 Januari; laba rugi tahun lalu masuk saldo awal Laba Ditahan.
- [ ] Jurnal draft/batal tidak ikut.

**Halaman (FE)**
- [ ] Ganti periode memperbarui tabel, statistik, dan kepala laporan.
- [ ] Cari bekerja seperti §5.4, termasuk keterangan "(semua jurnal akun ini)".
- [ ] Switch akun tanpa transaksi dan ciutkan/buka semua bekerja.
- [ ] Klik nama akun membuka detail akun; klik nomor jurnal atau barisnya membuka jurnal transaksi.
- [ ] Callout selisih hanya muncul bila debit ≠ kredit.
- [ ] Tidak ada "Rp -0,00".
- [ ] Ekspor PDF, Excel, CSV sesuai §5.6 dan angkanya sama dengan layar.
- [ ] Data satu tahun tetap lancar dibuka (paging/lazy load bila perlu).

---

## 7. Catatan data contoh (prototype, 1 Jan s.d. 4 Nov 2026)

| Angka | Nilai |
|---|---|
| Jumlah jurnal | 64 |
| Total mutasi debit = kredit | Rp266.758.600 (sama dengan Jurnal Umum) |
| Saldo akhir BCA A/C (1-10004) | (27.444.400), tampil sebagai Cerukan Bank di Neraca |

Angka ini hanya untuk mencocokkan perilaku dengan prototype; data produksi tentu berbeda.
