import { toOrderRetention } from './orderRetentionMapper';

describe('toOrderRetention', () => {
  it('reads the retention block of an order', () => {
    expect(
      toOrderRetention({
        percent: 5,
        maintenanceMonths: 3,
        totalAmount: 100,
        heldAmount: 50,
        releasedAmount: 0,
        balance: 50,
        state: 'HELD',
        maintenanceFrom: '2026-11-25T10:02:30.677Z',
        releasableFrom: '2027-02-25T00:00:00.000Z',
      })
    ).toMatchObject({ percent: 5, held: 50, balance: 50, state: 'HELD' });
  });

  it('is null when the order holds no retention', () => {
    expect(toOrderRetention(null)).toBeNull();
    expect(toOrderRetention({ percent: 0 })).toBeNull();
  });
});
