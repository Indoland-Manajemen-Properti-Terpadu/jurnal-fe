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
| `yarn lint`            | Menjalankan ESLint dan Stylelint.                            |
| `yarn lint:eslint`     | Mengecek kode TypeScript dan React dengan ESLint.            |
| `yarn lint:eslint:fix` | Memperbaiki issue ESLint yang bisa diperbaiki otomatis.      |
| `yarn lint:stylelint`  | Mengecek file CSS dengan Stylelint.                          |
| `yarn prettier`        | Mengecek format file TypeScript dan TSX.                     |
| `yarn prettier:write`  | Memformat file TypeScript dan TSX.                           |
| `yarn vitest`          | Menjalankan unit test satu kali.                             |
| `yarn vitest:watch`    | Menjalankan test dalam mode watch.                           |
| `yarn test`            | Menjalankan typecheck, prettier, lint, vitest, dan build.    |
| `yarn storybook`       | Menjalankan Storybook di port 6006.                          |
| `yarn storybook:build` | Membuat build statis Storybook.                              |

---

## Struktur Proyek

```text
jurnal-fe/
├── public/                 # Asset publik, mock data, dan template CSV
├── src/
│   ├── assets/             # Asset visual, font, dan stylesheet global layout
│   ├── components/         # Komponen reusable lintas modul
│   ├── examples/           # Contoh implementasi komponen atau pola teknis
│   ├── hooks/              # Custom hooks aplikasi
│   ├── lib/                # Konfigurasi library eksternal
│   ├── module/             # Modul fitur utama aplikasi
│   ├── router/             # Konfigurasi route aplikasi
│   ├── services/           # API client, endpoint, dan error boundary
│   ├── store/              # State management global
│   ├── theme/              # Tema Mantine dan style global
│   ├── types/              # TypeScript type dan interface
│   └── utils/              # Helper utility umum
├── test-utils/             # Helper render dan setup testing
├── package.json            # Dependency dan script proyek
├── tsconfig.json           # Konfigurasi TypeScript
├── vite.config.mjs         # Konfigurasi Vite dan Vitest
└── README.md               # Dokumentasi proyek
```

---

## Modul Aplikasi

| Modul            | Deskripsi                                                                                |
| ---------------- | ---------------------------------------------------------------------------------------- |
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

- `src/lib/axios.ts`
- `src/services/endpoint.ts`

Saat ini aplikasi mengarah ke layanan API ProApps berikut:

```text
https://api-jurnal.proapps.id/
https://jurnal-api.proapps.id
```

Catatan penting:

- Gunakan satu sumber konfigurasi base URL bila memungkinkan.
- Hindari hardcode endpoint baru di dalam komponen.
- Simpan deklarasi endpoint di layer service agar mudah dirawat.
- Pastikan token, kredensial, dan data sensitif tidak disimpan di repository.

---

## Standar Kode

Proyek menggunakan beberapa standar utama:

- TypeScript strict mode.
- Import alias berbasis `@/` dan alias domain lain dari `tsconfig.json`.
- Komponen UI reusable di folder `src/components`.
- Modul fitur dipisah dalam folder `src/module`.
- Logic API dipisahkan dari komponen UI melalui layer `services` dan `hooks`.
- Styling menggunakan CSS Module dan stylesheet global terkontrol.
- Format kode dijaga dengan Prettier.
- Kualitas kode dijaga dengan ESLint dan Stylelint.

Contoh alias import:

```ts
import { Button } from '@/components';
import { axiosInstance } from '@/lib/axios';
import { routes } from '@/router/routes';
```

---

## Testing dan Quality Gate

Sebelum membuka pull request atau melakukan merge, jalankan:

```bash
yarn test
```

Perintah ini menjalankan rangkaian validasi:

1. TypeScript typecheck.
2. Prettier check.
3. ESLint dan Stylelint.
4. Unit test dengan Vitest.
5. Build produksi.

Untuk validasi bertahap saat pengembangan:

```bash
yarn typecheck
yarn lint
yarn vitest
```

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

Pastikan build berhasil sebelum deployment ke environment perusahaan.

---

