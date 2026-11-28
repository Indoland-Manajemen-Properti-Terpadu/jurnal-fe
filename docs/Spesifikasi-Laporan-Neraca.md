# Spesifikasi Laporan Neraca

Dokumen ini menjelaskan fitur **Neraca** (Laporan Posisi Keuangan / Balance Sheet) seperti yang sudah jadi di prototype Dashboard Jurnal, supaya tim BE dan FE bisa membangunnya di aplikasi produksi. Prototype adalah acuan perilaku dan tampilan; angka di prototype dihitung di browser, sedangkan di produksi hitungannya pindah ke BE.

Bahasa antarmuka: **Indonesia**, huruf kapital hanya di awal kalimat (contoh "Aset lancar", bukan "Aset Lancar"), kecuali nama akun dan nama pos baku.

| Bagian | Pemilik |
|---|---|
| Aturan hitung (§3), API (§4) | BE |
| Halaman, interaksi, ekspor (§5) | FE |
| Kriteria selesai (§6) | BE + FE, diuji QA |

---

## 1. Tujuan

Menjawab pertanyaan: **"Per tanggal X, perusahaan punya apa (aset), berutang apa (liabilitas), dan berapa milik pemilik (ekuitas)?"**

- Disajikan **per satu tanggal** (tanggal posisi), bukan rentang seperti Laba Rugi.
- Bisa dibandingkan dengan tanggal lain (kolom pembanding, perubahan, dan %).
- Angkanya dihitung dari **jurnal otomatis semua modul** (Penjualan, Pembelian, Gudang, Kas & Bank, jurnal umum). Tidak ada input manual di laporan ini.
- Setiap angka bisa ditelusuri ke jurnal pembentuknya.
- **Syarat kebenaran:** Total aset = Total liabilitas + ekuitas, untuk tanggal mana pun.

---

## 2. Acuan di prototype

| File | Isi |
|---|---|
| `src/pages/LaporanKeuangan/Neraca.jsx` | Halaman: kartu periode, statistik, rasio, toolbar, tabel, modal rincian, ekspor |
| `src/pages/LaporanKeuangan/ledger.js` | `buildLedger` (semua jurnal), `balanceSheet(ledger, asOf)`, `BS_SECTIONS`, `LABA_DITAHAN`, `OVERDRAFT_CAT`, `profitBreakdown`, `accountMutations` |
| `src/pages/LaporanKeuangan/PeriodFilter.jsx` | Filter periode + pembanding yang dipakai bersama semua laporan |
| `src/pages/LaporanKeuangan/StatementParts.jsx` | `Stat`, `Ratio`, `NumCells`, `MutationTable`, format angka |
| `src/pages/LaporanKeuangan/statementExport.js` | Ekspor PDF / Excel / CSV |
| `docs/Spesifikasi-Laporan-Laba-Rugi.md` | Laporan pasangan; Laba Rugi dan Neraca harus cocok (§3.4) |

Rute prototype: `#laporan/neraca`.

---

## 3. Aturan hitung (BE)

### 3.1 Sumber data

- Semua baris jurnal yang **tanggalnya ≤ tanggal posisi** dan statusnya sudah terposting. Jurnal draft/batal tidak ikut.
- Saldo per akun = Σ debit − Σ kredit dari jurnal tersebut (termasuk saldo awal, yang juga dicatat sebagai jurnal).
- Saldo akun induk = jumlah saldo akun anaknya.

### 3.2 Pemetaan kategori akun ke pos neraca

Neraca disusun vertikal: **Aset → Liabilitas → Ekuitas**. Kategori akun (dari Daftar Akun) menentukan posnya:

| Pos | Kelompok | Kategori akun | Tanda saldo |
|---|---|---|---|
| Aset (Aktiva) | Aset lancar | Kas & Bank, Akun Piutang, Persediaan, Aktiva Lancar Lainnya | debit − kredit |
| | Aset tidak lancar | Aktiva Tetap, Aktiva Lainnya | debit − kredit |
| | Akumulasi penyusutan | Depresiasi & Amortisasi | debit − kredit (hasilnya minus, mengurangi aset) |
| Liabilitas (Kewajiban) | Jangka pendek | Akun Hutang, Kewajiban Lancar Lainnya, **Cerukan Bank** (§3.3) | kredit − debit |
| | Jangka panjang | Kewajiban Jangka Panjang | kredit − debit |
| Ekuitas (Modal) | Ekuitas | Ekuitas + Laba Ditahan + Laba Tahun Berjalan (§3.4) | kredit − debit |

