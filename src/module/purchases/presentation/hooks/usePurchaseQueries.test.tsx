import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react';
import { getPayment } from '@/module/purchases/infrastructure/purchaseApi';
import { usePayment } from './usePurchaseQueries';

vi.mock('@/module/purchases/infrastructure/purchaseApi', () => ({
  getPayment: vi.fn(),
}));

const setup = () => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
  return { client, wrapper };
};

describe('usePayment', () => {
  it('does not fetch payment details when payment access is absent', () => {
    const { client, wrapper } = setup();
    const { result } = renderHook(() => usePayment('payment-1', false), { wrapper });

    expect(getPayment).not.toHaveBeenCalled();
    expect(result.current.fetchStatus).toBe('idle');
    expect(
      client.getQueryState(['purchases', 'anonymous', 'payments', 'detail', 'payment-1'])
    ).toMatchObject({ fetchStatus: 'idle' });
  });
});
