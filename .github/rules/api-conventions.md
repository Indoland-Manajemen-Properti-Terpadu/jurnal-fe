# Rule: API Conventions

Standar penulisan API service dan hooks di `jurnal-fe`.

## Service Layer

Lokasi: `src/services/` atau `src/module/*/services/`

Service = pure async function, tidak ada React hook.

```typescript
// ✅ Benar
export const getUserList = async (params?: UserParams): Promise<User[]> => {
  const { data } = await get<User[]>(ENDPOINTS.user.list, { params });
  return data;
};

// ❌ Salah - jangan campur hook
export const useUserList = () => {
  return useQuery({ ... }); // ini bukan service
};
```

### Return Type

- Service wajib return typed data, bukan raw AxiosResponse.
- Gunakan generic untuk response: `get<T>(url)`.
- Jangan return `response` atau `response.data` secara inconsistent.

### Endpoint

- Semua endpoint di `src/services/endpoint.ts`.
- Gunakan relative path: `/api/v1/...`.
- Jangan hardcode base URL di service.

## Hook Layer

Lokasi: `src/hooks/` atau `src/module/*/hooks/`

Hook = wrapper React Query untuk service.

```typescript
// ✅ Benar
export const useUserList = (params?: UserParams) => {
  return useQuery({
    queryKey: ['users', params],
    queryFn: () => getUserList(params),
  });
};
```

### Query Key

- Format: `['entity', params]` atau `['entity', 'action', id]`.
- Stabil dan serializable.
- Jangan gunakan object reference sebagai key.

### Error Handling

- Tangani error di UI layer, bukan di service.
- Gunakan `errorBoundary.tsx` untuk fatal error.
- Toast untuk user-facing error.

## Larangan

- Jangan return `null` untuk error, throw atau let React Query handle.
- Jangan log token/password ke console.
- Jangan taruh logic React di file `.service.ts`.
