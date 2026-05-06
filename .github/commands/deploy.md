# Command: Deploy

Persiapkan dan validasi deployment untuk `jurnal-fe`.

## Prasyarat

- Branch sudah up-to-date dengan `main-frontend`.
- Semua PR review selesai.
- Tidak ada conflict.

## Langkah

1. Jalankan validasi:

   ```bash
   yarn typecheck && yarn lint && yarn build
   ```

2. Verifikasi environment variables:
   - `VITE_API_BASE_URL`
   - `VITE_APP_ENV`

3. Jalankan smoke test minimal:
   - Login berhasil.
   - Dashboard termuat.
   - Satu flow jurnal berhasil.

4. Buat deployment summary:
   - Modul yang berubah.
   - Risiko tinggi.
   - Rollback plan.

5. Konfirmasi dengan user sebelum execute deployment.

## Output

- Status readiness (ready/blocked).
- Checklist hasil.
- Catatan risiko.
- Rollback instruction.
