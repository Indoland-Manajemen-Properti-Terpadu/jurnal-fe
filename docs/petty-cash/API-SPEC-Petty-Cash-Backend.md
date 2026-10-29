# Backend API & Data Specification: Modul Kas Kecil (Petty Cash) — Jurnal ProApps

**Dokumen**: Panduan Implementasi Backend & Kontrak API (API Contract)  
**Versi API**: `v1`  
**Base URL**: `/v1/petty-cash`  
**Standar Akuntansi**: Imprest Fund System (Sistem Dana Tetap)  
**Format Payload**: JSON (Content-Type: `application/json`), Multi-part form untuk upload lampiran nota  

---

## 1. Arsitektur Data & Skema Database (Database Schema)

Terdapat 4 entitas utama yang wajib disediakan di database backend:

### 1.1 Tabel `petty_cash_funds` (Pos Dana Kas Kecil)
Menyimpan konfigurasi pagu dana kas kecil untuk tiap unit/kantor/departemen.

| Kolom | Tipe Data | Keterangan |
| :--- | :--- | :--- |
| `id` | VARCHAR(36) / UUID | Primary Key |
| `name` | VARCHAR(150) | Nama Pos Kas Kecil (e.g., "Kas Kecil Kantor Pusat", "Kas Kecil Site Cikarang") |
| `code` | VARCHAR(20) | Kode Pos Kas (e.g., "PC-HQ", "PC-CKR") |
| `account_id` | VARCHAR(36) | Foreign Key ke tabel COA `accounts` (e.g., Akun `1-1102 Kas Kecil`) |
| `pagu_amount` | DECIMAL(18,2) | Besaran pagu dana tetap (e.g., Rp 5.000.000,00) |
| `warning_threshold_pct` | INT | Ambang batas peringatan minimum kas fisik (default: 20%) |
| `custodian_id` | VARCHAR(36) | ID Staf Pemegang Kas / Kasir (User ID) |
| `custodian_name` | VARCHAR(150) | Snapshot nama kasir penanggung jawab |
| `is_active` | BOOLEAN | Status aktif pos dana (default: `true`) |
| `created_at` / `updated_at` | TIMESTAMP | Audit timestamp |

> **Kalkulasi Real-time (Virtual Fields):**
> - `current_balance` (Kas Fisik Tersedia) = `pagu_amount - SUM(unreimbursed vouchers amount)`
> - `pending_reimburse_amount` = `SUM(vouchers where status IN ('PENDING_REIMBURSE', 'APPROVED'))`

---

### 1.2 Tabel `petty_cash_vouchers` (Bukti Pengeluaran Kas Kecil / BPKK)
Menyimpan setiap voucher transaksi harian sebelum di-reimburse.

| Kolom | Tipe Data | Keterangan |
| :--- | :--- | :--- |
| `id` | VARCHAR(36) / UUID | Primary Key |
| `fund_id` | VARCHAR(36) | Foreign Key ke `petty_cash_funds` |
| `voucher_number` | VARCHAR(50) | Format otomatis: `PCV/YYYYMM/XXXX` (e.g., `PCV/202610/0042`) |
| `transaction_date` | DATE / TIMESTAMP | Tanggal bukti pengeluaran |
| `beneficiary` | VARCHAR(150) | Nama penerima dana (e.g., "Bambang (Driver)", "Toko Gramedia") |
| `expense_account_id` | VARCHAR(36) | Foreign Key ke `accounts` (COA Beban, e.g., `6-1002 Beban Bensin`) |
| `amount` | DECIMAL(18,2) | Nominal pengeluaran (Wajib > 0) |
| `description` | TEXT | Keterangan keperluan operasional |
| `receipt_number` | VARCHAR(100) | Nomor fisik struk / kwitansi (jika ada) |
| `attachment_url` | VARCHAR(255) | URL file upload bukti nota/struk |
| `status` | ENUM | `PENDING_REIMBURSE`, `APPROVED`, `REIMBURSED`, `VOID` |
| `reimbursement_id` | VARCHAR(36) | Foreign Key ke `petty_cash_reimbursements` (NULL sebelum diganti) |
| `created_by` | VARCHAR(36) | User ID pembuat voucher |
| `created_at` / `updated_at` | TIMESTAMP | Audit timestamp |

---

### 1.3 Tabel `petty_cash_reimbursements` (Pengajuan Penggantian Dana)
Rekapitulasi penggantian dana batch untuk menerbitkan jurnal umum buku besar.

