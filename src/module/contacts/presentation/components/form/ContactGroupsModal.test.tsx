import { render, screen, userEvent } from '@test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ContactGroupsModal } from './ContactGroupsModal';

const mocks = vi.hoisted(() => ({ remove: vi.fn() }));

vi.mock('@/module/contacts/presentation/hooks/useContactQueries', () => ({
  useContactGroups: () => ({ isLoading: false, data: [{ id: 'g1', name: 'Vendor Lokal' }] }),
  useCreateContactGroup: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useUpdateContactGroup: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useDeleteContactGroup: () => ({ mutateAsync: mocks.remove, isPending: false, variables: null }),
}));

describe('ContactGroupsModal delete (PRO-71)', () => {
  beforeEach(() => mocks.remove.mockReset().mockResolvedValue(undefined));

  it('asks first and deletes only after the confirmation', async () => {
    render(<ContactGroupsModal opened onClose={() => {}} />);

    await userEvent.click(screen.getByRole('button', { name: 'Hapus grup Vendor Lokal' }));
    expect(mocks.remove).not.toHaveBeenCalled();
    expect(await screen.findByText(/menghapus grup/)).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Hapus Grup' }));
    expect(mocks.remove).toHaveBeenCalledWith('g1');
  });

  it('keeps the group when the question is cancelled', async () => {
    render(<ContactGroupsModal opened onClose={() => {}} />);

    await userEvent.click(screen.getByRole('button', { name: 'Hapus grup Vendor Lokal' }));
    await userEvent.click(await screen.findByRole('button', { name: 'Batal' }));
    expect(mocks.remove).not.toHaveBeenCalled();
  });
});
