import { act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import { render, screen } from '@test-utils';
import { useI18nStore } from '@/i18n/store';
import { routes } from '@/router/routes';
import { LandingPage } from './LandingPage';

const navigateMock = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return { ...actual, useNavigate: () => navigateMock };
});

const renderPage = () =>
  render(
    <MemoryRouter>
      <LandingPage />
    </MemoryRouter>
  );

describe('<LandingPage />', () => {
  beforeEach(() => navigateMock.mockClear());
  afterEach(() => act(() => useI18nStore.getState().setLanguage('id')));

  it('shows the Indonesian hero headline by default', () => {
    renderPage();

    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveTextContent('Software Akuntansi Terintegrasi:');
    expect(heading).toHaveTextContent('Sinkronisasi Operasional, Nol Selisih Pembukuan.');
  });

  it('navigates to the login route from the header CTA', () => {
    renderPage();

    screen.getByRole('button', { name: 'Masuk ke Jurnal' }).click();

    expect(navigateMock).toHaveBeenCalledWith(routes.login);
  });

  it('shows the heading of each live preview tab', () => {
    renderPage();

    expect(
      screen.getByText('Aktivitas Buku Besar Terbaru (Real-Time Double-Entry Log)')
    ).toBeInTheDocument();

    act(() => screen.getByRole('button', { name: /Antrean Sinkronisasi Operasional/ }).click());
    expect(
      screen.getByText('Pusat Persetujuan Inbound Operasional (Pending Operational Sync)')
    ).toBeInTheDocument();

    act(() => screen.getByRole('button', { name: /Jurnal Cerdas & Saldo Awal/ }).click());
    expect(
      screen.getByText('Jurnal Transaksi Valas & Pembelian Bahan (#JU-2026-095)')
    ).toBeInTheDocument();

    act(() => screen.getByRole('button', { name: /Rekonsiliasi Bank 3-Arah/ }).click());
    expect(screen.getByText('Algoritma Rekonsiliasi Cerdas 3-Arah')).toBeInTheDocument();

    act(() => screen.getByRole('button', { name: /Dashboard Eksekutif/ }).click());
    expect(
      screen.getByText('Aktivitas Buku Besar Terbaru (Real-Time Double-Entry Log)')
    ).toBeInTheDocument();
  });
});
