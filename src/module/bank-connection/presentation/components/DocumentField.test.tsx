import { render, screen, userEvent } from '@test-utils';
import { describe, expect, it, vi } from 'vitest';
import { DocumentField } from '@/module/bank-connection/presentation/components/DocumentField';

const base = {
  label: 'KTP/KITAS penanggung jawab',
  help: 'Untuk rekening perusahaan, lampirkan KTP direktur utama.',
  buttonLabel: 'Lampirkan KTP/KITAS',
  file: null as File | null,
  onChange: vi.fn(),
};

const pdf = new File([new Uint8Array(2048)], 'ktp.pdf', { type: 'application/pdf' });

describe('DocumentField', () => {
  it('shows what the document is, what is accepted, and a button to attach it', () => {
    render(<DocumentField {...base} />);
    expect(screen.getByText('KTP/KITAS penanggung jawab')).toBeTruthy();
    expect(screen.getByText(/direktur utama/)).toBeTruthy();
    expect(screen.getByText('PDF, PNG, atau JPG, maksimal 15 MB')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Lampirkan KTP/KITAS' })).toBeTruthy();
  });

  it('passes the chosen file up', async () => {
    const onChange = vi.fn();
    render(<DocumentField {...base} onChange={onChange} />);
    await userEvent.upload(screen.getByLabelText('KTP/KITAS penanggung jawab'), pdf);
    expect(onChange).toHaveBeenCalledWith(pdf);
  });

  it('shows the chosen file with its size and lets the user remove it', async () => {
    const onChange = vi.fn();
    render(<DocumentField {...base} file={pdf} onChange={onChange} />);
    expect(screen.getByText('ktp.pdf')).toBeTruthy();
    expect(screen.getByText('2 KB')).toBeTruthy();
    await userEvent.click(screen.getByRole('button', { name: 'Hapus ktp.pdf' }));
    expect(onChange).toHaveBeenCalledWith(null);
  });

  it('says a document is already on file and offers to replace it, without asking for it', () => {
    render(<DocumentField {...base} held="ktp-lama.pdf" />);
    expect(screen.getByText('Terlampir: ktp-lama.pdf')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Ganti' })).toBeTruthy();
  });

  it('shows the reason a file cannot be used', () => {
    render(<DocumentField {...base} error="Gunakan PDF, PNG, atau JPG." />);
    expect(screen.getByText('Gunakan PDF, PNG, atau JPG.')).toBeTruthy();
  });

  it('offers an example of the document when asked to', async () => {
    const onSeeExample = vi.fn();
    render(<DocumentField {...base} onSeeExample={onSeeExample} />);
    await userEvent.click(screen.getByRole('button', { name: 'Lihat contoh' }));
    expect(onSeeExample).toHaveBeenCalled();
  });

  it('shows no example link when there is none', () => {
    render(<DocumentField {...base} />);
    expect(screen.queryByRole('button', { name: 'Lihat contoh' })).toBeNull();
  });
});
