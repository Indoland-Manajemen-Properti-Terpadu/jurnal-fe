import { render, screen } from '@test-utils';
import { describe, expect, it } from 'vitest';
import type { Procurement } from '@/module/purchases/domain/procurement';
import { RejectedVendorNote } from './RejectedVendorNote';

const procurement = (route: Procurement['route'], reason = 'Harga terlalu tinggi') =>
  ({
    route,
    rejectedWinners: [
      {
        vendorId: 'v1',
        reason,
        rejectedAt: '2026-11-24T09:11:45.030Z',
        rejectedByName: 'Firman Badang',
        amount: 2331000,
      },
    ],
  }) as unknown as Procurement;

describe('RejectedVendorNote', () => {
  it('says who turned the vendor down and why', () => {
    render(<RejectedVendorNote procurement={procurement('BIDDING')} vendorId="v1" />);

    expect(screen.getByText(/Ditolak oleh Firman Badang/)).toBeInTheDocument();
    expect(screen.getByText('Alasan: Harga terlalu tinggi')).toBeInTheDocument();
  });

  it('points a bidding route to another vendor', () => {
    render(<RejectedVendorNote procurement={procurement('BIDDING')} vendorId="v1" />);
    expect(screen.getByText(/pilih pemenang dari vendor lain/)).toBeInTheDocument();
  });

  it('tells a single-vendor route how to get another quote, since there is none to pick', () => {
    render(<RejectedVendorNote procurement={procurement('SINGLE')} vendorId="v1" />);
    expect(screen.getByText(/ubah penawaran ini dengan vendor lain/)).toBeInTheDocument();
  });

  it('says so when no reason was recorded', () => {
    render(<RejectedVendorNote procurement={procurement('SINGLE', '')} vendorId="v1" />);
    expect(screen.getByText('Alasan penolakan tidak dicatat.')).toBeInTheDocument();
  });

  it('draws nothing for a vendor never turned down', () => {
    render(<RejectedVendorNote procurement={procurement('SINGLE')} vendorId="v9" />);
    expect(screen.queryByText(/Ditolak oleh/)).not.toBeInTheDocument();
  });
});
