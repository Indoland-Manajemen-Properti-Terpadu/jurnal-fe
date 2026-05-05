# 🎯 Quick Start Guide - New Import System

## ✅ **What's Been Implemented**

### **1. Path Aliases (tsconfig.json)**

```json
{
  "@components": "./src/components",
  "@hooks": "./src/hooks",
  "@services": "./src/services",
  "@store": "./src/store",
  "@types": "./src/types",
  "@utils": "./src/utils",
  "@router": "./src/router",
  "@theme": "./src/theme",
  "@features": "./src/module"
}
```

### **2. Barrel Exports Created**

- ✅ `/src/components/index.ts` - (needs update with full exports)
- ✅ `/src/utils/index.ts` - All utility functions
- ✅ `/src/store/index.ts` - All Zustand stores
- ✅ `/src/services/index.ts` - API client & endpoints
- ✅ `/src/hooks/index.ts` - Custom hooks
- ✅ `/src/module/GeneralJournal/JournalAccount/service/index.ts` - Journal APIs

---

## 🚀 **How to Use - New Import Pattern**

### **Before (Old Way):**

```typescript
// ❌ Deep relative imports - hard to maintain
import { PageHeader } from '@/components';
import { routes } from '@/router';
import { gradientColors, themeColors } from '@/theme';
import useAccountStore from '@/store/useAccountLedger';
import { GetJournalAccounts } from '../../JournalAccount/service/AccountJournal.service';
import { useDeleteJurnalAccount } from '../../JournalAccount/service/DeleteTransaction.service';
import { GetDraftAccount } from '../../BeginningBalance/service/SetDraftBalance.service';
```

### **After (New Way):**

```typescript
// ✅ Clean, predictable imports
import { PageHeader } from '@components';
import { routes } from '@router';
import { themeColors } from '@theme';
import { useAccountStore } from '@store';
import { formatCurrency, dateFormatV1 } from '@utils';

// Feature imports (still using @features alias)
import {
  GetJournalAccounts,
  useDeleteJurnalAccount,
} from '@features/GeneralJournal/JournalAccount/service';
```

---

## 📋 **Import Cheat Sheet**

### **Shared Components**

```typescript
import { PageHeader, NotFound, Loading, EmptyTable, ConfirmModal } from '@components';
```

### **Utilities**

```typescript
import { formatCurrency, FormatDate, dateFormatV1, Capitalize } from '@utils';
```

### **Stores**

```typescript
import { useAccountStore, useAuthStore, useJournalAccountStore, useFileStore } from '@store';
```

### **Services**

```typescript
import { get, post, del, API_ACCOUNT, API_AUTH } from '@services';
```

### **Hooks**

```typescript
import { useFetchData, useFetchRoles } from '@hooks';
```

### **Router**

```typescript
import { routes, navigate } from '@router';
```

### **Theme**

```typescript
import { themeColors, gradientColors } from '@theme';
import { iconSizes, spacing } from '@theme/constants';
```

---

## 🎓 **Examples**

### **Example 1: Component with Clean Imports**

```typescript
// features/general-journal/pages/AccountPage.tsx
import { Button, Stack } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';
import { PageHeader, EmptyTable } from '@components';
import { formatCurrency } from '@utils';
import { useAccountStore } from '@store';
import { themeColors } from '@theme';
import { routes } from '@router';
import { GetJournalAccounts } from '../api'; // relative for same feature

function AccountPage() {
  const { accounts } = GetJournalAccounts();
  const { selectedRecords } = useAccountStore();

  return (
    <PageHeader title="Accounts">
      {/* Component logic */}
    </PageHeader>
  );
}
```

### **Example 2: API Hook**

```typescript
// features/general-journal/api/account.api.ts
import { useQuery, useMutation } from '@tanstack/react-query';
import { get, post, API_ACCOUNT } from '@services';
import { Account } from '../types';

export const useGetAccounts = () => {
  return useQuery({
    queryKey: ['accounts'],
    queryFn: () => get(API_ACCOUNT.GET_ALL_ACCOUNT),
  });
};
```

### **Example 3: Form Component**

```typescript
// features/general-journal/components/AccountForm.tsx
import { TextInput, Button } from '@mantine/core';
import { useForm } from '@mantine/form';
import { formatCurrency, Capitalize } from '@utils';
import { themeColors } from '@theme';

function AccountForm() {
  const form = useForm({
    initialValues: { name: '', amount: 0 }
  });

  return (
    <form>
      <TextInput
        label="Account Name"
        {...form.getInputProps('name')}
      />
    </form>
  );
}
```

---

## ⚡ **Quick Migration Tips**

### **1. Find & Replace Patterns**

**Replace relative imports:**

```bash
# Find
from '@/store/useAccountLedger'

# Replace with
from '@store'
```

**Replace component imports:**

```bash
# Find
from '@/components/PageHeader/page'

# Replace with
from '@components'
```

**Replace utility imports:**

```bash
# Find
from '@/utils/FormatCurrency'

# Replace with
from '@utils'
```

### **2. IDE Autocomplete**

After typing `from '@`, your IDE will show:

- `@components`
- `@hooks`
- `@services`
- `@store`
- `@utils`
- `@theme`
- `@router`
- `@features`

---

## 🎯 **Benefits You Get**

1. **✅ No More `../../../`** - Clean, absolute imports
2. **✅ Faster Development** - IDE autocomplete works better
3. **✅ Easier Refactoring** - Move files without breaking imports
4. **✅ Better Tree-Shaking** - Bundler can optimize better
5. **✅ Consistent Patterns** - Team follows same conventions
6. **✅ Easier Onboarding** - New devs understand structure quickly

---

## 📝 **Next Steps**

1. **Start using new imports** in new files
2. **Gradually migrate** old files when you edit them
3. **Update barrel exports** as you add new components/utils
4. **Share with team** - Everyone uses same pattern

---

## 💡 **Pro Tips**

### **Barrel Export Best Practice:**

```typescript
// ✅ GOOD - Named exports
export { MyComponent } from './MyComponent';

// ❌ AVOID - Default exports in barrel files
export { default as MyComponent } from './MyComponent';
```

### **Keep Feature Imports Relative:**

```typescript
// ✅ GOOD - Within same feature
import { AccountTable } from '../components/AccountTable';

// ❌ AVOID - Cross-feature with @features
import { AccountTable } from '@features/general-journal/components';
```

### **Use Type-Only Imports:**

```typescript
import type { Account } from '@types';
import { formatCurrency } from '@utils';
```

---

**Happy Coding! 🚀**

Your imports are now cleaner, more maintainable, and professional!
