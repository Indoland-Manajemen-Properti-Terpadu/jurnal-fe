import { act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { render, screen } from '@test-utils';
import { useI18nStore } from '@/i18n/store';
import AssetPage from './AssetPage';

const renderPage = () =>
  render(
    <MemoryRouter>
      <AssetPage />
    </MemoryRouter>
  );

describe('<AssetPage />', () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => act(() => useI18nStore.getState().setLanguage('id')));

  it('renders the Indonesian title and seeded assets', () => {
    renderPage();
    expect(screen.getByText('Aset Tetap (Fixed Assets)')).toBeInTheDocument();
    expect(screen.getByText('Total Nilai Perolehan')).toBeInTheDocument();
    expect(screen.getByText('Tanah Kavling Area Gudang Logistik Barat')).toBeInTheDocument();
  });

  it('renders the English title and labels', () => {
    act(() => useI18nStore.getState().setLanguage('en'));
    renderPage();
    expect(screen.getByText('Fixed Assets')).toBeInTheDocument();
    expect(screen.getByText('Total Acquisition Cost')).toBeInTheDocument();
  });
});
