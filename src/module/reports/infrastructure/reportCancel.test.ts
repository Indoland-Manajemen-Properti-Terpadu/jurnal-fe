import { CanceledError } from 'axios';
import { notifications } from '@mantine/notifications';
import apiClient from '@/lib/http/apiClient';
import { balanceSheetApi } from './balanceSheetApi';
import { exportReport } from './exportReport';
import { generalLedgerApi } from './generalLedgerApi';
import { isRequestCanceled } from './requestCancel';

vi.mock('@/lib/http/apiClient', () => ({ default: { get: vi.fn() } }));
vi.mock('@mantine/notifications', () => ({ notifications: { show: vi.fn() } }));

const get = vi.mocked(apiClient.get);
const period = { startDate: '2026-11-01', endDate: '2026-11-05' };

describe('aborting a report request', () => {
  beforeEach(() => {
    get.mockReset();
    vi.mocked(notifications.show).mockReset();
  });

  it('recognises an aborted request', () => {
    expect(isRequestCanceled(new CanceledError())).toBe(true);
    expect(isRequestCanceled(new Error('boom'))).toBe(false);
  });

  it('passes the signal to the balance sheet export and does not start the legacy request when aborted', async () => {
    get.mockRejectedValueOnce(new CanceledError());
    const controller = new AbortController();

    await expect(
      balanceSheetApi.exportReport(period, 'pdf', controller.signal)
    ).rejects.toBeInstanceOf(CanceledError);
    expect(get).toHaveBeenCalledTimes(1);
    expect(get.mock.calls[0][1]).toMatchObject({ signal: controller.signal });
  });

  it('still falls back to the legacy export when the first one fails for another reason', async () => {
    get.mockRejectedValueOnce(new Error('500')).mockResolvedValueOnce({ data: new Blob(['x']) });

    await balanceSheetApi.exportReport(period, 'pdf', new AbortController().signal);
    expect(get).toHaveBeenCalledTimes(2);
  });

  it('does not wrap an aborted ledger request in an error message', async () => {
    get.mockRejectedValueOnce(new CanceledError());
    await expect(generalLedgerApi.getReport(period, 1, 20)).rejects.toBeInstanceOf(CanceledError);
    get.mockRejectedValueOnce(new CanceledError());
    await expect(generalLedgerApi.exportReport(period, 'pdf')).rejects.toBeInstanceOf(
      CanceledError
    );
  });

  it('shows no failure message when a download is aborted', async () => {
    get.mockRejectedValueOnce(new CanceledError());
    await exportReport({
      url: '/x',
      fromDate: '2026-11-01',
      toDate: '2026-11-05',
      type: 'pdf',
      filenamePrefix: 'X',
      signal: new AbortController().signal,
    });
    expect(notifications.show).not.toHaveBeenCalled();
  });

  it('still shows a failure message when a download fails', async () => {
    get.mockRejectedValueOnce(new Error('500'));
    await exportReport({
      url: '/x',
      fromDate: '2026-11-01',
      toDate: '2026-11-05',
      type: 'pdf',
      filenamePrefix: 'X',
    });
    expect(notifications.show).toHaveBeenCalledOnce();
  });
});
