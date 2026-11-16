# PRD: Koneksi Bank (mutasi otomatis rekening koran)

Status: draft untuk review product owner dan tim backend
Tanggal: 2026-11-12
Status frontend (2026-11-12): fase 1 dibangun terhadap kontrak usulan di bagian 7 (lihat `src/module/bank-connection/README.md`); backend belum menyediakan resource ini.
Ruang lingkup: modul baru `bank-connection` (frontend), terhubung ke `bank-statements`, `reconciliation`, `bank-cash`, dan `chart-of-accounts`

Dokumen ini membedakan tiga hal: **Fakta** (sudah dicek di kode atau di API), **Rekomendasi** (usulan standar dan praktik umum), dan **Keputusan yang dibutuhkan** (harus diputuskan product owner, bisnis, legal, atau backend sebelum dibangun). Tidak ada klaim tentang kemampuan bank atau penyedia tertentu yang belum diverifikasi: semuanya ada di bagian Keputusan dan Lampiran B sebagai pertanyaan.

Draft tampilan (tanpa backend) ada di artifact "Koneksi Bank" dan prinsipnya dijelaskan di bagian 8.

## 1. Latar belakang dan tujuan

Pengguna kas dan bank saat ini mencatat mutasi bank dengan dua cara: mengetik transaksi sendiri, atau mengimpor file rekening koran (csv, xls, xlsx, maksimal 30 MB) lewat modal tiga langkah dan halaman draf. Setelah itu mereka mencocokkannya satu per satu dengan jurnal di tab Rekonsiliasi.

Masalahnya:

- Impor manual tertinggal dari bank. Saldo di Jurnal dan saldo di bank baru dibandingkan saat orang sempat mengunduh file.
- File bisa terimpor dua kali. Server tidak memeriksa duplikat; layar draf yang memperingatkan.
- Setiap bulan tim keuangan mengulang pekerjaan yang sama: unduh, rapikan kolom, impor, cocokkan.

**Tujuan:** mutasi rekening bank masuk otomatis ke Rekening Koran akun kas/bank yang terhubung, lalu dicocokkan lewat alur rekonsiliasi yang sudah ada. Pengguna melihat dua angka berdampingan, **saldo rekening koran** (dari bank) dan **saldo di Jurnal** (buku besar), dan selisihnya dijelaskan oleh mutasi yang belum cocok.

**Bukan tujuan fase pertama:** membuat jurnal otomatis dari mutasi, dan mengirim pembayaran dari Jurnal ke bank (lihat bagian 4 dan 13).

## 2. Kondisi saat ini

### Fakta

- Backend belum punya resource koneksi bank. Dicek 2026-11-12 di Demo Site: `GET /v1/bank-connections`, `/v1/bank-feeds`, `/v1/banks`, `/v1/bank-links`, dan `/v1/open-banking` semuanya menjawab 404.
- Rekening koran hanya masuk lewat impor file: `POST /v1/bank-statements/import` (multipart, server mem-parse dan menjawab baris pratinjau), lalu `POST /v1/bank-statements/import/confirm`. Daftar: `GET /v1/bank-statements?accountId=`. Hapus: `DELETE /v1/bank-statements/:id`, ditolak (400) bila barisnya sudah direkonsiliasi.
- Rekonsiliasi: `GET /v1/reconciliation/:idAccount` mengembalikan hanya baris rekening koran yang belum cocok, lengkap dengan `recommendations` (skor kemiripan dan selisih hari), ditambah `unreconciledJournalDetails` dan `balance`. Pencocokan: `POST /v1/reconciliation/match-multiple`. `balance` itu net baris yang belum cocok, **bukan** saldo bank.
- Aturan tanda yang dipakai layar: jumlah bank positif = uang masuk (sisi debit akun kas), negatif = uang keluar (sisi kredit).
- Daftar Kas & Bank belum bisa menampilkan "saldo rekening koran" karena tidak ada sumbernya.
- Akun kas/bank bisa berupa akun induk (header, tidak bisa diposting) dengan anak di `subAccount`. Koneksi hanya boleh menempel ke akun yang bisa diposting.
- Akun dana petty cash tidak boleh dipakai di jurnal biasa (server menolak `POST /v1/journal` dengan 400). Akun itu juga tidak boleh dihubungkan ke bank (lihat aturan 5.1).

## 3. Konsep dan istilah