| Kolom | Tipe Data | Keterangan |
| :--- | :--- | :--- |
| `id` | VARCHAR(36) / UUID | Primary Key |
| `fund_id` | VARCHAR(36) | Foreign Key ke `petty_cash_funds` |
| `reimbursement_number` | VARCHAR(50) | Format otomatis: `PCR/YYYYMM/XXXX` |
| `request_date` | DATE | Tanggal pengajuan |
| `total_amount` | DECIMAL(18,2) | Total akumulasi nominal seluruh voucher terpilih |
| `bank_account_id` | VARCHAR(36) | Foreign Key ke `accounts` (COA Bank pembayar, e.g., `1-1201 Bank BCA`) |
| `journal_transaction_id` | VARCHAR(36) | Foreign Key ke tabel Jurnal Umum `journal_transactions` |
| `status` | ENUM | `SUBMITTED`, `APPROVED`, `DISBURSED`, `REJECTED` |
| `notes` | TEXT | Catatan penggantian dana |
| `approved_by` | VARCHAR(36) | User ID manajer finance yang menyetujui |
| `disbursed_at` | TIMESTAMP | Waktu pencairan dana |

---

### 1.4 Tabel `petty_cash_counts` (Berita Acara Opname Kas Fisik / Cash Count)
Audit fisik uang tunai di brankas kas kecil.

| Kolom | Tipe Data | Keterangan |
| :--- | :--- | :--- |
| `id` | VARCHAR(36) / UUID | Primary Key |
| `fund_id` | VARCHAR(36) | Foreign Key ke `petty_cash_funds` |
| `count_number` | VARCHAR(50) | Format otomatis: `BAO/YYYYMM/XXXX` |
| `count_date` | TIMESTAMP | Tanggal dan jam penghitungan fisik |
| `denominations` | JSON / JSONB | Rincian keping/lembar per pecahan rupiah |
| `total_physical_cash` | DECIMAL(18,2) | Total uang fisik hasil hitungan |
| `total_unreimbursed_vouchers`| DECIMAL(18,2) | Total voucher yang belum di-reimburse saat opname |
| `actual_total` | DECIMAL(18,2) | `total_physical_cash + total_unreimbursed_vouchers` |
| `pagu_amount` | DECIMAL(18,2) | Besaran pagu pada saat opname |
| `variance` | DECIMAL(18,2) | `actual_total - pagu_amount` (0 = Seimbang, minus = Kurang, plus = Lebih) |
| `status` | ENUM | `BALANCED`, `SHORT`, `OVER` |
| `adjustment_journal_id` | VARCHAR(36) | FK ke Jurnal jika selisih dibukukan ke beban selisih kas |
| `notes` | TEXT | Keterangan Berita Acara Opname |

---

## 2. Standar Envelope Response API

Seluruh response API wajib mengikuti standar ProApps response envelope:

```json
{
  "code": 200,
  "message": "Get petty cash funds success",
  "data": { ... }
}
```

Untuk response dengan pagination:
```json
{
  "code": 200,
  "message": "Get vouchers list success",
  "data": [ ... ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 45,
    "totalPages": 5
  }
}
```

---

## 3. Spesifikasi Endpoint REST API

### 3.1 Pos Kas Kecil (Funds Management)

#### A. `GET /v1/petty-cash/funds`
Mengambil daftar seluruh pos kas kecil beserta kalkulasi saldo likuid real-time.
- **Query Params**: `isActive=true|false`
- **Response `data`**:
```json
[
  {
    "id": "fund-hq-001",
    "name": "Kas Kecil Kantor Pusat (HQ)",
    "code": "PC-HQ",
    "accountId": "acc-1102",
    "accountCode": "1-1102",
    "accountName": "Kas Kecil Kantor Pusat",
    "pagu": 5000000,
    "currentBalance": 3450000,
    "pendingReimburseAmount": 1550000,
    "custodianId": "usr-01",
    "custodianName": "Siti Rahmawati (Kasir Operasional)",
    "warningThreshold": 1000000,
    "warningThresholdPct": 20,
    "status": "ACTIVE",
    "createdAt": "2026-01-01T00:00:00.000Z"
  }
]
```

#### B. `GET /v1/petty-cash/funds/:id`
Mengambil detail satu pos kas kecil lengkap dengan metrik ringkas.

#### C. `POST /v1/petty-cash/funds`
Membuka pos kas kecil baru.
- **Request Body**:
```json
{
  "name": "Kas Kecil Site Cikarang",
  "code": "PC-CKR",
  "accountId": "acc-1103",
  "pagu": 10000000,
  "warningThresholdPct": 20,
  "custodianId": "usr-05",
  "custodianName": "Ahmad Subarjo"
}
```

