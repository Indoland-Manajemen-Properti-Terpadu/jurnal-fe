import { render, screen } from '@test-utils';
import { ChoicesLoadError } from '@/module/bank-cash/presentation/components/transaction-form/ChoicesLoadError';

describe('ChoicesLoadError', () => {
  it('tells the user the accounts could not be loaded', () => {
    render(<ChoicesLoadError />);
    expect(screen.getByRole('alert').textContent).toMatch(/Gagal memuat data akun/);
  });
});