| Istilah | Arti |
|---|---|
| **Koneksi** (`BankConnection`) | Ikatan satu akun kas/bank di Jurnal dengan satu rekening bank, lewat satu penyedia. Satu koneksi, satu rekening. |
| **Penyedia** (`Provider`) | Pihak yang menyalurkan data: bank langsung atau pihak ketiga berlisensi. Pengguna memilih **bank**; penyedia adalah detail teknis di baliknya. |
| **Persetujuan** (`Consent`) | Izin tertulis pemilik rekening agar Jurnal membaca mutasinya, dengan masa berlaku. |
| **Mutasi** (`BankTransaction`) | Satu baris transaksi di rekening bank. Disimpan sebagai baris Rekening Koran dengan `source = FEED`. |
| **Sinkronisasi** (`SyncRun`) | Satu kali penarikan mutasi (terjadwal, dipicu webhook, atau manual). |
| **Saldo rekening koran** | Saldo penutup yang dilaporkan bank pada waktu tertentu. Tidak pernah dihitung ulang oleh frontend. |

## 4. Standar yang disarankan

Rekomendasi, berdasarkan praktik umum integrasi perbankan di Indonesia. Setiap butir yang menyangkut kemampuan bank tertentu masih perlu diverifikasi (bagian 12).

1. **Mutasi bukan jurnal.** Mutasi bank adalah bukti pihak ketiga yang independen dari buku. Ia masuk ke Rekening Koran dan dipasangkan ke jurnal lewat rekonsiliasi, tidak otomatis menjadi jurnal. Ini menjaga pemisahan tugas dan membuat selisih antara bank dan buku terlihat, bukan tertutup diam-diam.
2. **Satu koneksi, satu akun, satu rekening.** Akun Jurnal tidak boleh punya dua koneksi aktif, dan satu rekening bank tidak boleh aktif di dua akun dalam satu perusahaan.
3. **Abstraksi penyedia.** Backend menyembunyikan jalur teknis di balik satu kontrak (daftar penyedia, kemampuan, persyaratan data). Tiga jalur yang lazim:
   - **A. API resmi bank** (misalnya standar Open API Bank Indonesia, SNAP, atau API korporasi bank). Data langsung dari sumber, tetapi tiap bank punya syarat dan proses onboarding sendiri.
   - **B. Agregator pihak ketiga berlisensi.** Satu integrasi untuk banyak bank, tetapi menambah pihak yang memegang data dan biaya per koneksi.
   - **C. Impor file terjadwal** (SFTP, email, atau format seperti MT940/CSV). Cadangan untuk bank tanpa API.
4. **Idempoten.** Mutasi yang sama tidak boleh masuk dua kali, apa pun jalurnya (aturan 6.3).
5. **Rahasia tidak keluar dari backend.** Kredensial, token, dan dokumen identitas tidak pernah dikirim ke frontend.
6. **Mulai kecil, baca-saja.** Fase pertama hanya membaca mutasi dan saldo. Pembayaran dari Jurnal ke bank adalah produk terpisah dengan kontrol risiko sendiri.

## 5. Alur bisnis

### 5.1 Pengajuan koneksi (onboarding)

Pelaku: **Admin perusahaan** (mengisi), **Penanggung jawab/penandatangan** (menyetujui dan menandatangani), **Bank atau penyedia** (meninjau dan mengaktifkan), **Admin operasional Jurnal** (memantau).

Prasyarat: akun kas/bank dapat diposting, bukan header, tidak diarsipkan, bukan akun dana petty cash, dan belum punya koneksi aktif. Hak akses menu koneksi bank (lihat 7.6).

Empat langkah yang dilihat pengguna, dengan status di server:

| Langkah di layar | Status server | Yang terjadi |
|---|---|---|
| 1. Isi formulir | `DRAFT` | Admin memilih bank, akun Jurnal, tipe rekening, mengisi data rekening dan penanggung jawab. Bisa disimpan sebagai draf dan dilanjutkan. |
| 2. Ditinjau | `SUBMITTED` lalu `IN_REVIEW`, atau `NEEDS_REVISION` / `REJECTED` | Validasi otomatis (format, kecocokan nama pemilik rekening bila bank menyediakannya), lalu tinjauan manusia di sisi Jurnal dan/atau bank. Bila ada yang salah, status kembali ke pengguna dengan alasan yang bisa dibaca. |
| 3. Tanda tangan dan kirim | `AWAITING_SIGNATURE` lalu `SIGNED` | Dokumen persetujuan dibuat dari data formulir. Penanggung jawab menandatangani (cara tanda tangan: keputusan 12.4). Setelah itu dikirim ke bank. |
| 4. Aktif | `ACTIVE` | Bank mengonfirmasi. Sinkronisasi pertama berjalan dan menarik riwayat mutasi (kedalaman: keputusan 12.5). |

Status lain: `SUSPENDED` (dihentikan sementara, misalnya tagihan gagal atau permintaan bank), `ERROR` (sinkronisasi gagal berulang, perlu tindakan), `EXPIRED` (persetujuan habis), `REVOKED` (diputus pengguna atau bank), `CANCELLED` (draf dibatalkan sebelum dikirim).

Aturan:

