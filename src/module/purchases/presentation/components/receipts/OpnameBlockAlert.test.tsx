import { MemoryRouter } from 'react-router-dom';
import { render, screen } from '@test-utils';
import { ApiError } from '@/lib/http/apiError';
import { OpnameBlockAlert } from './OpnameBlockAlert';

const blocked = new ApiError({
  kind: 'domain',
  status: 409,
  serverMessage: 'Gudang Utama sedang diopname (SO/2026/11/0012).',
  blockingOpname: { id: 'op1', number: 'SO/2026/11/0012' },
});

const setup = (error: unknown) =>
  render(
    <MemoryRouter>
      <OpnameBlockAlert error={error} />
    </MemoryRouter>
  );

describe('OpnameBlockAlert', () => {
  it('says the warehouse is being counted and links to that count', () => {
    setup(blocked);

    expect(screen.getByText(/sedang dihitung/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /SO\/2026\/11\/0012/ })).toHaveAttribute(
      'href',
      '/inventory/stock-take/op1'
    );
  });

  it.each([[null], [new Error('x')], [new ApiError({ kind: 'domain', status: 409 })]])(
    'shows nothing for an error that names no count (%#)',
    (error) => {
      setup(error);

      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    }
  );
});