- Akun berkategori laba rugi (Pendapatan, Harga Pokok Penjualan, Beban, Pendapatan Lainnya, Beban Lainnya) **tidak tampil** sebagai baris; hasil bersihnya masuk ke ekuitas (§3.4).
- Akun yang kategorinya tidak dikenali dikembalikan di `unmapped`. Saldonya tetap dihitung ke total aset supaya selisihnya terlihat, dan FE menampilkan peringatan.

### 3.3 Cerukan bank (PSAK 1)

Rekening berkategori **Kas & Bank** yang saldonya **kredit (minus)** per tanggal posisi tidak boleh tampil sebagai aset minus. Rekening itu adalah utang ke bank (cerukan/overdraft), dan PSAK 1 tidak membolehkan aset dan liabilitas saling hapus.

- Rekening tersebut **dipindah** ke Liabilitas jangka pendek dengan kategori tampilan `Cerukan Bank`, nilainya positif (kredit − debit).
- Hanya penyajian; saldo dan kategori akun di Daftar Akun **tidak berubah**.
- Penilaian per tanggal: rekening yang sama bisa jadi aset di tanggal pembanding dan cerukan di tanggal laporan.
- Daftar rekening yang dipindah dikembalikan di `overdrafts` untuk callout di FE.

### 3.4 Laba ditahan dan laba tahun berjalan

Karena belum ada jurnal penutup tahun, laba rugi dihitung langsung dari akun laba rugi:

- **Laba tahun berjalan** = Σ (kredit − debit) akun laba rugi dari **1 Januari tahun tanggal posisi** s.d. tanggal posisi. Tampil sebagai baris turunan (tanpa kode akun).
- **Laba ditahan (3-10002)** = saldo akun 3-10002 + Σ (kredit − debit) akun laba rugi **sebelum 1 Januari** tahun itu (laba tahun-tahun lalu yang belum ditutup).
- Jika nanti produksi punya jurnal penutup tahun, laba tahun lalu sudah ada di saldo 3-10002 dan komponen tambahannya menjadi 0. Hitungan ini tetap benar dan tidak perlu diubah.

**Harus cocok dengan Laba Rugi:** Laba tahun berjalan per tanggal X = Laba bersih setelah pajak di laporan Laba Rugi periode 1 Jan s.d. X.

### 3.5 Total dan pemeriksaan

| Total | Rumus |
|---|---|
| Total aset | aset lancar + aset tidak lancar + akumulasi penyusutan (+ unmapped) |
| Total liabilitas | jangka pendek + jangka panjang |
| Total ekuitas | ekuitas + laba ditahan + laba tahun berjalan |
| Selisih | total aset − (total liabilitas + total ekuitas); harus 0 |

Pembulatan ke 2 desimal; nilai −0 dinormalkan jadi 0.

### 3.6 Rincian akun (drill-down)

- **Akun buku besar:** daftar mutasi akun s.d. tanggal posisi (tanggal, no. jurnal, modul, keterangan, debit, kredit, saldo berjalan), dengan tanda saldo sesuai pos (§3.2). Di prototype, klik akun membuka halaman detail akun `#daftar-akun/<kode>?from=<awal periode>&to=<tanggal posisi>`.
- **Laba tahun berjalan:** rincian laba (rugi) per akun laba rugi dari 1 Jan s.d. tanggal posisi.
- **Laba ditahan:** rincian laba (rugi) per akun sampai 31 Des tahun sebelumnya, ditambah mutasi akun 3-10002.

---

## 4. Usulan API (BE)

Nama dan bentuk boleh disesuaikan dengan konvensi BE; isi datanya yang wajib.

### 4.1 `GET /reports/balance-sheet`

| Parameter | Wajib | Isi |
|---|---|---|
| `as_of` | ya | Tanggal posisi `YYYY-MM-DD` |
| `compare_as_of` | tidak | Tanggal pembanding |