- **Dokumen** (wajib sebelum dikirim): KTP/KITAS penanggung jawab (untuk rekening perusahaan, milik direktur utama) dan buku tabungan atau halaman pertama rekening koran yang memuat nama dan nomor rekening. PDF, PNG, atau JPG, maksimal 15 MB per berkas. Diunggah ke koneksi yang sudah berstatus `DRAFT` sebelum `submit`. Dokumen yang sudah dipegang backend tidak diminta lagi saat pengajuan dikembalikan (`NEEDS_REVISION`).
- Data formulir yang dikirim ke bank tidak boleh diubah setelah `SUBMITTED`; perubahan berarti ajukan ulang (`NEEDS_REVISION` mengembalikan ke `DRAFT`).
- Biaya bulanan (bila ada) ditampilkan dengan jelas sebelum langkah tanda tangan dan disetujui pengguna. Angka biaya datang dari penyedia (`monthlyFee`), tidak ditulis keras di layar.
- Setiap perubahan status dicatat sebagai peristiwa (siapa, kapan, dari-ke, alasan).

### 5.2 Sinkronisasi mutasi

Pemicu: terjadwal, webhook dari penyedia (bila ada), atau tombol "Sinkronkan sekarang". Satu `SyncRun` per eksekusi, dengan hasil: jumlah mutasi baru, jumlah duplikat diabaikan, saldo penutup bank, rentang tanggal, dan galat bila ada.

- **Zona waktu dan tanggal:** tanggal mutasi disimpan sebagai tanggal kalender WIB (`YYYY-MM-DD`) sesuai tanggal bank, ditambah `postedAt` (waktu UTC) bila bank menyediakannya. Frontend tidak mengonversi zona waktu.
- **Mata uang:** hanya IDR di fase ini. Mutasi bermata uang lain ditandai dan tidak diimpor sampai ada keputusan multi-mata-uang.
- **Pending dan posted:** bila bank membedakan, mutasi `PENDING` disimpan tetapi tidak ikut saldo yang dicocokkan; saat `POSTED` baris yang sama diperbarui, bukan dibuat baru.
- **Pembalikan (reversal):** dicatat sebagai mutasi baru dengan tanda berlawanan dan rujukan ke mutasi asal. Mutasi yang sudah direkonsiliasi tidak diubah diam-diam.
- **Retry:** kegagalan sementara dicoba ulang dengan jeda bertambah; setelah batas tertentu koneksi menjadi `ERROR` dan admin diberi tahu.

### 5.3 Pembukuan: mutasi menjadi bukti, bukan jurnal

1. Mutasi masuk sebagai baris Rekening Koran (`source = FEED`), terbaru di atas, dengan tanda yang sama seperti sekarang (positif = masuk).
2. Mesin rekomendasi yang sudah ada mengusulkan pasangan jurnal (skor kemiripan, selisih hari). Pengguna mencocokkan di tab Rekonsiliasi.
3. Mutasi tanpa pasangan (biaya admin bank, bunga, pajak bunga, setoran yang belum dicatat) diselesaikan lewat tombol "Catat transaksi" yang membuka form Terima atau Kirim Uang dengan nominal, tanggal, dan keterangan sudah terisi dari mutasi. Pengguna memilih akun lawan. Jurnal baru lahir hanya setelah pengguna menyimpan.
4. Fase 2: aturan otomatis (misalnya "keterangan berisi BIAYA ADM selalu ke akun Beban Administrasi Bank") membuat usulan jurnal untuk disetujui, tidak langsung memposting.

### 5.4 Saldo rekening koran dan saldo di Jurnal

- Setiap sinkronisasi berhasil menyimpan `statementBalance` dan `statementBalanceAsOf` dari bank.
- Layar menampilkan: **saldo rekening koran**, **saldo di Jurnal**, **selisih**, dan jumlah mutasi belum cocok. Selisih bukan kesalahan; ia dijelaskan oleh item rekonsiliasi (cek yang belum cair, mutasi belum dicatat, transaksi dicatat tetapi belum di bank).
- Frontend tidak menghitung saldo bank dari mutasi. Angka dari server ditampilkan apa adanya, dengan waktu "per tanggal/jam".

### 5.5 Pemutusan, kedaluwarsa, dan perubahan akun

- **Putus koneksi** oleh pengguna: status `REVOKED`, sinkronisasi berhenti, mutasi yang sudah masuk **tetap** (bukti pembukuan tidak dihapus). Akun bisa dihubungkan lagi lewat pengajuan baru.
- **Persetujuan habis:** peringatan H-30 dan H-7 ke admin dan penanggung jawab; setelah habis status `EXPIRED` dan sinkronisasi berhenti. Perpanjangan memakai alur tanda tangan yang sama.
- **Akun Jurnal diarsipkan atau dikunci** saat terhubung: pengarsipan ditolak sampai koneksi diputus.
- **Periode ditutup:** mutasi untuk tanggal di periode yang sudah ditutup tetap masuk Rekening Koran (itu bukti), tetapi pencatatan jurnal dari mutasi itu mengikuti aturan penguncian periode yang ada.
- **Perubahan nomor rekening atau pemilik:** koneksi baru, bukan ubah koneksi lama.

