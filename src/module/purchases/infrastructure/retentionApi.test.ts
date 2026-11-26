import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  getRetentionReport,
  getRetentionTasks,
} from '@/module/purchases/infrastructure/retentionApi';
import { getDashboardSummary } from '@/module/purchases/infrastructure/dashboardApi';

const get = vi.fn();
vi.mock('@/module/purchases/infrastructure/purchaseHttp', () => ({
  http: { get: (...args: unknown[]) => get(...args) },
}));

describe('retention reads', () => {
  beforeEach(() => get.mockReset());

  it('maps the Hutang Retensi report row by row', async () => {
    get.mockResolvedValue({
      data: {
        total: 50,
        count: 1,
        maintenanceCount: 1,
        releasableCount: 1,
        rows: [
          {
            purchaseOrder: 'po1',
            transactionNumber: 'SPK/2026/11/0007',
            isService: true,
            vendorName: 'PT Teknologi',
            status: 'MAINTENANCE',
            retentionPercent: 5,
            maintenanceMonths: 0,
            totalAmount: 50,
            heldAmount: 50,
            releasedAmount: 0,
            balance: 50,
            state: 'RELEASABLE',
            stateLabel: 'Siap dilepas',
            maintenanceFrom: '2026-11-25T10:02:30.677Z',
            releasableFrom: '2026-11-25T00:00:00.000Z',
            reminderDate: '2026-10-26T00:00:00.000Z',
            daysLeft: 0,
            releaseBill: null,
          },
        ],
      },
    });
    const report = await getRetentionReport();
    expect(get).toHaveBeenCalledWith('/v1/purchase-bills/retention', undefined);
    expect(report.total).toBe(50);
    expect(report.rows[0]).toMatchObject({
      purchaseOrderId: 'po1',
      number: 'SPK/2026/11/0007',
      percent: 5,
      held: 50,
      balance: 50,
      releasableFrom: '2026-11-25',
      maintenanceFrom: '2026-11-25',
      reminderDate: '2026-10-26',
      releaseBillId: null,
    });
  });

  it('reads the id of the release bill when the service sends the bill as an object', async () => {
    get.mockResolvedValue({
      data: {
        total: 0,
        count: 1,
        maintenanceCount: 0,
        releasableCount: 0,
        rows: [{ purchaseOrder: 'po1', transactionNumber: 'S', releaseBill: { id: 'b9' } }],
      },
    });
    expect((await getRetentionReport()).rows[0].releaseBillId).toBe('b9');
  });

  it('maps the tasks, and an empty answer is an empty list', async () => {
    get.mockResolvedValue({
      data: [
        {
          purchaseOrder: 'po1',
          transactionNumber: 'SPK/1',
          vendorName: 'PT A',
          balance: 50,
          daysLeft: 0,
          type: 'RELEASE_RETENTION',
          title: 'Lepas retensi',
          dueDate: '2026-11-25T00:00:00.000Z',
        },
      ],
    });
    const tasks = await getRetentionTasks();
    expect(get).toHaveBeenCalledWith('/v1/purchase-bills/retention/tasks', undefined);
    expect(tasks[0]).toMatchObject({
      purchaseOrderId: 'po1',
      type: 'RELEASE_RETENTION',
      title: 'Lepas retensi',
      dueDate: '2026-11-25',
    });
    get.mockResolvedValue({ data: [] });
    expect(await getRetentionTasks()).toEqual([]);
  });

  it('keeps the retention of the overview summary, and null when the user may not see it', async () => {
    get.mockResolvedValue({
      data: {
        precision: 2,
        flow: [],
        procurement: { bidding: 0, single: 0, pastRequiredDate: 0 },
        readyToPay: { count: 0, amount: 0 },
        retention: {
          total: 50,
          count: 1,
          releasableCount: 1,
          orders: [
            {
              purchaseOrder: 'po1',
              transactionNumber: 'SPK/1',
              vendorName: 'PT A',
              balance: 50,
              state: 'RELEASABLE',
              stateLabel: 'Siap dilepas',
              releasableFrom: '2026-11-25T00:00:00.000Z',
              daysLeft: 0,
            },
          ],
        },
      },
    });
    const summary = await getDashboardSummary();
    expect(summary.retention).toMatchObject({ total: 50, releasableCount: 1 });
    expect(summary.retention?.orders[0]).toMatchObject({ purchaseOrderId: 'po1', number: 'SPK/1' });

    get.mockResolvedValue({
      data: {
        precision: 2,
        flow: [],
        procurement: { bidding: 0, single: 0, pastRequiredDate: 0 },
        readyToPay: { count: 0, amount: 0 },
      },
    });
    expect((await getDashboardSummary()).retention).toBeNull();
  });
});