Respons (satu objek per tanggal; bila ada pembanding, kirim `current` dan `compare` dengan bentuk sama):

```json
{
  "as_of": "2026-11-04",
  "sections": [
    {
      "key": "aset", "label": "Aset (Aktiva)", "total": 155300000,
      "groups": [
        {
          "key": "lancar", "label": "Aset Lancar", "total": 120000000,
          "accounts": [
            { "code": "1-10001", "name": "Kas", "category": "Kas & Bank", "balance": 1000000, "derived": false }
          ]
        }
      ]
    }
  ],
  "laba_berjalan": 40060122,
  "laba_lalu": 0,
  "overdrafts": [{ "code": "1-10004", "name": "BCA A/C", "balance": 27444400 }],
  "unmapped": [],
  "totals": {
    "aset": 0, "aset_lancar": 0, "aset_tidak_lancar": 0, "penyusutan": 0,
    "liab": 0, "liab_pendek": 0, "liab_panjang": 0, "ekuitas": 0, "selisih": 0
  },
  "journal_count": 64,
  "modules": { "Penjualan": 20, "Pembelian": 30, "Gudang": 14 }
}
```

- Baris Laba tahun berjalan: `code: null`, `derived: true`.
- Baris Laba ditahan: `code: "3-10002"`, `extra` = komponen laba tahun lalu (untuk FE tahu baris ini perlu rincian laba).
- Rekening cerukan: `category: "Cerukan Bank"`, `overdraft: true`.
- Akun bersaldo nol tetap dikirim (FE yang menyembunyikan).

### 4.2 Rincian

- `GET /accounts/{code}/mutations?to=<as_of>`: mutasi akun dengan saldo berjalan (bisa memakai endpoint detail akun/buku besar yang sudah ada).
- `GET /reports/profit-breakdown?from=&to=`: laba (rugi) per akun laba rugi, untuk rincian Laba tahun berjalan dan Laba ditahan (bisa memakai endpoint Laba Rugi).

### 4.3 Ekspor

Ekspor bisa dibuat di FE dari data §4.1 (seperti prototype) atau di BE. Jika di BE: `GET /reports/balance-sheet/export?format=pdf|xlsx|csv&as_of=&compare_as_of=&mode=rinci|ringkas&hide_zero=true|false`. Isi dan bentuk file mengikuti §5.7.

### 4.4 Kinerja

Laporan dibuka berulang kali dengan tanggal berbeda. Hitungan saldo per akun sebaiknya memakai agregasi di database (bukan mengambil semua baris jurnal ke aplikasi), dan responsnya < 2 detik untuk satu tahun data.

---

## 5. Halaman (FE)

Urutan dari atas: tombol kembali → judul dan aksi → kartu periode → callout (jika ada) → kartu statistik → kartu tabel.

### 5.1 Judul dan aksi

- Ikon timbangan, judul **Neraca**, deskripsi "Laporan posisi keuangan dari jurnal Penjualan, Pembelian, dan Gudang. Klik akun untuk melihat jurnal pembentuknya."
- Kanan: tombol ikon **Cetak** (cetak browser; elemen filter/toolbar disembunyikan saat cetak) dan menu **Ekspor** (PDF, Excel, CSV).

### 5.2 Kartu periode

Komponen yang sama dengan Laba Rugi dan laporan lain.

- **Periode**: pilihan cepat Bulan ini (default), Bulan lalu, Kuartal ini, Tahun ini, Tahun lalu, Tanggal lain (rentang tanggal). Neraca memakai **tanggal akhir** rentang sebagai tanggal posisi.
- **Dibandingkan dengan**: Tanpa pembanding (default), Periode sebelumnya, Periode sama tahun lalu, Tanggal lain. Tanggal pembanding = tanggal akhir rentang pembanding.
- "Dari" setelah "sampai" ditukar untuk hitungan dan isiannya diberi pesan.

### 5.3 Callout

- **Peringatan** bila `unmapped` tidak kosong: "N akun belum masuk pos neraca", sebut kodenya, arahkan ke Daftar Akun.
- **Info** bila `overdrafts` tidak kosong: "N rekening bank bersaldo minus disajikan sebagai cerukan", sebut nama dan nilainya, jelaskan bahwa saldo akunnya tidak berubah dan minta pengguna memeriksa penerimaan atau saldo awal yang belum dicatat.