### 5.6 Penagihan

Bila fitur berbiaya, aturannya berbeda per bank dan per tipe rekening, dan harus datang dari backend, bukan ditulis di layar. Contoh yang lazim untuk rekening korporasi sebuah bank: biaya bulanan tetap yang ditagih **lewat auto-debit oleh bank**, kuota penyegaran mutasi per bulan (misalnya 500 kali), tarif tambahan per penyegaran di atas kuota (misalnya Rp 100), dan sebagian kuota dipakai penyegaran otomatis oleh Jurnal (misalnya 180 kali per bulan). Angka-angka itu hanya contoh sampai keputusan harga (12.3).

- Tagihan dimulai saat `ACTIVE`, berhenti saat `REVOKED`/`CANCELLED`. Kegagalan bayar membuat `SUSPENDED` setelah masa tenggang, bukan menghapus data.
- Penyegaran manual ("Sinkronkan sekarang") menambah pemakaian kuota; penyegaran otomatis Jurnal juga. Backend menghitung dan mengirim pemakaian bulan berjalan (`refreshUsage`); frontend hanya menampilkannya, dan memperingatkan pengguna sebelum dan sesudah melewati kuota.
- Penolakan sinkronisasi karena batas laju (`SYNC_RATE_LIMITED`) berbeda dari kuota: kuota habis tetap boleh sinkron, hanya dikenai tarif tambahan.

## 6. Persyaratan

### Fase 0: draft UI/UX (selesai, tanpa backend)

- F0-1 Draft tampilan dan ilustrasi untuk halaman pilih bank, formulir empat langkah, status koneksi, dan kondisi galat. Lihat artifact dan bagian 8.

### Fase 1: MVP baca-saja (butuh backend)

- F1-1 Daftar penyedia/bank yang didukung beserta persyaratan datanya (7.1).
- F1-2 Pengajuan koneksi: draf, kirim, unggah/tanda tangan dokumen, status, alasan perbaikan (7.2).
- F1-3 Sinkronisasi terjadwal harian dan "Sinkronkan sekarang", riwayat sinkronisasi (7.3).
- F1-4 Mutasi masuk ke `bank-statements` dengan `source = FEED`, idempoten (6.3).
- F1-5 `statementBalance` dan `statementBalanceAsOf` per akun (7.5), supaya kolom "Saldo rekening koran" di daftar Kas & Bank bisa tampil.
- F1-6 Putus koneksi, kedaluwarsa persetujuan, peringatan (5.5).
- F1-7 Audit log, hak akses menu, enkripsi data sensitif (7.6, 9).

### Fase 2: otomasi dan kenyamanan

- F2-1 Webhook penyedia untuk mutasi hampir real-time.
- F2-2 Aturan otomatis yang menghasilkan usulan jurnal (5.3 butir 4).
- F2-3 Beberapa koneksi per bank per perusahaan dengan tampilan gabungan.
- F2-4 Notifikasi (email dan lonceng) untuk galat, persetujuan akan habis, dan mutasi belum cocok menumpuk.

### Fase 3: pembayaran (PRD terpisah)

- Inisiasi pembayaran dari Jurnal ke bank untuk bill atau pembelian. Butuh persetujuan berjenjang (maker-checker), batas nominal, daftar penerima, OTP/otorisasi bank, dan kebijakan risiko. Tidak dirancang di dokumen ini.

### 6.3 Aturan idempotensi dan duplikat

- Kunci utama: `(connectionId, bankReference)` bila bank memberi referensi unik.
- Cadangan bila tidak ada: hash dari `(accountNumber, valueDate, amount, normalizedDescription, runningBalance)`; dua mutasi sah yang kembar persis di hari yang sama (misalnya dua biaya sama) dibedakan oleh `runningBalance` atau urutan di file/respons.
- Impor manual yang sudah ada tetap jalan. Bila akun terhubung dan mutasi file yang sama sudah masuk lewat koneksi, server menandai sebagai duplikat (aturan di atas) dan memberi tahu, bukan menggandakan.
- Dedupe terjadi di server. Layar draf impor yang memperingatkan tidak lagi satu-satunya penjaga.

## 7. Kebutuhan backend

Semua usulan, belum ada yang diimplementasikan. Nama dan bentuk boleh disesuaikan dengan konvensi backend; yang penting adalah isi dan perilakunya.

### 7.1 Daftar penyedia

