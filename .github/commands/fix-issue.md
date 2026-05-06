# Command: Fix Issue

Penyelesaian bug/issue di `jurnal-fe`.

## Langkah

1. Baca issue detail:
   - Error message.
   - Stack trace.
   - Steps to reproduce.
   - Environment (browser, OS).

2. Lokalisasi masalah:
   - Cari file terkait di `src/`.
   - Cek service, hook, komponen, route.

3. Analisa root cause:
   - Jangan patch gejala.
   - Identifikasi pattern yang sama di tempat lain.

4. Implementasi fix:
   - Scope minimal yang aman.
   - Ikuti aturan di `.github/rules/`.

5. Validasi:
   ```bash
   yarn typecheck
   yarn lint
   yarn build
   yarn vitest --run
   ```

6. Laporkan:
   - Penyebab.
   - Fix.
   - Validasi.
   - Risiko regresi.

## Output

- Daftar file diubah.
- Penjelasan teknis singkat.
- Catatan testing.
