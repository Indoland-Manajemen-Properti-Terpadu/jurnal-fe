import { render, screen, userEvent, within } from '@test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ContactImportError } from '@/module/contacts/domain/contactImport';
import { ContactImportModal } from './ContactImportModal';

const mocks = vi.hoisted(() => ({ run: vi.fn() }));

vi.mock('@/module/contacts/presentation/hooks/useContactQueries', () => ({
  useDownloadContactTemplate: () => ({ mutate: vi.fn(), isPending: false }),
  useImportContacts: () => ({ mutateAsync: mocks.run, isPending: false }),
}));

const pickFile = async () => {
  const input = document.querySelector('input[type="file"]') as HTMLInputElement;
  await userEvent.upload(input, new File(['x'], 'kontak.xlsx'));
};

describe('ContactImportModal refused file (PRO-71)', () => {
  beforeEach(() => {
    mocks.run.mockReset();
  });

  it('lists the row, column and reason of every problem under the summary', async () => {
    mocks.run.mockRejectedValue(
      new ContactImportError('Impor dibatalkan: 4 dari 4 baris tidak valid.', [
        { row: 6, field: 'AR Account Code', reason: 'Akun piutang 6-60007 berkategori Beban' },
        { row: 6, field: 'Identity Number', reason: 'NIK KTP harus 16 digit angka' },
        { row: 7, field: null, reason: 'Baris kosong' },
      ])
    );
    render(<ContactImportModal opened onClose={() => {}} />);
    await pickFile();
    await userEvent.click(screen.getByRole('button', { name: /Mulai Impor/ }));

    const summary = await screen.findByText('Impor dibatalkan: 4 dari 4 baris tidak valid.');
    const alert = summary.closest('[role="alert"]') as HTMLElement;
    expect(within(alert).getByText('Impor dibatalkan: 4 dari 4 baris tidak valid.')).toBeTruthy();
    expect(within(alert).getByText('AR Account Code')).toBeTruthy();
    expect(within(alert).getByText('NIK KTP harus 16 digit angka')).toBeTruthy();
    expect(within(alert).getByText('Seluruh baris')).toBeTruthy();
    expect(within(alert).getAllByRole('row')).toHaveLength(4);
  });

  it('clears the list when another file is chosen', async () => {
    mocks.run.mockRejectedValue(new ContactImportError('', [{ row: 2, field: null, reason: 'x' }]));
    render(<ContactImportModal opened onClose={() => {}} />);
    await pickFile();
    await userEvent.click(screen.getByRole('button', { name: /Mulai Impor/ }));
    expect(await screen.findByText('Baris')).toBeTruthy();

    await pickFile();
    expect(screen.queryByText('Baris')).toBeNull();
  });
});
