# Command: Refactor Module

Refactor modul besar di `src/module/`.

## Langkah

1. Audit modul:
   - Struktur folder.
   - File size (>300 lines flag).
   - Duplikasi logic.
   - Dead code.

2. Identifikasi masalah:
   - Service campur hook.
   - Komponen terlalu besar.
   - Type tidak konsisten.
   - Import tidak sesuai standar.

3. Rencana refactor:
   - Daftar file yang akan diubah.
   - Urutan perubahan.
   - Risiko dan mitigrasi.

4. Konfirmasi user sebelum eksekusi.

5. Eksekusi bertahap:
   - Satu file/group per tahap.
   - Validasi setiap tahap.

6. Validasi final:
   ```bash
   yarn typecheck
   yarn lint
   yarn build
   yarn vitest --run
   ```

## Output

- Ringkasan perubahan.
- File yang dihapus/dibuat/diubah.
- Catatan testing.
- Risiko residual.
