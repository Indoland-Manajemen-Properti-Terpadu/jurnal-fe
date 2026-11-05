import { render, screen, userEvent } from '@test-utils';
import { AuthShowcase } from './AuthShowcase';

describe('AuthShowcase', () => {
  it('presents accounting messaging without fabricated product data', () => {
    render(<AuthShowcase />);
    expect(
      screen.getByRole('heading', { name: 'Pembukuan tertata. Keputusan terarah.' })
    ).toBeInTheDocument();
    expect(screen.queryByText(/contoh tampilan|Rp |operasional properti/i)).not.toBeInTheDocument();
  });

  it('switches topics and stops automatic rotation after manual selection', async () => {
    render(<AuthShowcase />);
    const control = screen.getByRole('button', { name: 'Lihat Rekonsiliasi' });
    await userEvent.click(control);
    expect(
      screen.getByRole('heading', { name: 'Setiap transaksi. Dalam kendali.' })
    ).toBeInTheDocument();
    expect(control).toHaveAttribute('aria-current', 'true');
    expect(screen.getByRole('button', { name: 'Putar slide otomatis' })).toBeInTheDocument();
  });

  it('lets the user pause and resume slide rotation', async () => {
    render(<AuthShowcase />);
    await userEvent.click(screen.getByRole('button', { name: 'Jeda pergantian slide' }));
    await userEvent.click(screen.getByRole('button', { name: 'Putar slide otomatis' }));
    expect(screen.getByRole('button', { name: 'Jeda pergantian slide' })).toBeInTheDocument();
  });
});
