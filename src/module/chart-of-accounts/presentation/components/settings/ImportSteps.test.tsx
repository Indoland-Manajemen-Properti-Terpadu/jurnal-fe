import { render, screen } from '@test-utils';
import { setLanguage } from '@/i18n';
import { ImportDoneStep } from './ImportDoneStep';
import { ImportPreviewStep } from './ImportPreviewStep';

const previewProps = {
  totalRows: 3,
  validCount: 2,
  invalidCount: 1,
  rows: [
    { item: { accountNumber: '1-10001', name: 'Kas', amount: 1500000 }, isValid: true },
    {
      item: { accountNumber: '1-10001', name: 'Dobel' },
      isValid: false,
      errors: ['Nomor akun duplikat'],
    },
  ],
  filter: 'all' as const,
  onFilterChange: vi.fn(),
  searchQuery: '',
  onSearchChange: vi.fn(),
  isCommitting: false,
  onBack: vi.fn(),
  onCommit: vi.fn(),
};

describe('import wizard steps (i18n)', () => {
  afterEach(() => setLanguage('id'));

  it('renders the preview summary in Indonesian with the counts filled in', () => {
    render(<ImportPreviewStep {...previewProps} />);
    expect(screen.getByText('Total: 3 Baris')).toBeInTheDocument();
    expect(screen.getByText('2 Siap Diimpor')).toBeInTheDocument();
    expect(screen.getByText('1 Perlu Koreksi')).toBeInTheDocument();
    expect(
      screen.getByText(/Terdapat 1 baris akun yang tidak memenuhi validasi/)
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Simpan & Impor \(2 Akun\)/ })).toBeEnabled();
  });

  it('renders the same screen in English', () => {
    setLanguage('en');
    render(<ImportPreviewStep {...previewProps} />);
    expect(screen.getByText('Total: 3 Rows')).toBeInTheDocument();
    expect(screen.getByText('2 Ready to Import')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Save & Import \(2 Accounts\)/ })).toBeEnabled();
  });

  it('disables the commit button when no row is valid', () => {
    render(<ImportPreviewStep {...previewProps} validCount={0} rows={[]} />);
    expect(screen.getByRole('button', { name: /Simpan & Impor \(0 Akun\)/ })).toBeDisabled();
    expect(screen.getByText('Tidak ada data akun yang cocok dengan filter.')).toBeInTheDocument();
  });

  it('shows the imported count on the done step', () => {
    render(<ImportDoneStep importedCount={7} onClose={vi.fn()} />);
    expect(screen.getByText('7')).toBeInTheDocument();
    expect(screen.getByText('Impor Bagan Akun Berhasil!')).toBeInTheDocument();
  });
});