`GET /v1/bank-providers`

```json
{
  "results": [
    {
      "id": "bank-xyz-corporate",
      "bankName": "Nama Bank",
      "bankCode": "014",
      "logoUrl": "https://.../logo.svg",
      "accountTypes": ["INDIVIDUAL", "CORPORATE"],
      "capabilities": ["FEED"],
      "status": "AVAILABLE",
      "monthlyFee": { "amount": 0, "currency": "IDR" },
      "requiredFields": ["accountNumber", "accountHolderName", "corporateId", "signatoryName", "signatoryNationalId"],
      "consentValidityMonths": 12,
      "feeRules": [
        {
          "accountType": "CORPORATE",
          "monthly": 50000,
          "includedRefreshes": 500,
          "extraRefreshFee": 100,
          "autoRefreshesPerMonth": 180,
          "billing": "AUTO_DEBIT"
        }
      ]
    }
  ]
}
```

`feeRules` berisi aturan biaya per tipe rekening (angka di atas hanya contoh); tipe tanpa aturan berarti bank tidak punya aturan khusus dan `monthlyFee` berlaku. `bankCode` adalah kode bank resmi (BI) 3 digit, sama dengan master bank di frontend (`src/constants/banks.ts`), supaya penyedia dan master bisa dicocokkan. `logoUrl` opsional dan hanya boleh berisi logo yang boleh dipakai (izin bank). `capabilities` memungkinkan fase 3 (`PAYMENT`) tanpa mengubah kontrak. `status`: `AVAILABLE`, `COMING_SOON`, `MAINTENANCE`. Layar hanya menampilkan apa yang dikembalikan; tidak ada daftar bank di frontend.

Usulan bank yang belum tersedia: `POST /v1/bank-provider-requests` dengan `{ "bankCode": "002", "note": "opsional, maks. 200 karakter" }`. Jawaban `201` cukup. Dipakai tim produk untuk menentukan bank berikutnya (keputusan 12.2); tidak membuat koneksi apa pun.

### 7.2 Koneksi

| Endpoint | Fungsi |
|---|---|
| `POST /v1/bank-connections` | Buat draf. Body: `providerId`, `accountId` (akun Jurnal), `accountType`, `bankAccountNumber`, `accountHolderName`, `corporateId?`, `signatory { name, nationalId }`, `memo?`. |
| `GET /v1/bank-connections?accountId=&status=` | Daftar. Satu akun paling banyak satu koneksi non-final. |
| `GET /v1/bank-connections/:id` | Detail: status, alasan, `lastSyncedAt`, `statementBalance`, `statementBalanceAsOf`, `consent { signedAt, expiresAt }`, `nextAction`. |
| `PATCH /v1/bank-connections/:id` | Ubah draf (hanya `DRAFT` / `NEEDS_REVISION`). |
| `POST /v1/bank-connections/:id/documents` | Unggah satu dokumen, multipart: `type` (`IDENTITY` atau `ACCOUNT_PROOF`) dan `file`. Mengganti dokumen bertipe sama. Hanya pada `DRAFT` / `NEEDS_REVISION`. |
| `POST /v1/bank-connections/:id/submit` | Kirim untuk ditinjau. Validasi lengkap, kembalikan galat per field. |
| `GET /v1/bank-connections/:id/consent-document` | Dokumen persetujuan yang dibuat dari data formulir (PDF). |
| `POST /v1/bank-connections/:id/sign` | Catat tanda tangan, atau kembalikan URL penandatanganan (keputusan 12.4). |
| `POST /v1/bank-connections/:id/revoke` | Putus koneksi, alasan opsional. |
| `POST /v1/bank-connections/:id/cancel` | Batalkan draf atau pengajuan sebelum dikirim ke bank. |
| `GET /v1/bank-connections/:id/events` | Riwayat peristiwa (audit): waktu, pelaku, dari-ke, alasan. |

Respons detail memuat `refreshUsage: { used, included, extraRefreshFee }` bila bank membatasi penyegaran, `documents: [{ type, fileName }]` (hanya jenis dan nama berkas, tidak pernah berkasnya) dan `nextAction` (`FILL_FORM`, `FIX_FORM`, `WAIT_REVIEW`, `SIGN`, `WAIT_BANK`, `NONE`, `RECONNECT`) supaya layar tidak menebak langkah dari status.

Kode galat yang dibutuhkan (stabil, bisa diterjemahkan frontend): `ACCOUNT_NOT_ELIGIBLE` (header, arsip, petty cash), `ACCOUNT_ALREADY_CONNECTED`, `BANK_ACCOUNT_ALREADY_CONNECTED`, `PROVIDER_UNAVAILABLE`, `FIELD_INVALID` (dengan `field`), `ACCOUNT_HOLDER_MISMATCH`, `CONSENT_EXPIRED`, `CONNECTION_NOT_EDITABLE`, `DOCUMENT_REQUIRED` (`submit` tanpa dokumen lengkap), `DOCUMENT_UNREADABLE`.