## Panduan Kontribusi

Gunakan alur kerja berikut untuk kontribusi internal:

1. Buat branch dari branch utama pengembangan.
2. Gunakan nama branch yang jelas, misalnya `feature/nama-fitur` atau `fix/nama-bug`.
3. Install dependency dengan `yarn install`.
4. Jalankan aplikasi dengan `yarn dev`.
5. Lakukan perubahan sesuai scope task.
6. Jalankan `yarn test` sebelum membuat pull request.
7. Buat pull request dengan deskripsi perubahan, bukti testing, dan catatan risiko bila ada.
8. Tunggu review dan selesaikan komentar reviewer sebelum merge.

---

## Catatan Pengembangan

- Proyek saat ini menggunakan Mantine v8.
- Prioritas stabilitas dan konsistensi UI lebih diutamakan daripada upgrade mayor framework.

---

## Design Guardrail untuk AI Agent

Tujuan section ini: memastikan semua output AI tetap konsisten dengan design system proyek dan tidak keluar konteks.

### Sumber kebenaran (source of truth)

Wajib rujuk urutan berikut:

1. Figma tokens resmi proyek:
   - Color: https://www.figma.com/design/I3tHoLYN005e1bUjQWlkAL/Jurnal-Figma-Fix?node-id=2-493&m=dev
   - Text Style: https://www.figma.com/design/I3tHoLYN005e1bUjQWlkAL/Jurnal-Figma-Fix?node-id=2-4400&m=dev
   - Spacing: https://www.figma.com/design/I3tHoLYN005e1bUjQWlkAL/Jurnal-Figma-Fix?node-id=2-5511&m=dev
   - Radius: https://www.figma.com/design/I3tHoLYN005e1bUjQWlkAL/Jurnal-Figma-Fix?node-id=2-6791&m=dev
2. Theme lokal repo:
   - [src/theme.ts](src/theme.ts)
   - [src/theme/index.ts](src/theme/index.ts)
   - [src/theme/constants.ts](src/theme/constants.ts)
   - [src/theme/globalStyles.css](src/theme/globalStyles.css)
3. Komponen reusable existing di `src/components`.

### Aturan wajib implementasi AI

- Wajib gunakan Mantine v8. Dilarang API/pola Mantine v9.
- Wajib pakai token dari theme. Hindari hardcode hex, spacing px, radius px kalau token sudah ada.
- Wajib pakai `themeColors`, `spacing`, `radius`, `fontSizes`, `headings` dari konfigurasi theme.
- Wajib konsisten typography `Figtree` sesuai theme.
- Wajib konsisten icon style untuk area app shell: Phosphor `weight="duotone"`.
- Wajib gunakan CSS Modules atau classNames API Mantine sesuai pola proyek.
- Wajib sediakan state `loading`, `empty`, `error` untuk komponen berbasis data.
- Wajib reuse komponen existing sebelum membuat komponen baru.

### Checklist review sebelum merge

- [ ] Tidak ada literal style yang melanggar token design system.
- [ ] Tidak ada penggunaan API Mantine v9.
- [ ] Header/sidebar mengikuti pola AppShell terbaru (desktop collapse = icon rail).
- [ ] Typecheck, lint, test minimum untuk area yang berubah sudah dijalankan.
- [ ] Visual hasil implementasi sesuai referensi Figma node terkait.

### Fallback saat akses Figma MCP gagal

Jika AI tidak bisa menarik context Figma secara otomatis (mis. unauthorized), AI tetap harus:

1. Menggunakan URL Figma di atas sebagai referensi manual.
2. Mengutamakan token dari file theme lokal sebagai sumber implementasi.
3. Menolak membuat style baru yang bertentangan dengan token eksisting kecuali diminta eksplisit.

---

## Status Proyek

Proyek ini berada pada branch pengembangan `mantine-v8` dan menggunakan Mantine versi 8 sebagai standar UI terbaru.

---

<p align="center">
  <strong>Jurnal ProApps</strong><br />
  Frontend akuntansi modern untuk operasional bisnis yang terstruktur, aman, dan mudah dikembangkan.
</p>
