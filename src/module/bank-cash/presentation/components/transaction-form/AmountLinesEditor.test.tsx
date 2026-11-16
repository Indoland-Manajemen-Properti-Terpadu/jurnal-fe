import { render, screen, userEvent } from '@test-utils';
import { useState } from 'react';
import { describe, expect, it } from 'vitest';
import {
  AmountLinesEditor,
  createLineRow,
  type LineRow,
} from '@/module/bank-cash/presentation/components/transaction-form/AmountLinesEditor';

const labels = {
  account: 'Akun sumber',
  accountPlaceholder: 'Pilih akun',
  description: 'Keterangan',
  descriptionPlaceholder: 'Keterangan baris',
  amount: 'Nominal',
};

function Harness() {
  const [rows, setRows] = useState<LineRow[]>([createLineRow()]);
  return (
    <AmountLinesEditor
      rows={rows}
      onChange={setRows}
      options={[{ value: 'a', label: '4-1 Pendapatan' }]}
      labels={labels}
    />
  );
}

describe('AmountLinesEditor', () => {
  it('starts with one row that cannot be removed', () => {
    render(<Harness />);
    expect(screen.getAllByPlaceholderText('Keterangan baris')).toHaveLength(1);
    expect(screen.getByRole('button', { name: 'Hapus baris' }).hasAttribute('disabled')).toBe(true);
  });

  it('adds a row and removes it again', async () => {
    render(<Harness />);
    await userEvent.click(screen.getByRole('button', { name: 'Tambah baris' }));
    expect(screen.getAllByPlaceholderText('Keterangan baris')).toHaveLength(2);
    await userEvent.click(screen.getAllByRole('button', { name: 'Hapus baris' })[1]);
    expect(screen.getAllByPlaceholderText('Keterangan baris')).toHaveLength(1);
  });

  it('gives every row its own id', () => {
    expect(createLineRow().id).not.toBe(createLineRow().id);
  });
});
