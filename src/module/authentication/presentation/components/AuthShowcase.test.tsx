import { render, screen, userEvent } from '@test-utils';
import { AuthShowcase } from './AuthShowcase';

describe('AuthShowcase', () => {
  it('starts on the first preview and labels it as a sample view', () => {
    render(<AuthShowcase />);
    expect(screen.getByText('Operasional dan pembukuan tersinkron')).toBeInTheDocument();
    expect(screen.getByText('Contoh tampilan')).toBeInTheDocument();
  });

  it('switches the preview with the dots', async () => {
    render(<AuthShowcase />);
    await userEvent.click(screen.getByRole('button', { name: 'Buka pratinjau 3' }));
    expect(screen.getByText('Kas dan bank tetap terkontrol')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Buka pratinjau 3' })).toHaveAttribute(
      'aria-current',
      'true'
    );
  });
});
