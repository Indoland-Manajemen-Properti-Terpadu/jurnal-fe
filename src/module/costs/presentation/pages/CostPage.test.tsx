import { act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import { render, screen } from '@test-utils';
import { useI18nStore } from '@/i18n/store';
import CostPage from './CostPage';

vi.mock('@/components/AppShellLayout', () => ({
  AppShellLayout: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

const renderPage = () =>
  render(
    <MemoryRouter>
      <CostPage />
    </MemoryRouter>
  );

describe('<CostPage />', () => {
  afterEach(() => act(() => useI18nStore.getState().setLanguage('id')));

  it('shows the Indonesian title by default', () => {
    renderPage();

    expect(screen.getAllByText('Biaya').length).toBeGreaterThan(0);
  });

  it('shows the English title after switching language', () => {
    act(() => useI18nStore.getState().setLanguage('en'));
    renderPage();

    expect(screen.getAllByText('Costs').length).toBeGreaterThan(0);
  });
});