### 7.3 Sinkronisasi

| Endpoint | Fungsi |
|---|---|
| `POST /v1/bank-connections/:id/sync` | Sinkronkan sekarang. Mengembalikan `202` dengan `syncRunId`; batas frekuensi (misalnya sekali per beberapa menit) dengan galat `SYNC_RATE_LIMITED`. |
| `GET /v1/bank-connections/:id/sync-runs?limit=` | Riwayat: `startedAt`, `finishedAt`, `trigger` (`SCHEDULE`, `WEBHOOK`, `MANUAL`), `status`, `added`, `duplicates`, `fromDate`, `toDate`, `error { code, message }`. |
| `POST /v1/webhooks/bank/:provider` | Masuk dari penyedia (fase 2). Tanda tangan diverifikasi, diproses idempoten, jawab cepat lalu proses asinkron. |

### 7.4 Rekening koran (perubahan resource yang ada)

`GET /v1/bank-statements` menambah field (baris impor lama: `source = IMPORT`, field baru kosong):

| Field | Arti |
|---|---|
| `source` | `IMPORT` atau `FEED` |
| `connectionId` | Koneksi asal (bila `FEED`) |
| `bankReference` | Referensi unik dari bank |
| `valueDate` | Tanggal valuta, `YYYY-MM-DD` |
| `postedAt` | Waktu posting UTC bila ada |
| `status` | `PENDING` atau `POSTED` |
| `runningBalance` | Saldo setelah mutasi, bila bank mengirim |
| `reversalOf` | Id mutasi asal bila ini pembalikan |

`DELETE` mutasi `FEED` ditolak (bukti bank tidak dihapus pengguna). Mutasi `FEED` yang salah dikoreksi lewat sinkronisasi berikutnya, bukan hapus manual.

### 7.5 Akun (perubahan resource yang ada)

`GET /v1/accounts` dan `/v1/accounts/:id` menambah objek ringan:

```json
"bankConnection": {
  "id": "bc_123",
  "status": "ACTIVE",
  "bankName": "Nama Bank",
  "lastSyncedAt": "2026-11-12T03:10:00Z",
  "statementBalance": 125000000,
  "statementBalanceAsOf": "2026-11-12T03:05:00Z"
}
```

Dipakai daftar Kas & Bank untuk kolom saldo rekening koran dan lencana status, tanpa panggilan tambahan per baris. Angka dalam satuan rupiah seperti field uang lain di API; frontend mengubah ke satuan minor di tepi (`@/lib/money`).

### 7.6 Hak akses, audit, keamanan

- Kode menu baru (mengikuti pola `JP-PC`), misalnya `JP-BC`: `read` (lihat koneksi dan mutasi), `create` (ajukan), `update` (sinkron manual, ubah draf), `delete` (putus). Penandatangan persetujuan bukan hak menu, tetapi peran/identitas yang tercatat di `consent`.
- Audit log: setiap peristiwa koneksi dan setiap sinkronisasi (siapa, kapan, hasil). Tidak ada penghapusan log oleh pengguna.
- Data sensitif: nomor rekening dan NIK dienkripsi saat disimpan (field-level), ditutup sebagian di respons (`••••1234`) kecuali untuk peran yang berhak. Kredensial dan token penyedia disimpan di penyimpanan rahasia (KMS/secret manager), tidak pernah di respons API atau log.
- Tidak ada rahasia di URL. Webhook memakai tanda tangan; kunci dirotasi.
- Pengambilan mutasi memakai batas hak paling kecil (baca-saja) pada sisi bank bila bank mendukung pemisahan hak.

### 7.7 Model data (ringkas)

- `BankConnection`: id, siteId, accountId, providerId, status, bankAccountNumber (terenkripsi), accountHolderName, accountType, corporateId, signatory (terenkripsi), consentSignedAt, consentExpiresAt, lastSyncedAt, statementBalance, statementBalanceAsOf, createdBy/At, updatedBy/At.
- `BankConnectionEvent`: connectionId, at, actor, fromStatus, toStatus, reason, metadata.
- `BankSyncRun`: connectionId, trigger, startedAt, finishedAt, status, added, duplicates, fromDate, toDate, errorCode, errorMessage.
- `BankStatement` (ada): tambah field 7.4, dengan indeks unik `(connectionId, bankReference)`.
- `ConsentRecord`: connectionId, documentId, signedBy, signedAt, expiresAt, version teks persetujuan.

### 7.8 Kebutuhan non-fungsional

