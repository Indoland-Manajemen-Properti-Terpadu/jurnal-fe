import { MantineProvider } from '@mantine/core';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { MoneyRows } from '@/module/purchases/presentation/components/shared/MoneyRows';

describe('MoneyRows', () => {
  it('prefixes a minus row and keeps every label', () => {
    render(
      <MantineProvider>
        <MoneyRows
          rows={[
            { label: 'Subtotal', amount: 'Rp 100' },
            { label: 'Diskon', amount: 'Rp 10', minus: true },
            { label: 'Total', amount: 'Rp 90', emphasis: 'total' },
          ]}
        />
      </MantineProvider>
    );
    expect(screen.getByText('- Rp 10')).toBeTruthy();
    expect(screen.getByText('Total')).toBeTruthy();
    expect(screen.getByText('Rp 90')).toBeTruthy();
  });
});
