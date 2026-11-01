import { render, screen } from '@test-utils';
import { AccountPreviewCard } from './AccountPreviewCard';

const renderCard = (isDebit: boolean | undefined, isContra: boolean) =>
  render(
    <AccountPreviewCard
      accountNumber="1-1000"
      accountName="Akun Uji"
      categoryName="Kategori"
      isDebit={isDebit}
      isContra={isContra}
      accountType="SingleAccount"
      accessType="all"
      specialUsersCount={0}
      certainRolesCount={0}
    />
  );

describe('I5 contra flip in AccountPreviewCard (characterization)', () => {
  it('shows the category side when not contra', () => {
    renderCard(true, false);
    expect(screen.getAllByText('Debit').length).toBeGreaterThan(0);
    expect(screen.queryByText('Kredit')).not.toBeInTheDocument();
  });

  it('shows credit for a credit category when not contra', () => {
    renderCard(false, false);
    expect(screen.getAllByText('Kredit').length).toBeGreaterThan(0);
  });

  it('flips a debit category to credit when contra', () => {
    renderCard(true, true);
    expect(screen.getAllByText('Kredit').length).toBeGreaterThan(0);
  });

  it('flips a credit category to debit when contra', () => {
    renderCard(false, true);
    expect(screen.getAllByText('Debit').length).toBeGreaterThan(0);
  });

  it('defaults an unset flag to debit', () => {
    renderCard(undefined, false);
    expect(screen.getAllByText('Debit').length).toBeGreaterThan(0);
  });
});
