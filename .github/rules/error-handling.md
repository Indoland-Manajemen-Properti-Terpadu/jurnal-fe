# Rule: Error Handling

Penanganan error di `jurnal-fe`.

## Prinsip

- Error ditangani di layer yang tepat.
- User mendapat pesan jelas.
- Developer mendapat informasi debug.

## Kategori Error

### 1. Network/API Error

```typescript
try {
  const data = await service();
} catch (error) {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.message || 'Network error';
    notifications.show({ message, color: 'red' });
  }
}
```

### 2. Validation Error

- Tampilkan di form field.
- Gunakan Mantine `TextInput` error prop.

### 3. Auth Error

- 401: Redirect ke login.
- 403: Tampilkan forbidden page.

### 4. Fatal Error

- Gunakan ErrorBoundary.
- Tampilkan ErrorPage dengan retry.

## Best Practice

```typescript
// ✅ Benar - tangani di komponen
const { data, error, isLoading } = useData();

if (error) {
  return <ErrorAlert message={error.message} />;
}
```

```typescript
// ❌ Salah - silent error
try {
  await service();
} catch (e) {
  // do nothing
}
```

## Larangan

- Jangan swallow error tanpa log atau notifikasi.
- Jangan log token/secret ke console.
- Jangan throw error generik tanpa context.
