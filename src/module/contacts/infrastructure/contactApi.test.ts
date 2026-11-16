import { AxiosError } from 'axios';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import apiClient from '@/lib/http/apiClient';
import { ContactImportError } from '@/module/contacts/domain/contactImport';
import { importContacts } from './contactApi';

vi.mock('@/lib/http/apiClient', () => ({ default: { post: vi.fn() } }));

const post = vi.mocked(apiClient.post);
const refused = (data: unknown, status = 400) =>
  new AxiosError('failed', String(status), undefined, undefined, {
    status,
    statusText: '',
    data,
    headers: {},
    config: {} as never,
  });
const file = new File(['x'], 'kontak.xlsx');

describe('importContacts', () => {
  beforeEach(() => {
    post.mockReset();
  });

  it('turns a 400 with row details into an error that carries them', async () => {
    post.mockRejectedValue(
      refused({
        code: 400,
        message: 'Impor dibatalkan: 1 dari 1 baris tidak valid.',
        data: [{ row: 6, field: 'Identity Number', message: 'NIK KTP harus 16 digit angka' }],
      })
    );

    const error = await importContacts(file).catch((caught) => caught);
    expect(error).toBeInstanceOf(ContactImportError);
    expect(error.message).toBe('Impor dibatalkan: 1 dari 1 baris tidak valid.');
    expect(error.issues).toEqual([
      { row: 6, field: 'Identity Number', reason: 'NIK KTP harus 16 digit angka' },
    ]);
  });

  it('leaves any other failure as it came', async () => {
    const plain = refused({ message: 'Import validation failed' });
    post.mockRejectedValue(plain);
    await expect(importContacts(file)).rejects.toBe(plain);
  });

  it('returns the count of a good import', async () => {
    post.mockResolvedValue({ data: { data: { imported: 3 } } } as never);
    await expect(importContacts(file)).resolves.toEqual({ imported: 3 });
  });
});