- **Keterlambatan data:** target MVP mutasi tampil di Jurnal paling lambat sekian menit setelah tersedia di penyedia (angka: keputusan 12.6). Layar selalu menampilkan "terakhir sinkron".
- **Keandalan:** sinkronisasi idempoten dan dapat diulang; kegagalan satu koneksi tidak memengaruhi koneksi lain; antrean dengan retry dan dead-letter; alarm bila koneksi `ERROR` atau tidak sinkron melebihi batas.
- **Volume:** tentukan perkiraan mutasi per koneksi per hari dan jumlah koneksi (angka: keputusan bisnis) untuk ukuran antrean dan paginasi.
- **Retensi:** mutasi dan dokumen persetujuan disimpan sesuai kebijakan retensi dokumen keuangan (umumnya bertahun-tahun; periode pastinya ditetapkan legal).
- **Observabilitas:** metrik sukses/gagal per penyedia, latensi, jumlah duplikat, dan usia sinkronisasi terakhir.

## 8. Prinsip UI/UX (untuk draft tampilan)

Detail ada di artifact. Pokoknya:

- **Awalnya jelas:** halaman pertama menjelaskan manfaat dengan empat ilustrasi (rekonsiliasi, mutasi otomatis, keamanan, kontrol) dan langsung menawarkan pilihan bank. Tidak ada istilah teknis (tidak ada "API", "token", "server").
- **Pilih bank dulu, isi formulir kemudian,** dengan empat langkah yang selalu terlihat: Isi formulir, Ditinjau, Tanda tangan dan kirim, Aktif. Pengguna selalu tahu di mana ia berada dan siapa yang sedang ditunggu.
- **Formulir pendek dan bisa dilanjutkan:** simpan sebagai draf, galat per kolom dengan bahasa awam, kolom sensitif dijelaskan alasannya ("Bank memerlukan ini untuk memverifikasi pemilik rekening").
- **Satu tindakan utama per layar.** Tombol sekunder tenang. Peringatan oranye hanya untuk hal yang memerlukan tindakan.
- **Status yang jujur:** "Terakhir sinkron 10 menit lalu", bukan "Real-time". Kalau terhenti, katakan sebabnya dan tindakannya ("Persetujuan habis 3 hari lagi. Perpanjang").
- **Dua angka berdampingan** di akun terhubung: saldo rekening koran dan saldo di Jurnal, dengan selisih dan tautan ke rekonsiliasi.
- **Kondisi kosong dan galat** punya penyebab dan langkah berikutnya, bukan "Tidak ada data".
- **Aksesibel:** semua kontrol punya nama, urutan tab wajar, status tidak hanya lewat warna, ilustrasi dekoratif disembunyikan dari pembaca layar.

## 9. Keamanan, privasi, dan kepatuhan

Daftar yang harus dikonfirmasi legal dan keamanan sebelum rilis. Tidak ada klaim sertifikasi di dokumen ini.

- Data pribadi penanggung jawab (nama, NIK) termasuk data pribadi: tujuan dan dasar pemrosesan dicatat, akses dibatasi, retensi ditetapkan, hak pemilik data dihormati (UU Pelindungan Data Pribadi).
- Persetujuan memuat: pihak yang memberi izin, cakupan data (mutasi dan saldo, baca-saja), tujuan, masa berlaku, dan cara mencabut. Teks persetujuan berversi dan disimpan.
- Kontrol keamanan setara kerangka manajemen keamanan informasi (misalnya ISO/IEC 27001) adalah target organisasi; apakah halaman publik boleh menyebut sertifikasi hanya setelah sertifikasi benar-benar dimiliki.
- Bila memakai pihak ketiga: perjanjian pemrosesan data, kewajiban pelaporan insiden, dan kejelasan di mana data disimpan.
- Pencatatan akses: siapa melihat data sensitif, kapan.

## 10. Metrik keberhasilan

- Persentase mutasi yang cocok otomatis (rekomendasi diterima) naik dibanding impor manual.
- Waktu rekonsiliasi bulanan per akun turun (ukur dari sesi pengguna, bukan perkiraan).
- Persentase koneksi yang sampai `ACTIVE` dalam jumlah hari target sejak diajukan.
- Tingkat sinkronisasi berhasil (target diusulkan: sangat tinggi, angka ditetapkan bersama backend).
- Duplikat mutasi yang lolos ke pengguna: 0.
- Selisih antara saldo rekening koran dan saldo di Jurnal yang tidak terjelaskan oleh item rekonsiliasi: turun.

## 11. Risiko

