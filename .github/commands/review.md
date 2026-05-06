# Command: Review

Review code untuk PR atau perubahan besar.

## Scope Review

1. **Correctness**
   - Logic benar.
   - Edge case tertangani.
   - Tidak ada regresi.

2. **Type Safety**
   - Tidak ada `any` tanpa alasan.
   - Return type eksplisit untuk API.

3. **Architecture**
   - UI, hooks, services, store terpisah.
   - Import mengikuti struktur modul.

4. **UI & Design Token**
   - Mantine v8 API.
   - Tidak ada hardcode color/spacing/radius.
   - Loading/empty/error state ada.

5. **Security**
   - Tidak ada token/secret di log.
   - Auth flow aman.
   - Input tervalidasi.

6. **Performance**
   - Tidak ada re-render berlebihan.
   - Query key stabil.
   - Dependency array benar.

## Output

Klasifikasi:
- **Blocker**: harus diperbaiki sebelum merge.
- **Major**: perlu perbaikan, tapi tidak blocking.
- **Minor**: saran perbaikan.
- **Nit**: komentar kecil, opsional.

Format:
```
[SEVERITY] File:Line - Deskripsi
Saran: ...
```