---

### 3.2 Pengeluaran Voucher BPKK (Vouchers API)

#### A. `GET /v1/petty-cash/vouchers`
Mengambil daftar voucher pengeluaran kas kecil dengan filtering.
- **Query Params**:
  - `fundId` (string, opsional)
  - `status` (`PENDING_REIMBURSE` | `APPROVED` | `REIMBURSED` | `VOID`)
  - `search` (string pencarian nomor voucher / beneficiary / description)
  - `startDate`, `endDate` (ISO Date string `YYYY-MM-DD`)
  - `page` (number, default: 1)
  - `limit` (number, default: 10)

- **Response `data`**:
```json
[
  {
    "id": "vch-202610-001",
    "fundId": "fund-hq-001",
    "fundName": "Kas Kecil Kantor Pusat (HQ)",
    "voucherNumber": "PCV/202610/0101",
    "date": "2026-10-21T08:30:00.000Z",
    "beneficiary": "Bambang (Driver Operasional)",
    "expenseAccount": {
      "id": "acc-6002",
      "code": "6-1002",
      "name": "Beban Transportasi, Bensin & Tol",
      "category": "Beban Operasional"
    },
    "amount": 250000,
    "description": "Pengisian BBM operasional Avanza & e-toll pengantaran invoice tender",
    "receiptNumber": "STRUK-SPBU-84920",
    "attachmentUrl": "/uploads/petty-cash/vch-202610-0101-receipt.jpg",
    "status": "PENDING_REIMBURSE",
    "createdBy": "Siti Rahmawati",
    "createdAt": "2026-10-21T08:35:12.000Z"
  }
]
```

#### B. `POST /v1/petty-cash/vouchers`
Membuat voucher pengeluaran baru.
- **Poka-Yoke Rule (Wajib Divalidasi Backend)**:
  `amount` **TIDAK BOLEH** lebih besar dari `currentBalance` dana kas kecil terkait.
  Jika melanggar, kembalikan HTTP 400 dengan error code `PETTY_CASH_INSUFFICIENT_BALANCE`.

- **Request Body**:
```json
{
  "fundId": "fund-hq-001",
  "date": "2026-10-21T09:00:00.000Z",
  "beneficiary": "Toko Buku Gramedia",
  "expenseAccountId": "acc-6001",
  "amount": 450000,
  "description": "Pembelian kertas A4, tinta stempel, dan binder tender",
  "receiptNumber": "GRM-20261021-992",
  "attachmentUrl": "https://storage.proapps.id/attachments/nota-atk.pdf"
}
```

#### C. `POST /v1/petty-cash/vouchers/:id/void`
Membatalkan voucher (Hanya diizinkan jika voucher belum di-reimburse / status `PENDING_REIMBURSE`).
- Efek: Mengembalikan saldo sisa kas fisik secara otomatis.

---

### 3.3 Penggantian Dana (Reimbursement API)

#### A. `POST /v1/petty-cash/reimbursements/preview`
Endpoint simulasi rekapitulasi penggantian dana sebelum submit. Mengelompokkan total voucher per pos COA Beban dan mengembalikan pratinjau jurnal akuntansi double-entry.
- **Request Body**:
```json
{
  "fundId": "fund-hq-001",
  "voucherIds": ["vch-001", "vch-002", "vch-003"],
  "bankAccountId": "acc-1201"
}
```

- **Response `data`**:
```json
{
  "totalAmount": 900000,
  "voucherCount": 3,
  "expenseBreakdown": [
    { "code": "6-1002", "name": "Beban Transportasi & Bensin", "amount": 150000 },
    { "code": "6-1005", "name": "Beban Konsumsi Rapat", "amount": 350000 },
    { "code": "6-1001", "name": "Beban ATK & Percetakan", "amount": 400000 }
  ],
  "journalPreview": [
    { "account": "6-1002 - Beban Transportasi & Bensin", "debit": 150000, "credit": 0 },
    { "account": "6-1005 - Beban Konsumsi Rapat", "debit": 350000, "credit": 0 },
    { "account": "6-1001 - Beban ATK & Percetakan", "debit": 400000, "credit": 0 },
    { "account": "1-1201 - Bank BCA Operasional", "debit": 0, "credit": 900000 }
  ],
  "isBalanced": true
}
```

#### B. `POST /v1/petty-cash/reimbursements`
Mengajukan penggantian dana kas kecil.

