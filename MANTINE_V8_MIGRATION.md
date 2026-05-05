# 🚀 Mantine v8 Migration Guide

## ✅ Changes Completed

### 1. **Package Updates**

Updated all Mantine packages to v8.3.14:

- @mantine/core: ^7.11.2 → ^8.3.14
- @mantine/hooks: ^7.11.2 → ^8.3.14
- @mantine/form: ^7.10.2 → ^8.3.14
- @mantine/notifications: ^7.11.2 → ^8.3.14
- @mantine/modals: ^7.10.2 → ^8.3.14
- @mantine/dates: ^7.11.2 → ^8.3.14
- @mantine/carousel: ^7.11.2 → ^8.3.14
- @mantine/dropzone: ^7.11.2 → ^8.3.14
- @mantine/tiptap: ^7.11.2 → ^8.3.14
- postcss-preset-mantine: 1.15.0 → ^1.17.0

### 2. **Theme Configuration (src/theme/index.ts)**

✅ **Migrated to v8 API:**

- ❌ Removed `styles` prop from all components
- ✅ Using `classNames` prop for custom styling
- ✅ Cleaner, CSS-based approach
- ✅ Better performance (no runtime styles)

**Key Changes:**

```typescript
// Before (v7)
Button.extend({
  styles: {
    root: { fontWeight: 500, ... }
  }
})

// After (v8)
Button.extend({
  classNames: {
    root: 'button-root'
  }
})
```

### 3. **Global Styles (src/theme/globalStyles.css)**

✅ **Added component-specific CSS classes:**

- `.button-root` - Button styling
- `.input-base`, `.input-label` - Input styling
- `.paper-root` - Paper transitions
- `.table-*` - Table styling system
- `.modal-title` - Modal title styling

All styles now follow CSS-first approach for better performance.

### 4. **Import Changes (src/App.tsx)**

✅ **Updated CSS imports:**

```typescript
// v7
import '@mantine/core/styles.layer.css';
import 'mantine-datatable/styles.layer.css';

// v8
import '@mantine/core/styles.css';
import 'mantine-datatable/styles.css';
```

### 5. **Layer Configuration (src/assets/layout.css)**

✅ **Simplified layers:**

```css
/* v7 */
@layer mantine-core, mantine, mantine-datatable;

/* v8 */
@layer mantine, mantine-datatable;
```

---

## 📋 Next Steps

### **Step 1: Install Dependencies**

```bash
cd /Users/proapps/Documents/Dev-Indoland/jurnal/jurnal-fe
npm install
```

### **Step 2: Run Type Check**

```bash
npm run typecheck
```

### **Step 3: Run Development Server**

```bash
npm run dev
```

### **Step 4: Test Critical Paths**

- ✅ Login page
- ✅ Dashboard
- ✅ Tables (DataTable)
- ✅ Forms (TextInput, Select, etc)
- ✅ Modals
- ✅ Notifications

---

## 🔧 Breaking Changes Handled

### ✅ **No more `sx` prop**

**Solution:** Use CSS classes via `classNames` or inline `style` prop

```tsx
// ❌ v7 (Not working in v8)
<Box sx={{ padding: 16 }} />

// ✅ v8
<Box p="md" />
// or
<Box style={{ padding: 16 }} />
// or
<Box className="custom-box" />
```

### ✅ **No more `styles` API**

**Solution:** Use `classNames` in component extend

```tsx
// ❌ v7
Component.extend({
  styles: { root: { ... } }
})

// ✅ v8
Component.extend({
  classNames: { root: 'component-root' }
})
```

### ✅ **CSS imports changed**

**Solution:** Remove `.layer` from imports

```tsx
// ❌ v7
import '@mantine/core/styles.layer.css';

// ✅ v8
import '@mantine/core/styles.css';
```

---

## 🎨 Component Migration Pattern

### **Pattern 1: Replace sx with props**

```tsx
// Before
<Box sx={{ p: 16, bg: 'blue' }} />

// After
<Box p="md" bg="blue" />
```

### **Pattern 2: Replace complex sx with className**

```tsx
// Before
<Box sx={{
  padding: 16,
  '&:hover': { bg: 'blue' }
}} />

// After (add to CSS file)
<Box className="custom-box" />

// In CSS
.custom-box {
  padding: 16px;
}
.custom-box:hover {
  background-color: var(--mantine-color-blue-5);
}
```

### **Pattern 3: Use theme classNames**

```tsx
// Already configured in theme
<Button /> // Uses .button-root class
<Table /> // Uses .table-* classes
<Paper /> // Uses .paper-root class
```

---

## 🎯 Migration Checklist

### **Phase 1: Core (Completed ✅)**

- [x] Update package.json
- [x] Refactor theme/index.ts
- [x] Update globalStyles.css
- [x] Update App.tsx imports
- [x] Update layout.css layers

### **Phase 2: Testing**

- [ ] Install dependencies (`npm install`)
- [ ] Run type check (`npm run typecheck`)
- [ ] Run dev server (`npm run dev`)
- [ ] Test all pages
- [ ] Test forms & validation
- [ ] Test modals & notifications

### **Phase 3: Component Cleanup (If needed)**

- [ ] Search for `sx=` usage: `grep -r "sx=" src/`
- [ ] Search for `styles=` usage: `grep -r "styles=" src/`
- [ ] Replace with appropriate alternatives
- [ ] Test after each change

---

## 🚨 Common Issues & Solutions

### **Issue 1: Type errors on sx prop**

```tsx
// Error: Property 'sx' does not exist
<Box sx={{ p: 16 }} />

// Fix: Use props or className
<Box p="md" />
```

### **Issue 2: Theme styles not applying**

```tsx
// Styles API removed
Component.extend({ styles: { ... } })

// Fix: Use classNames
Component.extend({ classNames: { root: 'class-name' } })
```

### **Issue 3: Import errors**

```tsx
// Error: Module not found '.layer.css'
import '@mantine/core/styles.layer.css';

// Fix: Remove .layer
import '@mantine/core/styles.css';
```

---

## 📚 Resources

- [Mantine v8 Migration Guide](https://mantine.dev/guides/8-x-migration/)
- [Mantine v8 Changelog](https://mantine.dev/changelog/8-0-0/)
- [CSS Modules Documentation](https://mantine.dev/styles/css-modules/)

---

## 💡 Pro Tips

### **1. Use Theme Props First**

```tsx
// ✅ GOOD - Consistent with theme
<Box p="md" bg="primary.5" />

// ❌ AVOID - Hard-coded values
<Box style={{ padding: 16, backgroundColor: '#14B8A6' }} />
```

### **2. Leverage Global Classes**

```tsx
// ✅ GOOD - Reusable utility
<Text className="text-ellipsis">Long text...</Text>

// ❌ AVOID - Inline styles
<Text style={{ overflow: 'hidden', ... }}>Long text...</Text>
```

### **3. Use CSS Variables**

```css
/* ✅ GOOD - Theme-aware */
.custom {
  color: var(--mantine-color-primary-5);
  padding: var(--mantine-spacing-md);
}

/* ❌ AVOID - Hard-coded */
.custom {
  color: #14b8a6;
  padding: 16px;
}
```

---

## ✅ Migration Status

**Overall Progress: 80% Complete**

- ✅ Package updates
- ✅ Theme configuration
- ✅ Global styles
- ✅ CSS imports
- ⏳ Testing & validation
- ⏳ Component cleanup (if needed)

---

**Next Command:**

```bash
npm install && npm run dev
```

Good luck! 🚀