### 5.4 Kartu statistik

Baris pertama, empat sel dengan bentuk sama (label, angka singkat, perubahan terhadap pembanding, lalu dua rincian label-angka):

| Sel | Angka | Rincian |
|---|---|---|
| Total aset | total aset | Aset lancar; Aset tidak lancar (termasuk akumulasi penyusutan) |
| Total liabilitas | total liabilitas | Jangka pendek; Jangka panjang |
| Total ekuitas | total ekuitas | Modal & laba ditahan; Laba tahun ini |
| Persamaan akuntansi | "Seimbang" (hijau) atau "Selisih Rp…" (merah) | Aset; Liabilitas + ekuitas. Baris bawah: "N jurnal sampai <tanggal>" |

Perubahan hanya tampil bila ada pembanding: "Naik/Turun Rp… sejak <tanggal pembanding>" atau "Tetap sejak …". Angka minus berwarna merah.

Baris kedua, tiga rasio dengan catatan singkat:

| Rasio | Rumus | Catatan |
|---|---|---|
| Rasio lancar | aset lancar ÷ liabilitas jangka pendek, format "1,25×" | "Aset lancar cukup/belum cukup menutup utang jangka pendek"; "–" bila liabilitas jangka pendek ≤ 0 |
| Rasio utang | total liabilitas ÷ total aset, format % | "Bagian aset yang dibiayai liabilitas"; "Liabilitas melebihi total aset" bila > 100% |
| Porsi aset lancar | aset lancar ÷ total aset, format % | "Bagian aset yang bisa cepat dicairkan" |

### 5.5 Kartu tabel

**Toolbar** (tidak ikut dicetak):
- Kiri: kotak cari "Cari nama atau kode akun…" (mencari kode dan nama; saat mencari, tampilan dipaksa Rinci).
- Kanan: switch **Sembunyikan saldo nol** (default aktif; akun disembunyikan bila saldonya nol di kedua tanggal) dan segmented **Rinci / Ringkas**.

**Kepala laporan** di tengah: nama perusahaan, "Neraca", baris periode ("<awal> s.d. <akhir>" + "dibandingkan …" bila ada pembanding).

**Kolom:** Kode | Akun | <tanggal posisi> | bila ada pembanding: <tanggal pembanding> | Perubahan | %.

**Baris:**
- **Pos** (Aset / Liabilitas / Ekuitas): judul tebal selebar tabel.
- **Kelompok** (Aset lancar, Jangka pendek, dst.): latar abu, tombol lipat (caret), jumlah akun, dan subtotalnya. Tidak tampil bila pos hanya punya satu kelompok (Ekuitas). Kelompok yang dilipat menyembunyikan barisnya.
- **Akun** (mode Rinci): kode, nama akun berwarna biru dengan kategori kecil di bawahnya, angka. Untuk Laba tahun berjalan, kategori diganti "Dari pendapatan dan beban" dan kodenya "–".
- **Kategori** (mode Ringkas): bila kelompok punya lebih dari satu kategori, akun dijumlahkan per kategori dengan keterangan "N akun".
- **Total pos**: "Total aset", "Total liabilitas", "Total ekuitas".
- **Grand total** di akhir: "Total liabilitas + ekuitas".
- Kelompok kosong menampilkan "Tidak ada akun tercatat." atau, saat mencari, "Tidak ada akun yang cocok dengan pencarian."

**Format angka:** tanpa "Rp" (mata uang tertulis di kepala), pemisah ribuan titik, minus ditulis dalam kurung dan merah, nol ditulis "–". Perubahan = tanggal laporan − pembanding; % = perubahan ÷ |pembanding|, "–" bila pembanding 0.

**Catatan kaki:** "Dihitung dari N jurnal sampai <tanggal>: <modul> <jumlah> · …. Angka dalam kurung berarti minus, tanda – berarti nol. Rekening Kas & Bank yang saldonya minus disajikan sebagai Cerukan Bank di liabilitas jangka pendek (PSAK 1: aset dan liabilitas tidak saling hapus)."

**Ponsel (< 768px):** tabel bisa digulir horizontal; kolom pertama digabung supaya nama akun tetap terbaca.

