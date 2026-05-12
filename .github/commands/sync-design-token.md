# Command: Sync Design Token

Sinkronkan design token dari Figma ke `src/theme/`.

## Langkah

1. Akses Figma Design System:
   - Color: https://www.figma.com/design/I3tHoLYN005e1bUjQWlkAL/Design-System-Lite?node-id=2-493
   - Text style: https://www.figma.com/design/I3tHoLYN005e1bUjQWlkAL/Design-System-Lite?node-id=2-4400
   - Spacing: https://www.figma.com/design/I3tHoLYN005e1bUjQWlkAL/Design-System-Lite?node-id=2-5511
   - Radius: https://www.figma.com/design/I3tHoLYN005e1bUjQWlkAL/Design-System-Lite?node-id=2-6791

2. Ekstrak token:
   - Color palette.
   - Typography scale.
   - Spacing scale.
   - Radius scale.

3. Update file:
   - `src/theme/constants.ts`
   - `src/theme/globalStyles.css`

4. Validasi tidak ada breaking change pada komponen existing.

5. Jalankan visual check:
   - Dashboard.
   - Form utama.
   - Table.

## Output

- Daftar token berubah.
- File diupdate.
- Catatan breaking change jika ada.
