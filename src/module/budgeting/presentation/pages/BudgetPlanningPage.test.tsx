import { act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import { render, screen } from '@test-utils';
import { useI18nStore } from '@/i18n/store';
import BudgetPlanningPage from './BudgetPlanningPage';

vi.mock('@/components/AppShellLayout', () => ({
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

const renderPage = () =>
  render(
    <MemoryRouter>
      <BudgetPlanningPage />
    </MemoryRouter>
  );

describe('<BudgetPlanningPage />', () => {
  afterEach(() => act(() => useI18nStore.getState().setLanguage('id')));

  it('shows the Indonesian title by default', () => {
    renderPage();

    expect(screen.getAllByText('Perencanaan Anggaran').length).toBeGreaterThan(0);
  });

  it('shows the English title after switching language', () => {
    act(() => useI18nStore.getState().setLanguage('en'));
    renderPage();

    expect(screen.getAllByText('Budget Planning').length).toBeGreaterThan(0);
  });
});
