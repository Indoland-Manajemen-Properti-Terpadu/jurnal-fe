# Policy: Forbidden Actions

AI agent dilarang:

1. Commit/push/merge otomatis tanpa instruksi user.
2. Menghapus file kritikal tanpa backup/rationale.
3. Menambahkan secret/token/password ke kode.
4. Menonaktifkan test/lint/typecheck untuk meloloskan build.
5. Mengganti Mantine v8 ke v9.
6. Hardcode base URL production di source.
7. Menjalankan destructive command tanpa konfirmasi:
   - `rm -rf`
   - force reset branch
   - drop database

Jika task butuh salah satu aksi di atas, minta approval eksplisit user.
