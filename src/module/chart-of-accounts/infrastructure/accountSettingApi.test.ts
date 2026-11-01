import { beforeEach, describe, expect, it, vi } from 'vitest';
import { API_ACCOUNT } from '@/lib/http/endpoints';
import {
  commitAccountImport,
  downloadAccountExport,
  downloadAccountImportTemplate,
  resetAccountsToDefault,
  uploadAccountImportFile,
} from './accountSettingApi';

const http = vi.hoisted(() => ({ get: vi.fn(), post: vi.fn() }));

vi.mock('@/lib/http/apiClient', () => ({
  default: { get: http.get, post: http.post },
}));

const XLSX = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

describe('accountSettingApi', () => {
  let anchors: HTMLAnchorElement[];

  beforeEach(() => {
    vi.clearAllMocks();
    anchors = [];
    window.URL.createObjectURL = vi.fn(() => 'blob:mock');
    window.URL.revokeObjectURL = vi.fn();
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function click(
      this: HTMLAnchorElement
    ) {
      anchors.push(this);
    });
  });

  describe('file download (characterization)', () => {
    it('saves the template under its fixed file name', async () => {
      http.get.mockResolvedValue({ status: 200, data: new Blob(['x']), headers: {} });

      await downloadAccountImportTemplate();

      expect(http.get).toHaveBeenCalledWith(API_ACCOUNT.GET_IMPORT_TEMPLATE_ACCOUNT, {
        responseType: 'blob',
      });
      expect(anchors).toHaveLength(1);
      expect(anchors[0].download).toBe('template_impor_akun.xlsx');
      expect(window.URL.revokeObjectURL).toHaveBeenCalledWith('blob:mock');
    });

    it('saves the export as Bagan_Akun_<date>.xlsx and keeps the server content type', async () => {
      http.get.mockResolvedValue({
        status: 200,
        data: new Blob(['x']),
        headers: { 'content-type': XLSX },
      });

      await downloadAccountExport();

      expect(http.get).toHaveBeenCalledWith(API_ACCOUNT.GET_EXPORT_ACCOUNT, {
        responseType: 'blob',
      });
      expect(anchors[0].download).toMatch(/^Bagan_Akun_\d{4}-\d{2}-\d{2}\.xlsx$/);
    });

    it('does not save an error response body as a spreadsheet (R7)', async () => {
      http.get.mockResolvedValue({
        status: 500,
        data: new Blob(['{"message":"server error"}']),
        headers: { 'content-type': 'application/json' },
      });

      await expect(downloadAccountExport()).rejects.toThrow();
      await expect(downloadAccountImportTemplate()).rejects.toThrow();
      expect(anchors).toHaveLength(0);
    });

    it('lets a request error reach the caller and saves nothing (R7)', async () => {
      const error = new Error('Request failed with status code 500');
      http.get.mockRejectedValue(error);

      await expect(downloadAccountExport()).rejects.toBe(error);
      await expect(downloadAccountImportTemplate()).rejects.toBe(error);
      expect(anchors).toHaveLength(0);
    });

    it('throws when there is no body', async () => {
      http.get.mockResolvedValue(null);
      await expect(downloadAccountExport()).rejects.toThrow('Gagal mengekspor data bagan akun.');
      await expect(downloadAccountImportTemplate()).rejects.toThrow(
        'Gagal mengunduh template impor akun.'
      );
      expect(anchors).toHaveLength(0);
    });
  });

  describe('import, commit and reset (characterization)', () => {
    it('posts the file as multipart form data and normalizes an array response', async () => {
      http.post.mockResolvedValue({
        data: {
          data: [
            { totalData: [{ accountNumber: '1', name: 'a' }] },
            { correctData: [{ accountNumber: '1', name: 'a' }] },
            { wrongData: [] },
            { wrongMessages: [['x']] },
          ],
        },
      });

      const file = new File(['x'], 'akun.xlsx');
      const result = await uploadAccountImportFile(file);

      const [url, body, config] = http.post.mock.calls[0];
      expect(url).toBe(API_ACCOUNT.POST_IMPORT_ACCOUNT);
      expect((body as FormData).get('attachments')).toBe(file);
      expect(config).toEqual({ headers: { 'Content-Type': 'multipart/form-data' } });
      expect(result.correctData).toHaveLength(1);
      expect(result.wrongMessages).toEqual([['x']]);
    });

    it('normalizes an object response and fills missing lists with empty arrays', async () => {
      http.post.mockResolvedValue({ data: { data: { correctData: [{ accountNumber: '2' }] } } });
      const result = await uploadAccountImportFile(new File(['x'], 'a.csv'));
      expect(result).toEqual({
        totalData: [],
        correctData: [{ accountNumber: '2' }],
        wrongData: [],
        wrongMessages: [],
      });
    });

    it('lets upload, commit and reset errors reach the caller', async () => {
      const error = new Error('boom');
      http.post.mockRejectedValue(error);
      await expect(uploadAccountImportFile(new File(['x'], 'a.csv'))).rejects.toBe(error);
      await expect(commitAccountImport({ correctData: [] })).rejects.toBe(error);
      await expect(resetAccountsToDefault()).rejects.toBe(error);
    });

    it('commits and resets through their endpoints and returns the body', async () => {
      http.post.mockResolvedValue({ data: { ok: true } });
      const payload = { correctData: [{ accountNumber: '1', name: 'a' }] };

      await expect(commitAccountImport(payload)).resolves.toEqual({ ok: true });
      expect(http.post).toHaveBeenCalledWith(API_ACCOUNT.POST_COMMIT_IMPORT_ACCOUNT, payload);
      await expect(resetAccountsToDefault()).resolves.toEqual({ ok: true });
      expect(http.post).toHaveBeenCalledWith(API_ACCOUNT.POST_RESET_ACCOUNT);
    });
  });
});
