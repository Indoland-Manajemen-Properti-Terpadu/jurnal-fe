import { toPurchaseRequest } from './requestMappers';
import type { PurchaseRequestDto } from './requestDto';
import { requestDtoFixture as dto } from './requestDtoFixture';

describe('toPurchaseRequest, the procurement part', () => {
  const request = toPurchaseRequest(dto);
  const { procurement } = request;

  it('reads the route, the status and the reasons', () => {
    expect(request.route).toBe('BIDDING');
    expect(procurement).toMatchObject({
      route: 'BIDDING',
      status: 'SUBMITTED',
      winnerId: 'v1',
      belowMinQuotesReason: 'Hanya dua vendor',
      minQuotes: 2,
      biddingNumber: 'BID/2026/11/0011',
      estimatedValue: 5994000,
    });
  });

  it('reads a quote with its term snapshot, its lines and its files at a usable address', () => {
    const [quote] = procurement.quotes;

    expect(quote).toMatchObject({
      id: 'q1',
      number: 'QT-1',
      validUntil: '2026-12-31',
      paymentTermId: 't1',
      leadDays: 7,
      withReceipt: true,
      scores: { price: 5, spec: 4, delivery: 4, term: 3 },
    });
    expect(quote.vendor.name).toBe('PT Alfa');
    expect(quote.term).toMatchObject({
      advanceType: 'partial',
      advancePercent: 20,
      installments: 3,
      installmentPercents: [40, 30, 30],
      retentionPercent: 5,
    });
    expect(quote.lines[0]).toMatchObject({
      requestItemId: 'i1',
      unitPrice: 900000,
      finalPrice: null,
      taxId: 'tax1',
      taxName: 'PPN 11%',
    });
    expect(quote.attachments[0].name).toBe('qt.pdf');
    expect(quote.attachments[0].url.endsWith('/uploads/qt.pdf')).toBe(true);
  });

  it('keeps the totals of a quote by its id, as the service computed them', () => {
    expect(procurement.totals.q1).toEqual({
      complete: true,
      rejected: false,
      schedule: null,
      subtotal: 5400000,
      discountAmount: 0,
      taxAmount: 594000,
      shippingAmount: 0,
      total: 5994000,
      score: 4.35,
      vendorOrders: 2,
      vendorLastOrderDate: '2026-10-01',
    });
    expect(procurement.cheapestVendorId).toBe('v1');
  });

  it('carries what blocks submitting, the approvers to come and the orders made', () => {
    expect(procurement.submitErrors).toEqual([
      'Bidding butuh minimal 2 penawaran lengkap, sekarang baru ada 1',
    ]);
    expect(procurement.approvalPreview).toEqual([
      { name: 'Chief Finance', mode: 'ANY', roles: ['Chief Finance'] },
    ]);
    expect(procurement.approval.canDecide).toBe(true);
    expect(procurement.approval.pending[0].name).toBe('Chief Finance');
    expect(request.orders).toEqual([
      { id: 'po1', number: 'PO/2026/11/0001', isService: false, total: 5994000, status: 'DRAFT' },
    ]);
  });

  it('gives a request with no procurement yet an empty draft', () => {
    const bare = toPurchaseRequest({
      ...dto,
      status: 'VERIFIED',
      procurement: { route: null, status: 'DRAFT', quotes: [] },
      procurementView: null,
      purchaseOrderRefs: null,
    });

    expect(bare.route).toBeNull();
    expect(bare.procurement).toMatchObject({
      route: null,
      status: 'DRAFT',
      quotes: [],
      minQuotes: 1,
    });
    expect(bare.orders).toEqual([]);
  });
});

describe('toPurchaseRequest, quote discount', () => {
  const withDiscount = (extra: Record<string, unknown>) => {
    const base = dto as unknown as PurchaseRequestDto;
    const quote = { ...base.procurement?.quotes?.[0], ...extra };
    return toPurchaseRequest({
      ...base,
      procurement: { ...base.procurement, quotes: [quote] },
    } as PurchaseRequestDto).procurement.quotes[0];
  };

  it('reads a percent discount with its percent', () => {
    expect(
      withDiscount({ discountType: 'percentage', discountValue: 10, discountAmount: 0 })
    ).toMatchObject({
      discountType: 'percentage',
      discountValue: 10,
    });
  });

  it('reads a rupiah discount with its amount', () => {
    expect(
      withDiscount({ discountType: 'nominal', discountValue: 250000, discountAmount: 250000 })
    ).toMatchObject({
      discountType: 'nominal',
      discountValue: 250000,
    });
  });

  it('reads an older quote that has only an amount as a rupiah discount', () => {
    expect(
      withDiscount({ discountType: null, discountValue: 0, discountAmount: 125000 })
    ).toMatchObject({
      discountType: 'nominal',
      discountValue: 125000,
    });
  });
});