- **Ketergantungan pihak luar.** Jadwal onboarding bank/penyedia di luar kendali tim; fase 1 bisa tertunda bahkan bila kode siap.
- **Perbedaan antarbank.** Format mutasi, referensi unik, dan kedalaman riwayat berbeda. Abstraksi harus menormalkannya tanpa kehilangan data mentah (simpan payload asli).
- **Duplikat dan koreksi bank.** Salah dedupe berarti saldo salah. Perlu tes dengan data nyata dan mekanisme koreksi.
- **Data sensitif.** Kebocoran NIK atau nomor rekening berdampak hukum dan reputasi. Enkripsi, akses minimal, dan audit bukan opsional.
- **Ekspektasi pengguna.** "Otomatis" tidak berarti "langsung menjadi jurnal". Layar harus menjelaskan bahwa mutasi menunggu dicocokkan.
- **Biaya.** Biaya per koneksi dari penyedia bisa melebihi harga yang dibayar pengguna kecil.

## 12. Keputusan yang dibutuhkan

1. **Strategi penyedia:** satu bank pilot lewat API resmi, agregator berlisensi, atau keduanya di balik abstraksi (usulan: abstraksi dari awal, mulai dengan satu jalur).
2. **Bank pilot:** bank mana yang pertama, dan jenis rekening apa (perorangan, korporasi, atau keduanya).
3. **Model harga:** gratis, bundel paket, atau biaya bulanan per koneksi. Siapa yang menanggung biaya penyedia. (Angka biaya di layar datang dari backend; draft memakai teks contoh.)
4. **Tanda tangan persetujuan:** unggah dokumen yang ditandatangani basah, tanda tangan elektronik biasa, atau tanda tangan elektronik tersertifikasi. Menentukan alur langkah 3 dan beban legal.
5. **Kedalaman riwayat awal:** berapa hari mutasi ke belakang yang ditarik saat pertama aktif, dan apakah dibatasi bank.
6. **Target keterlambatan:** berapa menit/jam yang dijanjikan antara mutasi di bank dan di Jurnal; apakah MVP cukup harian.
7. **Masa berlaku persetujuan:** berapa bulan, dan siapa yang boleh memperpanjang.
8. **Aturan otomatis di MVP?** Usulan: tidak (fase 2), untuk menjaga prinsip mutasi bukan jurnal.
9. **Peran penandatangan:** apakah harus pengguna terdaftar di Jurnal, atau cukup identitas yang dicatat saat tanda tangan.
10. **Hak akses menu:** kode menu `JP-BC` dan siapa mendapat `create`/`delete` secara bawaan.
11. **Retensi dan lokasi data:** berapa lama, dan apakah data harus tetap di wilayah tertentu.
12. **Pengarsipan akun terhubung:** setuju ditolak sampai koneksi diputus?

## 13. Di luar cakupan

- Pembayaran dan transfer dari Jurnal ke bank (fase 3, PRD terpisah).
- Pembuatan jurnal otomatis tanpa persetujuan pengguna.
- Multi-mata-uang dan rekening valas.
- Kartu kredit dan e-wallet sebagai sumber mutasi (bisa memakai pola sama, tetapi keputusan terpisah).
- Pemindaian dokumen bank (OCR) sebagai pengganti impor file.

## Lampiran A: contoh mutasi yang masuk ke `GET /v1/bank-statements`

```json
{
  "id": "bs_001",
  "accountId": "6aec71d3248ac0bdd13978a1",
  "source": "FEED",
  "connectionId": "bc_123",
  "bankReference": "TRX-20261112-000187",
  "date": "2026-11-12",
  "valueDate": "2026-11-12",
  "postedAt": "2026-11-12T02:41:00Z",
  "status": "POSTED",
  "description": "TRSF E-BANKING CR 1211/FTSCY/WS95031 PT MAJU BERSAMA",
  "amount": 2500000,
  "runningBalance": 127500000,
  "isReconciled": false
}
```

Tanda `amount`: positif = uang masuk, negatif = uang keluar, sama seperti aturan layar sekarang.

## Lampiran B: pertanyaan untuk bank atau penyedia

1. Apakah ada referensi unik per mutasi, dan stabil antar penarikan?
2. Berapa mundur riwayat yang bisa ditarik, dan dalam satuan apa (hari, bulan)?
3. Apakah mutasi `pending` dibedakan dari `posted`, dan bagaimana pembalikan disampaikan?
4. Apakah saldo penutup tersedia, dan seberapa sering diperbarui?
5. Ada webhook atau hanya tarik (polling)? Batas laju dan jam layanan (misalnya jam cut-off, hari libur)?
6. Persyaratan onboarding: dokumen, tanda tangan, siapa penandatangan sah, lama proses, biaya.
7. Dukungan rekening perorangan versus korporasi, dan apakah satu perusahaan boleh punya banyak rekening.
8. Cara pencabutan persetujuan dan masa berlaku.
9. Lokasi penyimpanan data, kewajiban pelaporan insiden, dan sertifikasi keamanan yang dimiliki penyedia.
10. Lingkungan uji (sandbox) dan data uji untuk pengembangan.
