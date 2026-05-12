# Rule: Models and Types

Standar TypeScript types dan interfaces di `jurnal-fe`.

## Lokasi

- Global types: `src/types/`.
- Module types: `src/module/*/types/`.

## Konvensi

### Naming

- Interface untuk data shape: `User`, `UserListResponse`.
- Type untuk union/alias: `Status = 'active' | 'inactive'`.
- Props untuk komponen: `UserCardProps`.
- Suffix `Params` untuk query params: `UserParams`.
- Suffix `Payload` untuk request body: `CreateUserPayload`.

### Struktur

```typescript
// types/User.ts
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
}

export type UserRole = 'admin' | 'user' | 'viewer';
export type UserStatus = 'active' | 'inactive';

export interface UserParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: UserStatus;
}

export interface CreateUserPayload {
  name: string;
  email: string;
  role: UserRole;
}
```

### API Response

```typescript
// ✅ Benar - typed response
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export type UserListResponse = PaginatedResponse<User>;
```

## Larangan

- Jangan gunakan `any` tanpa alasan kuat.
- Jangan duplikasi type di banyak file.
- Jangan export type yang tidak digunakan di luar module.
- Jangan buat type dengan field optional semua tanpa alasan.
