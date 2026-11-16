import { render, screen } from '@test-utils';
import { describe, expect, it, vi } from 'vitest';
import { DocumentSampleDialog } from '@/module/bank-connection/presentation/components/DocumentSampleDialog';

describe('DocumentSampleDialog', () => {
  it('shows a KTP and a KITAS example for the identity document, with the reminder to keep it legible', () => {
    render(<DocumentSampleDialog type="IDENTITY" onClose={vi.fn()} />);
    expect(screen.getByText('Contoh KTP/KITAS')).toBeTruthy();
    expect(screen.getByRole('img', { name: 'KTP' })).toBeTruthy();
    expect(screen.getByRole('img', { name: 'KITAS' })).toBeTruthy();
    expect(screen.getByText(/jelas dan terbaca/)).toBeTruthy();
  });

  it('shows the front page of a savings book for the account proof', () => {
    render(<DocumentSampleDialog type="ACCOUNT_PROOF" onClose={vi.fn()} />);
    expect(screen.getByText('Contoh buku tabungan')).toBeTruthy();
    expect(screen.getByRole('img', { name: 'Buku tabungan' })).toBeTruthy();
    expect(screen.queryByRole('img', { name: 'KTP' })).toBeNull();
  });

  it('says it is only an illustration, never a real document', () => {
    render(<DocumentSampleDialog type="IDENTITY" onClose={vi.fn()} />);
    expect(screen.getByText(/hanya contoh tata letak/)).toBeTruthy();
  });

  it('shows nothing when no example is asked for', () => {
    render(<DocumentSampleDialog type={null} onClose={vi.fn()} />);
    expect(screen.queryByRole('img')).toBeNull();
  });
});
