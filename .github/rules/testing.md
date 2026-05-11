# Rule: Testing

Standar testing di `jurnal-fe`.

## Tech Stack

- Vitest sebagai test runner.
- React Testing Library untuk komponen.
- MSW untuk mock API (opsional).

## Lokasi

- Test file bersebelahan dengan source: `Component.test.tsx`.
- Atau folder `__tests__/` dalam module.

## Prioritas Testing

1. **Utility functions** - unit test wajib.
2. **Custom hooks** - unit test dengan `renderHook`.
3. **Komponen kritikal** - component test.
4. **Flow penting** - integration test.

## Template

### Hook Test

```typescript
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useUserList } from '../useUserList';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('useUserList', () => {
  it('should fetch users', async () => {
    const { result } = renderHook(() => useUserList(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBeDefined();
  });
});
```

### Component Test

```typescript
import { render, screen } from '@testing-library/react';
import { UserCard } from './UserCard';

describe('UserCard', () => {
  it('should render user name', () => {
    render(<UserCard user={{ name: 'John' }} />);
    expect(screen.getByText('John')).toBeInTheDocument();
  });
});
```

## Coverage

Target minimal:

- Utility: 80%.
- Hooks: 70%.
- Komponen kritikal: 60%.

## Commands

```bash
# Run tests
yarn vitest --run

# Watch mode
yarn vitest

# Coverage
yarn vitest --coverage
```

## Larangan

- Jangan test implementation detail.
- Jangan skip test tanpa alasan dan TODO.
- Jangan mock yang tidak perlu.
