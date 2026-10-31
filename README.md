# Jurnal ProApps

<p align="center">
  <strong>Platform frontend akuntansi dan manajemen jurnal untuk ekosistem ProApps.</strong>
</p>

<p align="center">
  Aplikasi web modern berbasis React, TypeScript, Vite, Mantine, dan React Query untuk mengelola jurnal umum, kas/bank, kontak, laporan keuangan, anggaran, serta administrasi pengguna.
</p>

---

## Daftar Isi

- [Ringkasan](#ringkasan)
- [Fitur Utama](#fitur-utama)
- [Teknologi](#teknologi)
- [Prasyarat](#prasyarat)
- [Instalasi](#instalasi)
- [Menjalankan Aplikasi](#menjalankan-aplikasi)
- [Script Tersedia](#script-tersedia)
- [Struktur Proyek](#struktur-proyek)
- [Modul Aplikasi](#modul-aplikasi)
- [Konfigurasi API](#konfigurasi-api)
- [Standar Kode](#standar-kode)
- [Testing dan Quality Gate](#testing-dan-quality-gate)
- [Build dan Preview Produksi](#build-dan-preview-produksi)
- [Panduan Kontribusi](#panduan-kontribusi)
- [Catatan Pengembangan](#catatan-pengembangan)
- [Design Guardrail untuk AI Agent](#design-guardrail-untuk-ai-agent)

---

## Ringkasan

**Jurnal ProApps** adalah antarmuka frontend untuk kebutuhan pencatatan transaksi, pengelolaan akun, rekonsiliasi bank, kontrol periode akuntansi, laporan keuangan, dan manajemen akses pengguna. Proyek ini disusun dengan pendekatan modular agar mudah dikembangkan, diuji, dan dirawat oleh tim internal perusahaan.

Aplikasi menggunakan **Mantine v8** sebagai fondasi UI, **React Router** untuk navigasi, **TanStack React Query** untuk pengelolaan data server, **Zustand** untuk state global ringan, serta **Axios** sebagai HTTP client.

---

## Fitur Utama

### Akuntansi dan Jurnal

- Pengelolaan jurnal umum.
- Pembuatan akun jurnal baru.
- Input transaksi jurnal.
- Detail akun kas/bank dan non-kas/bank.
- Saldo awal akun.
- Period lock dan closing book.
- Impor bank statement.
- Rekonsiliasi transaksi bank.

### Bank dan Kas

- Ringkasan bank dan kas.
- Transfer uang.
- Penerimaan uang.
- Pengeluaran uang.

### Kontak

- Daftar kontak.
- Tambah kontak.
- Detail kontak.
- Riwayat transaksi berdasarkan kontak.

### Laporan Keuangan

- Neraca.
- Trial balance.
- Laporan laba rugi.
- Laporan laba rugi berbasis anggaran.
- Arus kas.
- Journal entry.
- General ledger.
- Perubahan ekuitas.
- Ringkasan bisnis.
- Ekspor laporan keuangan.

### Administrasi dan Akses

- Login pengguna.
- Manajemen pengguna.
- Tambah dan edit pengguna.
- Manajemen role dan access role.

### Pengalaman Pengguna

- UI konsisten berbasis Mantine.
- Notifikasi aplikasi.
- Modal terpusat.
- Komponen reusable.
- Empty state dan error state.
- Dukungan Storybook untuk dokumentasi komponen.

---

## Teknologi

| Area                 | Teknologi                        |
| -------------------- | -------------------------------- |
| Framework UI         | React 18                         |
| Bahasa               | TypeScript                       |
| Build Tool           | Vite 5                           |
| Komponen UI          | Mantine 8                        |
| Routing              | React Router DOM 6               |
| Server State         | TanStack React Query 5           |
| Global State         | Zustand                          |
| HTTP Client          | Axios                            |
| Tabel Data           | mantine-datatable                |
| Icon                 | Tabler Icons                     |
| Rich Text            | TipTap                           |
| PDF                  | jsPDF dan jsPDF AutoTable        |
| Date Utility         | Day.js dan date-fns              |
| Testing              | Vitest dan React Testing Library |
| Dokumentasi Komponen | Storybook 8                      |
| Linting              | ESLint dan Stylelint             |
| Formatting           | Prettier                         |
| Package Manager      | Yarn 4                           |

---

## Prasyarat

Pastikan perangkat pengembangan memiliki:

- Node.js versi LTS terbaru.
- Yarn 4 sesuai konfigurasi proyek.
- Akses ke repository `jurnal-fe`.
- Akses ke API Jurnal ProApps sesuai kebutuhan lingkungan.

Cek versi lokal:

```bash
node --version
yarn --version
```

---

## Instalasi

Clone repository lalu masuk ke direktori proyek:

```bash
git clone <repository-url>
cd jurnal-fe
```

Install dependency:

```bash
yarn install
```

---

## Menjalankan Aplikasi

Jalankan development server:

```bash
yarn dev
```

Secara default, Vite akan menampilkan URL lokal di terminal, umumnya:

```bash
http://localhost:5173
```

---

## Script Tersedia

| Script                 | Fungsi                                                       |
| ---------------------- | ------------------------------------------------------------ |
| `yarn dev`             | Menjalankan aplikasi dalam mode pengembangan.                |
| `yarn build`           | Menjalankan TypeScript compiler lalu membuat build produksi. |
| `yarn preview`         | Menjalankan preview hasil build produksi.                    |
| `yarn typecheck`       | Mengecek tipe TypeScript tanpa menghasilkan output build.    |
| `yarn lint`            | Menjalankan ESLint ratchet dan Stylelint.                    |
| `yarn lint:ratchet`    | Gagal bila jumlah pelanggaran ESLint naik dari baseline.     |
| `yarn lint:eslint`     | Mengecek kode TypeScript dan React dengan ESLint.            |
| `yarn lint:eslint:fix` | Memperbaiki issue ESLint yang bisa diperbaiki otomatis.      |
| `yarn lint:stylelint`  | Mengecek file CSS dengan Stylelint.                          |
| `yarn prettier`        | Mengecek format file TypeScript dan TSX.                     |
| `yarn prettier:write`  | Memformat file TypeScript dan TSX.                           |
| `yarn prettier:changed`| Mengecek format hanya pada file yang berubah dari base.      |
| `yarn vitest`          | Menjalankan unit test satu kali.                             |
| `yarn vitest:watch`    | Menjalankan test dalam mode watch.                           |
| `yarn test`            | Menjalankan typecheck, prettier, lint, vitest, dan build.    |
| `yarn storybook`       | Menjalankan Storybook di port 6006.                          |
| `yarn storybook:build` | Membuat build statis Storybook.                              |

---

## Struktur Proyek

Peta folder (`src/module`, `src/components`, `src/lib`, `src/theme`, `src/styles`, dan seterusnya) beserta aturan dependensinya ada di satu tempat: [`docs/architecture.md`](docs/architecture.md). Design system (token, tipografi, warna) ada di [`docs/design-system.md`](docs/design-system.md).

---

## Modul Aplikasi

Daftar modul fitur, README masing-masing, dan statusnya ada di [`docs/modules/README.md`](docs/modules/README.md) dan [`docs/migration/STATUS.md`](docs/migration/STATUS.md).

---------------- | ---------------------------------------------------------------------------------------- |
| `Authentication` | Halaman dan flow autentikasi pengguna.                                                   |
| `Dashboard`      | Halaman dashboard utama.                                                                 |
| `GeneralJournal` | Jurnal umum, akun, transaksi, saldo awal, bank statement, period lock, dan closing book. |
| `BankCash`       | Transfer, penerimaan, pengeluaran, serta ringkasan bank dan kas.                         |
| `Contact`        | Manajemen kontak dan transaksi terkait kontak.                                           |
| `ResultReport`   | Laporan neraca, laba rugi, arus kas, trial balance, general ledger, dan laporan lain.    |
| `SettingBudget`  | Pengelolaan anggaran.                                                                    |
| `SettingMenu`    | Pengaturan aplikasi, pengguna, dan role.                                                 |
| `LandingPage`    | Halaman awal aplikasi.                                                                   |

---

## Konfigurasi API

Konfigurasi API berada pada:

- `src/lib/http/apiClient.ts` (client HTTP tunggal dengan interceptor token)
- `src/lib/http/endpoints.ts` (konstanta endpoint; dipindah ke tiap fitur saat migrasi)

Saat ini aplikasi mengarah ke layanan API ProApps berikut:

```text
https://api-jurnal.proapps.id/
https://jurnal-api.proapps.id
```

Aturan akses API, endpoint, dan penanganan kredensial ada di [`docs/architecture.md`](docs/architecture.md#api-integration).

---

## Dokumentasi

Indeks dokumentasi ada di [`docs/README.md`](docs/README.md): [arsitektur](docs/architecture.md), [design system](docs/design-system.md), [konvensi](docs/conventions.md), [branching dan rilis](docs/branching-and-release.md), [keputusan arsitektur (ADR)](docs/adr), dan [status migrasi](docs/migration/STATUS.md).

---

## Standar Kode

Seluruh aturan arsitektur, penamaan, akuntansi, UI, dan i18n diindeks di [`AGENTS.md`](AGENTS.md). Workflow tugas ada di [`docs/agents/`](docs/agents/README.md). README ini berisi dokumentasi produk, setup, dan perintah yang tersedia.

## Testing dan Quality Gate

Aturan verifikasi ada di [`docs/conventions.md`](docs/conventions.md#testing-and-verification). Daftar script yang tersedia ada di bagian [Script Tersedia](#script-tersedia); konfigurasi CI yang aktif ada di [`.github/workflows/`](.github/workflows).

---

## Build dan Preview Produksi

Buat build produksi:

```bash
yarn build
```

Preview hasil build:

```bash
yarn preview
```

Gunakan [workflow kesiapan deployment](docs/agents/workflows/deployment-readiness.md) sebelum menyiapkan perubahan untuk deployment.

---

## Panduan Kontribusi

Aturan scope dan perubahan ada di [`docs/agents/README.md`](docs/agents/README.md); arsitektur di [`docs/architecture.md`](docs/architecture.md).

---

## Catatan Pengembangan

- Stack yang digunakan tercatat di bagian [Teknologi](#teknologi). Aturan penggunaan dan perubahan stack ada di [`docs/conventions.md`](docs/conventions.md).

---

## Design Guardrail untuk AI Agent

Aturan desain dan UI ada di [`docs/ui-guidelines.md`](docs/ui-guidelines.md) dan [`docs/design-system.md`](docs/design-system.md), termasuk referensi Figma dan token tema. `AGENTS.md` dan `GEMINI.md` hanya menunjuk ke aturan tersebut agar tidak ada standar yang saling bertentangan.

---

<p align="center">
  <strong>Jurnal ProApps</strong><br />
  Frontend akuntansi modern untuk operasional bisnis yang terstruktur, aman, dan mudah dikembangkan.
</p>
