import { MemoryRouter } from 'react-router-dom';
import { render, screen } from '@test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { PettyCashFund } from '@/module/petty-cash/domain/pettyCashEntities';
import { FundLedgerLink } from '@/module/petty-cash/presentation/components/FundLedgerLink';

const detail = vi.hoisted(() => ({ result: {} as Record<string, unknown> }));
vi.mock('@/module/chart-of-accounts', () => ({
  useDetailAccount: () => detail.result,
  unwrapAccountDetail: (d?: { data?: unknown }) => (d && 'data' in d ? d.data : d),
}));

const fund = (cashBalance: number) =>
  ({
    account: { id: 'acc-1', name: 'Kas Kecil Kasir', accountNumber: '1-10002' },
    balance: { cashBalance },
  }) as PettyCashFund;

const renderLink = (cashBalance: number) =>
  render(
    <MemoryRouter>
      <FundLedgerLink fund={fund(cashBalance)} />
    </MemoryRouter>
  );

describe('FundLedgerLink', () => {
  beforeEach(() => {
    detail.result = {};
  });

  it('links to the account in Cash & Bank', () => {
    detail.result = { accountDetail: { amount: 390_000 }, isError: false };
    renderLink(390_000);
    expect(screen.getByRole('link', { name: /Kas & Bank/ }).getAttribute('href')).toContain(
      'acc-1'
    );
  });

  it('shows both figures when the book balance and the fund cash differ', () => {
    detail.result = { accountDetail: { amount: 500_000 }, isError: false };
    renderLink(390_000);
    expect(screen.getByText(/500\.000/)).toBeTruthy();
    expect(screen.getByText(/390\.000/)).toBeTruthy();
  });

  it('reads the balance when the detail answers { data: account }, as the live endpoint does', () => {
    detail.result = { accountDetail: { code: 200, data: { amount: 500_000 } }, isError: false };
    renderLink(390_000);
    expect(screen.getByText(/500\.000/)).toBeTruthy();
  });

  it('shows no note when the two agree', () => {
    detail.result = { accountDetail: { amount: 390_000 }, isError: false };
    renderLink(390_000);
    expect(screen.queryByText(/saldo buku/i)).toBeNull();
  });

  it('shows no note and no error when the ledger balance cannot be read', () => {
    detail.result = { accountDetail: undefined, isError: true };
    renderLink(390_000);
    expect(screen.queryByText(/saldo buku/i)).toBeNull();
    expect(screen.getByRole('link', { name: /Kas & Bank/ })).toBeTruthy();
  });
});
