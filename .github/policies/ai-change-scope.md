# Policy: AI Change Scope

## Prinsip

AI agent hanya boleh mengubah scope yang diminta user.

## Allowed

- File yang relevan langsung dengan task.
- Refactor minor pendukung fix utama.
- Penambahan test terkait perubahan.

## Restricted

- Ubah arsitektur besar tanpa approval.
- Ubah dependency mayor tanpa approval.
- Ubah CI/CD tanpa approval.
- Ubah auth/security behavior tanpa approval.

## Wajib

- Jelaskan dampak lintas modul jika ada.
- Minta konfirmasi sebelum perubahan high-risk.
