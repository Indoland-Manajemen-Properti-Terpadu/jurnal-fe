# Template AI Prompt + Mantine Docs + MCP

Dokumen ini berisi template siap pakai untuk prompt AI coding agent pada proyek **jurnal-fe** (Mantine v8), termasuk referensi dokumentasi Mantine dan konfigurasi MCP server.

---

## 1) Standar Konteks (Wajib di Prompt)

Gunakan blok ini di awal prompt agar AI konsisten:

```text
Konteks proyek:
- Framework UI: Mantine v8 (WAJIB pakai API v8, jangan v9)
- Frontend: React + TypeScript + Vite
- State server: TanStack React Query
- State global: Zustand
- Styling: Mantine theme + CSS Modules + globalStyles.css

Source of truth design (WAJIB):
- Color: https://www.figma.com/design/I3tHoLYN005e1bUjQWlkAL/Jurnal-Figma-Fix?node-id=2-493&m=dev
- Text style: https://www.figma.com/design/I3tHoLYN005e1bUjQWlkAL/Jurnal-Figma-Fix?node-id=2-4400&m=dev
- Spacing: https://www.figma.com/design/I3tHoLYN005e1bUjQWlkAL/Jurnal-Figma-Fix?node-id=2-5511&m=dev
- Radius: https://www.figma.com/design/I3tHoLYN005e1bUjQWlkAL/Jurnal-Figma-Fix?node-id=2-6791&m=dev
- Local theme files: src/theme.ts, src/theme/index.ts, src/theme/constants.ts, src/theme/globalStyles.css

Aturan penting:
- Jangan ubah versi Mantine.
- Ikuti pola existing di src/theme/index.ts dan src/theme/globalStyles.css.
- Reuse komponen dari src/components bila memungkinkan.
- Ikuti alias import tsconfig (contoh: @/components, @/theme, @/utils).
- Tambahkan loading, empty, error state untuk data fetching.
- Jangan hardcode warna/spacing/radius/typography jika token sudah tersedia.
- Untuk icon app shell, gunakan Phosphor `weight="duotone"`.
```

---

## 2) Referensi Dokumentasi Mantine (LLMs)

### Referensi cepat

```text
https://mantine.dev/llms.txt
```

### Referensi lengkap (opsional, lokal)

```bash
curl -o mantine-docs.txt https://mantine.dev/llms-full.txt
```

### Kalimat referensi yang ditempel ke prompt

```text
Gunakan referensi resmi Mantine:
- https://mantine.dev/llms.txt
Jika butuh detail API, gunakan dokumentasi lengkap lokal `mantine-docs.txt`.
```

---

## 3) Template Prompt Umum (Siap Copy)

```text
Tugas:
[ISI TUJUAN FITUR/FIX]

Konteks proyek:
- Mantine v8 (strict, jangan v9)
- React + TypeScript + Vite
- React Query + Zustand

Source of truth design:
- Color: https://www.figma.com/design/I3tHoLYN005e1bUjQWlkAL/Jurnal-Figma-Fix?node-id=2-493&m=dev
- Text style: https://www.figma.com/design/I3tHoLYN005e1bUjQWlkAL/Jurnal-Figma-Fix?node-id=2-4400&m=dev
- Spacing: https://www.figma.com/design/I3tHoLYN005e1bUjQWlkAL/Jurnal-Figma-Fix?node-id=2-5511&m=dev
- Radius: https://www.figma.com/design/I3tHoLYN005e1bUjQWlkAL/Jurnal-Figma-Fix?node-id=2-6791&m=dev
- Local tokens: src/theme.ts, src/theme/index.ts, src/theme/constants.ts, src/theme/globalStyles.css

Referensi:
- Mantine docs: https://mantine.dev/llms.txt
- Jika perlu detail: mantine-docs.txt

Instruksi implementasi:
1) Analisa struktur modul terkait dulu.
2) Gunakan komponen Mantine yang sesuai best practice v8.
3) Ikuti theme existing (warna, radius, spacing, typography).
4) Jika form, gunakan validasi yang jelas dan type-safe.
5) Jika data API, handle loading/empty/error.
6) Jangan breaking existing route/store.
7) Beri ringkasan perubahan + risiko.
8) Hindari hardcode style jika token/theme sudah tersedia.

Output yang saya mau:
- Daftar file yang diubah
- Alasan teknis singkat
- Catatan testing yang perlu dijalankan
```

---

## 4) Template Prompt Khusus Form (Mantine Form)

```text
Bangun form [NAMA FORM] dengan Mantine v8.
Gunakan pendekatan type-safe dan validasi field lengkap.

Wajib:
- Struktur field terorganisir
- Validasi per field + pesan error jelas
- Support nested field jika diperlukan
- State submit/loading
- Error handling dari API
- UI konsisten dengan theme proyek

Referensi:
- https://mantine.dev/llms.txt
```

---

## 5) Template Prompt Khusus Komponen Kustom

```text
Buat komponen reusable [NAMA KOMPONEN] berbasis Mantine v8.

Kriteria:
- API props jelas dan typed
- Accessible (keyboard/focus/aria seperlunya)
- Mendukung variant/size jika relevan
- Tidak hardcode style yang bertentangan theme
- Mudah dipakai ulang lintas modul

Referensi:
- https://mantine.dev/llms.txt
```

---

## 6) MCP Server Mantine

Tambahkan ke konfigurasi MCP client:

```json
{
  "mcpServers": {
    "mantine": {
      "command": "npx",
      "args": ["-y", "@mantine/mcp-server"]
    }
  }
}
```

Tools yang tersedia:

- `list_items`
- `get_item_doc`
- `get_item_props`
- `search_docs`

### Kapan pakai MCP tool

- `search_docs`: cari pola penggunaan komponen cepat.
- `get_item_props`: validasi props agar tidak salah API.
- `get_item_doc`: baca detail behavior komponen.
- `list_items`: lihat daftar komponen yang tersedia.

---

## 7) Template Prompt dengan MCP (Siap Copy)

```text
Gunakan Mantine v8 dan manfaatkan MCP Mantine tools.

Langkah kerja:
1) Cari komponen paling tepat via `search_docs`.
2) Validasi props via `get_item_props`.
3) Implementasi sesuai pattern proyek.
4) Hindari API non-v8.

Tujuan:
[ISI TUJUAN FITUR]

Keluaran:
- Implementasi final
- Alasan pemilihan komponen
- Catatan props kritis dari MCP
```

---

## 8) Guardrail untuk Tim (Disarankan)

Gunakan checklist ini sebelum merge:

- [ ] Tidak ada import/pola API Mantine v9.
- [ ] Komponen sesuai theme global.
- [ ] Typecheck, lint, dan test lolos.
- [ ] Empty/loading/error state tersedia.
- [ ] Tidak ada hardcode endpoint/credential.

---

## 9) Catatan Versi

Status proyek saat ini: **tetap di Mantine v8**.

Keputusan: upgrade v9 ditunda sampai ada kebutuhan bisnis/teknis kuat dan slot QA regresi memadai.
