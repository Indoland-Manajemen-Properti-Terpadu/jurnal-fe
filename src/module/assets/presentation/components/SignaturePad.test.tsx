import userEvent from '@testing-library/user-event';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@test-utils';
import { SignaturePad } from './SignaturePad';

beforeAll(() => {
  // jsdom has neither object URLs nor a canvas drawing context.
  URL.createObjectURL = vi.fn(() => 'blob:signature');
  URL.revokeObjectURL = vi.fn();
  HTMLCanvasElement.prototype.getContext = vi.fn(() => null) as never;
});

const png = () => new File(['png'], 'ttd.png', { type: 'image/png' });

describe('SignaturePad', () => {
  it('takes an uploaded image as the signature and shows it', async () => {
    const onChange = vi.fn();
    render(<SignaturePad value={null} onChange={onChange} label="Tanda tangan" />);
    await userEvent.upload(screen.getByLabelText('Unggah gambar'), png());
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange.mock.calls[0][0]).toBeInstanceOf(File);
    expect(await screen.findByAltText('Gambar tanda tangan terpasang')).toBeInTheDocument();
  });

  it('clears the signature', async () => {
    const onChange = vi.fn();
    render(<SignaturePad value={png()} onChange={onChange} label="Tanda tangan" />);
    await userEvent.click(screen.getByRole('button', { name: 'Hapus' }));
    expect(onChange).toHaveBeenCalledWith(null);
  });

  it('refuses a file that is not an image', async () => {
    const onChange = vi.fn();
    render(<SignaturePad value={null} onChange={onChange} label="Tanda tangan" />);
    await userEvent.upload(
      screen.getByLabelText('Unggah gambar'),
      new File(['x'], 'catatan.txt', { type: 'text/plain' }),
      { applyAccept: false }
    );
    expect(onChange).not.toHaveBeenCalled();
    expect(screen.getByText('Gunakan gambar PNG atau JPG untuk tanda tangan.')).toBeInTheDocument();
  });

  it('offers a drawing area with an accessible name', () => {
    render(<SignaturePad value={null} onChange={vi.fn()} label="Tanda tangan" />);
    expect(
      screen.getByRole('group', {
        name: 'Area tanda tangan. Gambar dengan mouse, pena, atau jari.',
      })
    ).toBeInTheDocument();
  });
});
