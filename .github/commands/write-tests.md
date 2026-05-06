# Command: Write Tests

Tulis test untuk modul/komponen di `jurnal-fe`.

## Langkah

1. Identifikasi target:
   - Utility functions di `src/utils/`.
   - Hooks di `src/hooks/` atau `src/module/*/hooks/`.
   - Komponen kritikal.

2. Pilih jenis test:
   - **Unit**: utils, hooks, pure functions.
   - **Component**: UI dengan user interaction.
   - **Integration**: flow multi-komponen.

3. Tulis test:
   - Gunakan Vitest + React Testing Library.
   - Coverage: happy path, edge case, error state.

4. Jalankan test:

   ```bash
   yarn vitest --run
   ```

5. Verifikasi coverage:
   ```bash
   yarn vitest --coverage
   ```

## Template Hook Test

```typescript
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { use[HookName] } from '../use[HookName]';

const wrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('use[HookName]', () => {
  it('should fetch data successfully', async () => {
    const { result } = renderHook(() => use[HookName](), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBeDefined();
  });
});
```

## Output

- File test baru.
- Hasil coverage.
- Catatan area belum tercover.
