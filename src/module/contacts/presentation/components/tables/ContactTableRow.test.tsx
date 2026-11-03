import { MemoryRouter } from 'react-router-dom';
import { Table } from '@mantine/core';
import { render, screen } from '@test-utils';
import type { Contact } from '@/module/contacts/domain/contact';
import { ContactTableRow } from './ContactTableRow';

const contact: Contact = {
  id: 'contact-1',
  contactNumber: 'CNT-001',
  displayName: 'Contoh Kontak',
  emails: [],
  contactType: ['Pelanggan', 'Supplier', 'Karyawan', 'Unit', 'Lainnya'],
  bankAccounts: [],
  deleted: false,
  createdAt: '2026-11-03T00:00:00.000Z',
  updatedAt: '2026-11-03T00:00:00.000Z',
};

describe('<ContactTableRow />', () => {
  it('shows the first two contact type badges and summarizes the remaining types', () => {
    render(
      <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Table>
          <Table.Tbody>
            <ContactTableRow
              contact={contact}
              accountMap={new Map()}
              onView={vi.fn()}
              onEdit={vi.fn()}
              onArchive={vi.fn()}
              onUnarchive={vi.fn()}
            />
          </Table.Tbody>
        </Table>
      </MemoryRouter>
    );

    expect(screen.getByText('Pelanggan')).toBeInTheDocument();
    expect(screen.getByText('Supplier')).toBeInTheDocument();
    expect(screen.getByText('(3) tipe lainnya')).toBeInTheDocument();
    expect(
      screen.getByText('(3) tipe lainnya').closest('.mantine-Badge-label')
    ).toBeInTheDocument();
    expect(screen.queryByText('Karyawan')).not.toBeInTheDocument();
    expect(
      screen.queryByText('Unit', { selector: '.mantine-Badge-label' })
    ).not.toBeInTheDocument();
    expect(screen.queryByText('Lainnya')).not.toBeInTheDocument();
  });
});
