import { useState } from 'react';
import { IconRuler } from '@tabler/icons-react';
import { render, screen, userEvent } from '@test-utils';
import { describe, expect, it } from 'vitest';
import type { MasterDataItem } from '@/module/products/domain/product';
import { MasterDataPanel } from './MasterDataPanel';

const item = (name: string): MasterDataItem => ({
  id: 'u1',
  name,
  description: null,
  createdAt: '2026-11-01T00:00:00.000Z',
});

/** The list a query would hold: saving an edit replaces the item, as the refetch does. */
function Harness() {
  const [items, setItems] = useState([item('Bulan')]);
  return (
    <MasterDataPanel
      icon={IconRuler}
      entityLabel="Satuan"
      helperText=""
      namePlaceholder=""
      items={items}
      isLoading={false}
      isCreating={false}
      isUpdating={false}
      isDeleting={false}
      onCreate={async () => undefined}
      onUpdate={async (_id, input) => setItems([item(input.name)])}
      onDelete={async () => undefined}
    />
  );
}

describe('MasterDataPanel edit form (PRO-73)', () => {
  it('shows the saved name when the same item is edited again without a reload', async () => {
    render(<Harness />);

    await userEvent.click(screen.getByRole('button', { name: 'Ubah Bulan' }));
    const first = screen.getByRole('textbox', { name: /Nama satuan/i });
    await userEvent.clear(first);
    await userEvent.type(first, 'Tahun');
    await userEvent.click(screen.getByRole('button', { name: 'Simpan' }));

    await userEvent.click(await screen.findByRole('button', { name: 'Ubah Tahun' }));
    expect((screen.getByRole('textbox', { name: /Nama satuan/i }) as HTMLInputElement).value).toBe(
      'Tahun'
    );
  });
});
