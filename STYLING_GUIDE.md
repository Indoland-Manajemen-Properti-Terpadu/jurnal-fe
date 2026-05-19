# 🎨 Theme & Styling Guidelines

## 📁 File yang Ditambahkan

### 1. `/src/theme/index.ts` (Updated)

Konfigurasi theme yang sudah diperkaya dengan:

- ✅ Typography system yang konsisten
- ✅ Spacing & radius standardization
- ✅ Shadow system
- ✅ Global component styles (Button, Input, Table, Modal, Paper)
- ✅ Table styling utilities di `theme.other`

### 2. `/src/theme/globalStyles.css` (New)

Global CSS untuk:

- ✅ Mantine DataTable styling
- ✅ Custom scrollbar
- ✅ Utility classes (text-ellipsis, flex-center, dll)
- ✅ Global animations (fadeIn, slideIn)
- ✅ Print media styles

### 3. `/src/theme/constants.ts` (New)

Reusable constants untuk:

- ✅ Table styles
- ✅ Card styles
- ✅ Icon sizes
- ✅ Spacing values
- ✅ Breakpoints
- ✅ Z-index layers
- ✅ Transition durations

## 🚀 Cara Penggunaan

### 1. Import Constants di Component

```tsx
import { iconSizes, tableStyles, spacing } from '@/theme/constants';
import { themeColors } from '@/theme';

// Gunakan di component
<IconDots {...iconSizes.sm} />
<Box p={spacing.md} />
```

### 2. Table Styling - SEBELUM

```tsx
const rowStyle = {
    borderColor: themeColors.gray[1],
    borderWidth: '1px',
    borderStyle: 'solid',
};

<Table.Tr style={rowStyle}>
```

### 3. Table Styling - SESUDAH

```tsx
// Tidak perlu define style lagi!
<Table highlightOnHover withTableBorder>
  <Table.Tr>{/* Global styles sudah diterapkan */}</Table.Tr>
</Table>
```

### 4. DataTable Styling

```tsx
// Sudah otomatis ter-styling dari globalStyles.css
<DataTable
  records={data}
  columns={columns}
  // Styles sudah konsisten tanpa config tambahan
/>
```

### 5. Menggunakan Utility Classes

```tsx
<Text className="text-ellipsis">Long text will be truncated...</Text>
<Box className="flex-between">Content</Box>
<Paper className="shadow-hover fade-in">Animated card</Paper>
```

## 🎯 Manfaat

### ✅ Konsistensi

- Semua komponen menggunakan spacing, radius, dan shadow yang sama
- Typography konsisten di seluruh aplikasi

### ✅ Maintainability

- Perubahan di theme langsung apply ke semua komponen
- Tidak perlu define inline styles berulang-ulang

### ✅ Developer Experience

- Autocomplete untuk iconSizes, spacing, dll
- Type-safe constants
- Utility classes untuk styling cepat

### ✅ Performance

- CSS Modules + global styles = optimal bundle
- Animations optimized dengan CSS
- No runtime overhead

## 📋 Best Practices

### 1. Gunakan Theme Props

```tsx
// ✅ GOOD - Menggunakan theme props
<Button size="md" radius="md" />

// ❌ AVOID - Inline styles
<Button style={{ borderRadius: 8 }} />
```

### 2. Gunakan Constants

```tsx
// ✅ GOOD
import { iconSizes } from '@/theme/constants';
<IconUser {...iconSizes.md} />

// ❌ AVOID
<IconUser style={{ width: 16, height: 16 }} />
```

### 3. Leverage sx Prop untuk Custom Styles

```tsx
<Box
  sx={(theme) => ({
    backgroundColor: theme.colors.primary[0],
    '&:hover': {
      backgroundColor: theme.colors.primary[1],
    },
  })}
/>
```

### 4. Gunakan Theme Colors

```tsx
// ✅ GOOD
<Text c="primary.5">Colored text</Text>

// ❌ AVOID
<Text style={{ color: '#14B8A6' }}>Colored text</Text>
```

## 🔄 Migration Guide

Untuk me-refactor komponen existing:

1. **Hapus inline styles untuk spacing/colors**

   ```tsx
   // Before
   <Box style={{ padding: '16px' }}>

   // After
   <Box p="md">
   ```

2. **Gunakan Table props, bukan inline styles**

   ```tsx
   // Before
   <Table style={{ borderRadius: 8 }}>

   // After
   <Table highlightOnHover withTableBorder>
   ```

3. **Import dan gunakan constants**

   ```tsx
   // Before
   const ICON_SIZE = { width: rem(14), height: rem(14) };

   // After
   import { iconSizes } from '@/theme/constants';
   <Icon {...iconSizes.sm} />;
   ```

## 🎨 Customization

Jika perlu custom styling untuk kasus spesifik:

```tsx
// Extend theme di theme/index.ts
other: {
  customComponentStyle: {
    // your styles
  }
}

// Akses di component
const { theme } = useMantineTheme();
theme.other.customComponentStyle;
```

## 📱 Responsive Design

Gunakan breakpoints dari constants:

```tsx
import { breakpoints } from '@/theme/constants';
import { useMediaQuery } from '@mantine/hooks';

const isMobile = useMediaQuery(`(max-width: ${breakpoints.sm})`);
```

---

**Catatan:** Lihat `/src/examples/RefactoredTableExample.tsx` untuk contoh lengkap refactoring.