#### C. `POST /v1/petty-cash/reimbursements/:id/disburse`
Mencairkan dana penggantian (*Disbursement*).
- **Aksi Otomatis Backend**:
  1. Generate nomor transaksi jurnal umum (Jurnal Umum).
  2. Posting entri double-entry ke tabel jurnal buku besar (`journal_transactions` & `journal_details`):
     - **Debit**: Masing-masing akun beban COA dari voucher terkait.
     - **Kredit**: Akun Bank pembayar (`bankAccountId`).
  3. Ubah status seluruh voucher terkait dari `PENDING_REIMBURSE` $\rightarrow$ `REIMBURSED`.
  4. Pulihkan saldo kas fisik kas kecil kembali ke pagu awal.
  5. Catat audit trail user yang mencairkan dana.

---

### 3.4 Opname Kas Fisik (Cash Count API)

#### A. `POST /v1/petty-cash/counts`
Menyimpan Berita Acara Opname Fisik Kas Kecil.
- **Request Body**:
```json
{
  "fundId": "fund-hq-001",
  "countDate": "2026-10-21T17:00:00.000Z",
  "countedBy": "Siti Rahmawati",
  "verifiedBy": "Hendra Wijaya (Finance Supervisor)",
  "denominations": [
    { "value": 100000, "label": "Rp 100.000", "count": 30, "subtotal": 3000000 },
    { "value": 50000,  "label": "Rp 50.000",  "count": 8,  "subtotal": 400000 },
    { "value": 20000,  "label": "Rp 20.000",  "count": 2,  "subtotal": 40000 },
    { "value": 10000,  "label": "Rp 10.000",  "count": 1,  "subtotal": 10000 }
  ],
  "notes": "Opname kas fisik rutin penutupan buku bulan berjalan."
}
```

- **Backend Calculation Logic**:
  1. Hitung `totalPhysicalCash = SUM(denominations.subtotal)`.
  2. Ambil `totalUnreimbursedVouchers = SUM(amount where fundId = fundId AND status = 'PENDING_REIMBURSE')`.
  3. Hitung `actualTotal = totalPhysicalCash + totalUnreimbursedVouchers`.
  4. Hitung `variance = actualTotal - pagu`.
  5. Tentukan `status`:
     - `variance === 0` $\rightarrow$ `BALANCED`
     - `variance < 0` $\rightarrow$ `SHORT` (Kurang)
     - `variance > 0` $\rightarrow$ `OVER` (Lebih)

---

## 4. Error Code & Validasi Khusus

| Kode Error | HTTP Status | Pesan / Penyebab |
| :--- | :--- | :--- |
| `PETTY_CASH_INSUFFICIENT_BALANCE` | 400 | Nominal pengeluaran melebihi sisa fisik kas kecil yang tersedia di brankas. |
| `VOUCHER_ALREADY_REIMBURSED` | 400 | Voucher sudah pernah diikutsertakan dalam reimbursement yang dicairkan. |
| `FUND_NOT_ACTIVE` | 400 | Pos kas kecil berstatus nonaktif, tidak dapat melakukan transaksi. |
| `EMPTY_VOUCHER_SELECTION` | 400 | Reimbursement wajib memilih minimal satu voucher pengeluaran yang valid. |
| `INVALID_BANK_ACCOUNT` | 400 | Rekening bank sumber penggantian tidak valid atau tidak memiliki saldo memadai. |
| `UNBALANCED_JOURNAL_ERROR` | 500 | Terjadi kesalahan kalkulasi debit/kredit pada posting jurnal penggantian dana. |
| `FUND_NOT_FOUND` | 404 | ID Pos Kas Kecil tidak ditemukan dalam database. |

---

## 5. Ringkasan Tugas Tim Backend (Action Items Checklist)

- [ ] **Migrasi Database**: Buat tabel `petty_cash_funds`, `petty_cash_vouchers`, `petty_cash_reimbursements`, dan `petty_cash_counts`.
- [ ] **Validasi Limit Saldo Fisik**: Pasang interceptor/service rule agar penarikan voucher tidak melebihi sisa kas fisik.
- [ ] **Grouping Beban Reimbursement**: Buat fungsi query rekapitulasi total nominal per `expenseAccountId`.
- [ ] **Posting Jurnal Otomatis**: Integrasikan service pencairan reimbursement dengan engine `journal_transactions` (Debit Aneka Beban, Kredit Bank).
- [ ] **Perhitungan Opname**: Implementasikan logika otomatis varian `Cash Over/Short` pada submit berita acara fisik uang.

