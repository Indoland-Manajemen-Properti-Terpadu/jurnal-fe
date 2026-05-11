# Rule: State Management

Standar state management di `jurnal-fe`.

## Pembagian

| State Type     | Solution          |
| -------------- | ----------------- |
| Server state   | TanStack Query v5 |
| Client state   | Zustand           |
| Local UI state | React useState    |

## Server State (TanStack Query)

### Query

```typescript
export const useUserList = (params?: UserParams) => {
  return useQuery({
    queryKey: ['users', params],
    queryFn: () => getUserList(params),
    staleTime: 5 * 60 * 1000, // 5 menit
  });
};
```

### Mutation

```typescript
export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};
```

### Query Key Convention

```typescript
// List dengan params
['users', params][
  // Detail dengan ID
  ('user', id)
][
  // Nested resource
  ('users', id, 'posts')
];
```

## Client State (Zustand)

Lokasi: `src/store/`

```typescript
// store/useAuthStore.ts
interface AuthState {
  user: User | null;
  setUser: (user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  logout: () => set({ user: null }),
}));
```

## Local State

```typescript
// UI state yang tidak perlu share
const [isOpen, setIsOpen] = useState(false);
const [selectedId, setSelectedId] = useState<string | null>(null);
```

## Larangan

- Jangan simpan server state di Zustand jika sudah di TanStack Query.
- Jangan duplikasi state di multiple store.
- Jangan lupa invalidate query setelah mutation.
- Jangan gunakan `useEffect` untuk fetch data, gunakan TanStack Query.
