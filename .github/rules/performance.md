# Rule: Performance

Optimasi performa di `jurnal-fe`.

## React Performance

### Memoization

```typescript
// ✅ Benar - memo untuk komponen berat
export const HeavyList = memo(({ items }: Props) => {
  return items.map(item => <Item key={item.id} {...item} />);
});

// ✅ Benar - useMemo untuk komputasi berat
const sortedItems = useMemo(() => {
  return [...items].sort((a, b) => a.name.localeCompare(b.name));
}, [items]);

// ✅ Benar - useCallback untuk handler di dependency
const handleClick = useCallback((id: string) => {
  setSelected(id);
}, []);
```

### List Rendering

```typescript
// ✅ Benar - key stabil
{items.map(item => <Item key={item.id} {...item} />)}

// ❌ Salah - key tidak stabil
{items.map((item, index) => <Item key={index} {...item} />)}
```

## TanStack Query

### Stale Time

```typescript
// Data yang jarang berubah
useQuery({
  queryKey: ['settings'],
  queryFn: getSettings,
  staleTime: 10 * 60 * 1000, // 10 menit
});
```

### Enabled

```typescript
// Query kondisional
useQuery({
  queryKey: ['user', id],
  queryFn: () => getUser(id),
  enabled: !!id, // hanya fetch jika id ada
});
```

### Parallel Queries

```typescript
// ✅ Benar - parallel
const [users, roles] = useQueries({
  queries: [
    { queryKey: ['users'], queryFn: getUsers },
    { queryKey: ['roles'], queryFn: getRoles },
  ],
});
```

## Bundle Size

- Lazy load halaman besar.
- Tree-shake imports.

```typescript
// ✅ Benar - lazy load
const Dashboard = lazy(() => import('./Dashboard'));

// ✅ Benar - named import untuk tree-shaking
import { Button, TextInput } from '@mantine/core';
```

## Larangan

- Jangan memo semua komponen - hanya yang perlu.
- Jangan fetch data di `useEffect` tanpa cancel/pending state.
- Jangan import seluruh library jika hanya butuh sebagian.
