---
description: 'Use when implementing or refactoring UI in jurnal-fe (layout, page, component, styling, theme, sidebar, header, docs prompt). Enforces Mantine v8 + Figma/local-token consistency and anti-hardcode rules.'
name: 'Jurnal FE UI Guardrail'
applyTo:
  - 'src/**/*.ts'
  - 'src/**/*.tsx'
  - 'src/**/*.css'
  - 'README.md'
  - 'AI_PROMPT_MANTINE_MCP_TEMPLATE.md'
---

# Jurnal FE UI Guardrail

## Stack and version boundaries

- Gunakan Mantine v8 API/pattern.
- Jangan migrasi ke Mantine v9 kecuali user minta eksplisit.
- Reuse komponen existing dulu sebelum buat komponen baru.

## Source of truth design (urutan wajib)

1. Figma links:
   - Color: https://www.figma.com/design/I3tHoLYN005e1bUjQWlkAL/Design-System-Lite?node-id=2-493&t=VlhW06rxWSQiJUDQ-4
   - Text style: https://www.figma.com/design/I3tHoLYN005e1bUjQWlkAL/Design-System-Lite?node-id=2-4400&t=VlhW06rxWSQiJUDQ-4
   - Spacing: https://www.figma.com/design/I3tHoLYN005e1bUjQWlkAL/Design-System-Lite?node-id=2-5511&t=VlhW06rxWSQiJUDQ-4
   - Radius: https://www.figma.com/design/I3tHoLYN005e1bUjQWlkAL/Design-System-Lite?node-id=2-6791&t=VlhW06rxWSQiJUDQ-4
2. Local theme files:
   - src/theme.ts
   - src/theme/index.ts
   - src/theme/constants.ts
   - src/theme/globalStyles.css
3. Existing reusable components in src/components/\*\*

## Styling rules

- Jangan hardcode color/spacing/radius/typography kalau token/theme sudah ada.
- Tambah token di source theme bila butuh nilai baru; jangan sebar inline magic value.
- Prioritaskan props theme/system Mantine dibanding inline style panjang.

## App shell rules

- Desktop collapse sidebar = icon rail (bukan hide total).
- Ikuti pola width collapse yang sudah dipakai lintas layout modul.
- Ikon header/sidebar gunakan @phosphor-icons/react dengan `weight="duotone"`.

## Quality and UX rules

- Semua perubahan UI wajib aman state loading, empty, error.
- Jaga konsistensi spacing, radius, dan hierarchy text antar halaman.
- Untuk perubahan besar lintas layout, patch semua modul terkait agar perilaku seragam.

## Figma MCP fallback

- Jika Figma MCP gagal/unauthorized, tetap lanjut pakai Figma URL di atas + local theme sebagai acuan final.
- Jangan blokir delivery hanya karena MCP tidak bisa fetch context.
