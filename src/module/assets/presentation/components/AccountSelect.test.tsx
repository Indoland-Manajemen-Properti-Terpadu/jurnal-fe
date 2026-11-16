import { render, screen, userEvent } from '@test-utils';
import { describe, expect, it } from 'vitest';
import type { AccountOption } from '@/module/assets/domain/asset';
import { AccountSelect } from './AccountSelect';

const options: AccountOption[] = [
  { id: 'fa', name: 'Kendaraan', accountNumber: '1-20001', type: 'Aktiva Tetap' },
  { id: 'ap', name: 'Hutang Usaha', accountNumber: '2-10001', type: 'Akun Hutang' },
  { id: 'bk', name: 'Bank Operasional', accountNumber: '1-10600', type: '' },
] as AccountOption[];

const open = async (onlyPreferred: boolean) => {
  render(
    <AccountSelect
      label="Akun aset"
      placeholder="Pilih akun"
      value=""
      onChange={() => {}}
      options={options}
      preferredTypes={['Aktiva Tetap']}
      onlyPreferred={onlyPreferred}
    />
  );
  await userEvent.click(screen.getByRole('textbox', { name: /Akun aset/ }));
};

describe('AccountSelect onlyPreferred (PRO-85)', () => {
  it('offers only the preferred account types when asked to', async () => {
    await open(true);
    expect(await screen.findByRole('option', { name: /Kendaraan/, hidden: true })).toBeTruthy();
    expect(screen.queryByRole('option', { name: /Hutang Usaha/, hidden: true })).toBeNull();
    expect(screen.queryByRole('option', { name: /Bank Operasional/, hidden: true })).toBeNull();
  });

  it('keeps every account below the preferred ones otherwise', async () => {
    await open(false);
    expect(await screen.findByRole('option', { name: /Hutang Usaha/, hidden: true })).toBeTruthy();
    expect(screen.getByRole('option', { name: /Bank Operasional/, hidden: true })).toBeTruthy();
  });
});
