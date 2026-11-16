import { render, screen, userEvent } from '@test-utils';
import { describe, expect, it } from 'vitest';
import type { AccountOption } from '@/module/assets/domain/asset';
import { AccountSelect } from './AccountSelect';

const typed: AccountOption[] = [
  { id: 'fa', name: 'Kendaraan', accountNumber: '1-20001', type: 'Aktiva Tetap' },
  { id: 'ap', name: 'Hutang Usaha', accountNumber: '2-10001', type: 'Akun Hutang' },
];
const untyped: AccountOption[] = [
  { id: 'fa', name: 'Kendaraan', accountNumber: '1-20001', type: '' },
  { id: 'fb', name: 'Mesin', accountNumber: '1-20003', type: '' },
];

const open = async (options: AccountOption[]) => {
  render(
    <AccountSelect
      label="Akun aset"
      placeholder="Pilih akun"
      value=""
      onChange={() => {}}
      options={options}
      preferredTypes={['Aktiva Tetap']}
    />
  );
  await userEvent.click(screen.getByRole('textbox', { name: /Akun aset/ }));
};

describe('AccountSelect', () => {
  it('keeps every account, the preferred types first', async () => {
    await open(typed);
    expect(await screen.findByRole('option', { name: /Kendaraan/, hidden: true })).toBeTruthy();
    expect(screen.getByRole('option', { name: /Hutang Usaha/, hidden: true })).toBeTruthy();
  });

  it('lists accounts the API already narrowed without a group heading', async () => {
    await open(untyped);
    expect(await screen.findByRole('option', { name: /Mesin/, hidden: true })).toBeTruthy();
    expect(screen.queryByText('—')).toBeNull();
  });
});
