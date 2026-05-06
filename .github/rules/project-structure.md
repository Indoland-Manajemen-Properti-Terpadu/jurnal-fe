# Rule: Project Structure

Struktur folder dan file di `jurnal-fe`.

## Root Structure

```
src/
├── App.tsx
├── main.tsx
├── theme.ts
├── assets/
│   ├── fonts/
│   └── img/
├── components/      # Shared UI components
├── hooks/           # Global hooks
├── lib/             # Third-party config (axios)
├── module/          # Feature modules
├── router/          # Route definitions
├── services/        # API client, endpoints
├── store/           # Zustand stores
├── theme/           # Design tokens, global styles
├── types/           # Global types
└── utils/           # Utility functions
```

## Module Structure

```
src/module/[ModuleName]/
├── components/      # Module-specific components
├── hooks/           # Module-specific hooks
├── services/        # API service functions
├── store/           # Module Zustand store (optional)
├── types/           # Module types
└── index.ts         # Public exports
```

## File Naming

| Type | Pattern | Example |
|------|---------|---------|
| Component | PascalCase | `UserCard.tsx` |
| Hook | camelCase dengan `use` prefix | `useUserList.ts` |
| Service | camelCase dengan `.service` | `user.service.ts` |
| Type | PascalCase | `User.types.ts` |
| Store | camelCase dengan `use` prefix | `useUserStore.ts` |
| Utility | camelCase | `formatDate.ts` |

## Import Order

```typescript
// 1. React
import { useState, useEffect } from 'react';

// 2. Third-party
import { useQuery } from '@tanstack/react-query';
import { Button } from '@mantine/core';

// 3. Internal - alias
import { User } from '@/types';
import { getUserList } from '@/services/user.service';

// 4. Relative
import { UserCard } from './UserCard';
```

## Larangan

- Jangan taruh komponen di `src/components` jika hanya dipakai satu module.
- Jangan buat nested folder lebih dari 3 level tanpa alasan.
- Jangan duplikasi struktur di multiple module dengan pattern berbeda.