### 5.6 Klik akun

- Akun buku besar → halaman detail akun dengan rentang periode laporan (§3.6).
- Laba tahun berjalan dan Laba ditahan (yang punya komponen laba tahun lalu) → **modal** (lebar ±920px): judul nama/kode akun, subjudul "Saldo per <tanggal>: Rp…", penjelasan satu kalimat, tabel Akun | Kategori | Laba (rugi), lalu (untuk Laba ditahan) tabel mutasi akun 3-10002. Tombol "Tutup". Isi modal tetap ada selama animasi tutup.

### 5.7 Ekspor

Isi file mengikuti layar: mode Rinci/Ringkas dan saldo nol ikut, tetapi **filter cari dan kelompok yang dilipat diabaikan** (semua tampil). Nama file `neraca-<tanggal posisi>.<ext>`.

| Format | Isi |
|---|---|
| PDF | A4 portrait, kop biru tua (nama perusahaan, "Neraca", baris periode), tabel dengan header biru, pos/kelompok/total berlatar, grand total, catatan kaki, nomor halaman "Halaman x dari y". Bisa banyak halaman; header tabel diulang |
| Excel (.xlsx) | Kop 3 baris (merge), header beku, angka sebagai angka dengan format `#,##0.00;[Red](#,##0.00);"-"`, kolom Kode, Akun, tanggal (+ pembanding, Perubahan, %) |
| CSV | Baris kop, header, satu baris per baris laporan, angka mentah 2 desimal, catatan kaki |

Catatan kaki ekspor: "Dihitung dari N jurnal sampai <tanggal>. Angka dalam kurung berarti minus." + kalimat cerukan bila ada + "Diekspor <tanggal hari ini>."

---

## 6. Kriteria selesai

**Hitungan (BE)**
- [ ] Total aset = total liabilitas + ekuitas untuk tanggal mana pun (selisih 0).
- [ ] Laba tahun berjalan per tanggal X = Laba bersih setelah pajak di Laba Rugi 1 Jan s.d. X.
- [ ] Laba ditahan = saldo 3-10002 + laba rugi sebelum 1 Jan tahun tanggal posisi.
- [ ] Saldo tiap akun = saldo akhir akun yang sama di Neraca Saldo dan Buku Besar per tanggal yang sama.
- [ ] Total akun Kas & Bank (dikurangi cerukan) = Kas akhir di Laporan Arus Kas.
- [ ] Rekening Kas & Bank bersaldo kredit tampil di Liabilitas jangka pendek sebagai Cerukan Bank, nilainya positif, dan neraca tetap seimbang.
- [ ] Jurnal setelah tanggal posisi, draft, dan batal tidak ikut.
- [ ] Akun berkategori tidak dikenal muncul di `unmapped`.

**Halaman (FE)**
- [ ] Ganti periode/pembanding memperbarui tabel, statistik, rasio, dan kepala laporan.
- [ ] Kolom pembanding, Perubahan, dan % muncul hanya bila ada pembanding.
- [ ] Rinci/Ringkas, saldo nol, cari, dan lipat kelompok bekerja seperti §5.5.
- [ ] Klik akun membuka detail akun; klik Laba tahun berjalan/Laba ditahan membuka modal rincian.
- [ ] Callout cerukan dan akun tak terpetakan muncul hanya bila datanya ada.
- [ ] Tidak ada "Rp -0,00" atau "(0,00)"; nol tampil "–".
- [ ] Ekspor PDF, Excel, CSV sesuai §5.7 dan angkanya sama dengan layar.
- [ ] Tampilan ponsel tidak terpotong; cetak hanya menampilkan laporan.

---

## 7. Catatan data contoh (prototype, per 4 Nov 2026, Tahun ini)

| Angka | Nilai |
|---|---|
| Total aset | ±Rp155,3 jt |
| Total liabilitas | ±Rp192,2 jt, termasuk Cerukan Bank BCA Rp27.444.400 |
| Laba tahun berjalan | Rp40.060.122 (sama dengan Laba Rugi) |
| Persamaan akuntansi | Seimbang |

Angka ini hanya untuk mencocokkan perilaku dengan prototype; data produksi tentu berbeda.
