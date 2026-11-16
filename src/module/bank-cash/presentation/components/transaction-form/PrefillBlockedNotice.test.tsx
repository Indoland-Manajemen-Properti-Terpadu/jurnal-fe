import { render, screen } from '@test-utils';
import { PrefillBlockedNotice } from '@/module/bank-cash/presentation/components/transaction-form/PrefillBlockedNotice';

describe('PrefillBlockedNotice', () => {
  it('does not blame petty cash for every refusal', () => {
    render(<PrefillBlockedNotice />);
    expect(screen.getByRole('alert').textContent).toMatch(/diarsipkan/i);
    expect(screen.getByRole('alert').textContent).toMatch(/kas kecil/i);
  });
});
