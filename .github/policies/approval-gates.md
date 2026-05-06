# Policy: Approval Gates

## Perubahan wajib approval user sebelum eksekusi

1. Upgrade dependency mayor.
2. Perubahan auth flow (login/logout/token refresh).
3. Perubahan endpoint production/base URL.
4. Refactor lintas >5 file kritikal.
5. Perubahan workflow CI/CD.
6. Penghapusan komponen/module yang dipakai aktif.
7. Perubahan design token global.

## Format permintaan approval

Sertakan:
- Tujuan perubahan.
- File yang terdampak.
- Risiko potensial.
- Rollback plan singkat.

## Rule
Tanpa approval eksplisit, jangan lanjut untuk scope di atas.
