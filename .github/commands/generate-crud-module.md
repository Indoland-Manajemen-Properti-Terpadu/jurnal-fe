# Command: Generate CRUD Module

Scaffold modul CRUD baru di `src/module/`.

## Langkah

1. Konfirmasi dengan user:
   - Nama modul (PascalCase).
   - Endpoint API.
   - Field utama.

2. Buat struktur folder:

   ```
   src/module/[ModuleName]/
   ├── components/
   ├── hooks/
   ├── services/
   ├── store/
   ├── types/
   └── index.ts
   ```

3. Generate file:
   - `types/[ModuleName].types.ts`
   - `services/[moduleName].service.ts`
   - `hooks/use[ModuleName].ts`
   - `pages/[ModuleName]Page.tsx`
   - `pages/Add[ModuleName].tsx` (opsional)
   - `pages/Edit[ModuleName].tsx` (opsional)

4. Tambah route di `src/router/index.tsx`.

5. Validasi:
   ```bash
   yarn typecheck
   yarn lint
   ```

## Template Service

```typescript
import { get, post, put, del } from '@/services/apiClient';
import { ENDPOINTS } from '@/services/endpoint';

export const get[ModuleName]List = async (params?: [ModuleName]Params) => {
  const { data } = await get(ENDPOINTS.[moduleName].list, { params });
  return data;
};
```

## Template Hook

```typescript
import { useQuery } from '@tanstack/react-query';
import { get[ModuleName]List } from '../services/[moduleName].service';

export const use[ModuleName] = (params?: [ModuleName]Params) => {
  return useQuery({
    queryKey: ['[moduleName]', params],
    queryFn: () => get[ModuleName]List(params),
  });
};
```

## Output

- Struktur folder lengkap.
- File siap pakai.
- Route terdaftar.
