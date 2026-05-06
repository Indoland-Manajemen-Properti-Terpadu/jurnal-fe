# Rule: Observability

Logging dan monitoring di `jurnal-fe`.

## Logging

### Development

```typescript
// ✅ Benar - conditional log
if (import.meta.env.DEV) {
  console.log('[Debug]', data);
}
```

### Production

- Tidak ada `console.log` untuk sensitive data.
- Error log ke monitoring service (Sentry, dsb).

## Error Tracking

### Error Boundary

```typescript
// src/services/errorBoundary.tsx
class ErrorBoundary extends Component<Props, State> {
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Send to error tracking
    logError(error, errorInfo);
  }
}
```

### Structured Error

```typescript
// ✅ Benar - structured
const error = {
  message: 'Failed to fetch users',
  code: 'USER_FETCH_ERROR',
  context: { userId, timestamp },
};

// ❌ Salah - tidak terstruktur
console.log('error', e);
```

## Performance Monitoring

```typescript
// Track render time (optional)
const startTime = performance.now();
// ... render
const endTime = performance.now();
if (import.meta.env.DEV) {
  console.log(`Render time: ${endTime - startTime}ms`);
}
```

## Larangan

- Jangan log token, password, atau data sensitif.
- Jangan gunakan `alert()` untuk error.
- Jangan biarkan unhandled promise rejection.

## Future Integration

Saat siap production, integrasikan:
- Sentry untuk error tracking.
- LogRocket untuk session replay.
- Google Analytics untuk user behavior.
