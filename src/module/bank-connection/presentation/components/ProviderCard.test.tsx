import { render, screen } from '@test-utils';
import { describe, expect, it, vi } from 'vitest';
import type { BankProvider } from '@/module/bank-connection/domain/connection';
import { bankLogoFile } from '@/module/bank-connection/presentation/components/bankLogos';
import { ProviderCard } from '@/module/bank-connection/presentation/components/ProviderCard';

const provider = (over: Partial<BankProvider> = {}): BankProvider => ({
  id: 'p1',
  bankName: 'Bank Contoh A',
  accountTypes: [],
  capabilities: [],
  status: 'AVAILABLE',
  requiredFields: [],
  ...over,
});

describe('ProviderCard logo', () => {
  it('shows the logo the backend sends, named by the bank', () => {
    render(
      <ProviderCard
        provider={provider({ logoUrl: 'https://cdn.example/a.svg' })}
        onConnect={vi.fn()}
      />
    );
    const logo = screen.getByRole('img', { name: 'Bank Contoh A' });
    expect(logo.getAttribute('src')).toBe('https://cdn.example/a.svg');
  });

  it('does not repeat the bank name as a label under its logo', () => {
    render(
      <ProviderCard
        provider={provider({ logoUrl: 'https://cdn.example/a.svg' })}
        onConnect={vi.fn()}
      />
    );
    expect(screen.queryByText('Bank Contoh A')).toBeNull();
  });

  it('falls back to a neutral icon when there is no logo, never inventing one', () => {
    render(<ProviderCard provider={provider()} onConnect={vi.fn()} />);
    expect(screen.queryByRole('img')).toBeNull();
    expect(screen.getByText('Bank Contoh A')).toBeTruthy();
  });
});

describe('ProviderCard account types', () => {
  it('writes both kinds as one label under the logo when the bank takes both', () => {
    render(
      <ProviderCard
        provider={provider({
          logoUrl: 'https://cdn.example/a.svg',
          accountTypes: ['INDIVIDUAL', 'CORPORATE'],
        })}
        onConnect={vi.fn()}
      />
    );
    expect(screen.getByText('Perorangan / Korporasi')).toBeTruthy();
  });

  it('writes the one kind a bank takes', () => {
    render(
      <ProviderCard
        provider={provider({ logoUrl: 'https://cdn.example/a.svg', accountTypes: ['CORPORATE'] })}
        onConnect={vi.fn()}
      />
    );
    expect(screen.getByText('Korporasi')).toBeTruthy();
    expect(screen.queryByText('Perorangan')).toBeNull();
  });

  it('shows no label when the bank does not say', () => {
    render(<ProviderCard provider={provider({ accountTypes: [] })} onConnect={vi.fn()} />);
    expect(screen.queryByText(/Perorangan|Korporasi/)).toBeNull();
  });
});

describe('ProviderCard layout', () => {
  it('puts the logo and its label in one centered part and the button in another, with a divider between', () => {
    render(
      <ProviderCard
        provider={provider({ logoUrl: 'https://cdn.example/a.svg', accountTypes: ['CORPORATE'] })}
        onConnect={vi.fn()}
      />
    );
    expect(screen.getByRole('separator')).toBeTruthy();
    const top = screen
      .getByRole('img', { name: 'Bank Contoh A' })
      .closest('[data-part="identity"]');
    expect(top).toBeTruthy();
    expect(top?.contains(screen.getByText('Korporasi'))).toBe(true);
    expect(top?.contains(screen.getByRole('button', { name: 'Hubungkan' }))).toBe(false);
  });
});

describe('ProviderCard fee', () => {
  it('says nothing about a fee that is not known', () => {
    render(<ProviderCard provider={provider()} onConnect={vi.fn()} />);
    expect(screen.queryByText(/per bulan|Tanpa biaya/)).toBeNull();
  });

  it('says "no monthly fee" only when the backend says the fee is zero', () => {
    render(<ProviderCard provider={provider({ monthlyFee: 0 })} onConnect={vi.fn()} />);
    expect(screen.getByText('Tanpa biaya bulanan')).toBeTruthy();
  });
});

describe('bankLogoFile', () => {
  it('names the file a bank logo is expected in, by the bank code', () => {
    expect(bankLogoFile('014')).toBe('014');
    expect(bankLogoFile(undefined)).toBeUndefined();
  });
});