describe('toPurchaseRequest, negotiation evidence', () => {
  it('reads the files uploaded as evidence of the negotiation', () => {
    const base = dto as unknown as PurchaseRequestDto;
    const request = toPurchaseRequest({
      ...base,
      procurement: {
        ...base.procurement,
        negotiationAttachments: [
          {
            id: 'a1',
            fileName: 'negosiasi.pdf',
            filePath: 'uploads/negosiasi.pdf',
            mimeType: 'application/pdf',
          },
        ],
      },
    } as PurchaseRequestDto);
    expect(request.procurement.negotiationAttachments).toHaveLength(1);
    expect(request.procurement.negotiationAttachments[0]).toMatchObject({ name: 'negosiasi.pdf' });
  });

  it('has none when the service sends none', () => {
    expect(
      toPurchaseRequest(dto as unknown as PurchaseRequestDto).procurement.negotiationAttachments
    ).toEqual([]);
  });
});

describe('toPurchaseRequest, delivery warehouse', () => {
  it('reads the warehouse the goods are delivered to', () => {
    const request = toPurchaseRequest({
      ...(dto as unknown as PurchaseRequestDto),
      deliveryWarehouse: { id: 'w1', code: 'GDG-001', name: 'Gudang Utama' },
    });
    expect(request.deliveryWarehouse).toEqual({ id: 'w1', code: 'GDG-001', name: 'Gudang Utama' });
  });

  it('has none for an older request or a request of services only', () => {
    expect(toPurchaseRequest(dto as unknown as PurchaseRequestDto).deliveryWarehouse).toBeNull();
  });
});

describe('toPurchaseRequest, rejected vendors', () => {
  /** What the live service answered after an approver turned a winner down (Demo Site, 2026-11-24). */
  const withRejection = (view: Record<string, unknown>) =>
    toPurchaseRequest({
      ...(dto as unknown as PurchaseRequestDto),
      procurementView: {
        ...((dto as unknown as PurchaseRequestDto).procurementView ?? {}),
        ...view,
      },
    } as PurchaseRequestDto);

  it('marks the quote of a vendor that was turned down', () => {
    const { procurement } = withRejection({
      quotes: [{ id: 'q1', rejected: true, total: 2331000 }],
    });
    expect(procurement.totals.q1.rejected).toBe(true);
  });

  it('treats a quote with no flag as not rejected', () => {
    const { procurement } = toPurchaseRequest(dto as unknown as PurchaseRequestDto);
    expect(Object.values(procurement.totals).every((entry) => entry.rejected === false)).toBe(true);
  });

  it('reads who turned the vendor down, when and why', () => {
    const { procurement } = withRejection({
      rejectedWinners: [
        {
          vendor: 'v1',
          route: 'SINGLE',
          amount: 2331000,
          reason: 'Harga terlalu tinggi',
          rejectedAt: '2026-11-24T09:11:45.030Z',
          rejectedBy: 'u1',
          rejectedByInfo: {
            id: 'u1',
            name: 'Firman Badang',
            email: 'f@x.id',
            title: 'Super Admin',
          },
        },
      ],
    });
    expect(procurement.rejectedWinners).toEqual([
      {
        vendorId: 'v1',
        reason: 'Harga terlalu tinggi',
        rejectedAt: '2026-11-24T09:11:45.030Z',
        rejectedByName: 'Firman Badang',
        amount: 2331000,
      },
    ]);
  });

  it('puts the newest rejection of a vendor first', () => {
    const { procurement } = withRejection({
      rejectedWinners: [
        { vendor: 'v1', reason: 'Lama', rejectedAt: '2026-11-20T01:00:00.000Z' },
        { vendor: 'v1', reason: 'Baru', rejectedAt: '2026-11-24T01:00:00.000Z' },
      ],
    });
    expect(procurement.rejectedWinners.map((entry) => entry.reason)).toEqual(['Baru', 'Lama']);
  });

  it('keeps working when the service sends no name for the rejecter', () => {
    const { procurement } = withRejection({
      rejectedWinners: [{ vendor: 'v1', reason: 'X', rejectedAt: '2026-11-24T01:00:00.000Z' }],
    });
    expect(procurement.rejectedWinners[0].rejectedByName).toBe('');
  });

  it('has no rejected vendors when the service sends none', () => {
    expect(
      toPurchaseRequest(dto as unknown as PurchaseRequestDto).procurement.rejectedWinners
    ).toEqual([]);
  });
});
