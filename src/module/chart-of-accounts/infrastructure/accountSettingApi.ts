import apiClient from '@/lib/http/apiClient';
import { API_ACCOUNT } from '@/services/endpoint';
import {
  AccountImportApiResponse,
  AccountImportParsedData,
  CommitImportPayload,
} from '../domain/settingAccount';

/**
 * Trigger file download directly in browser
 */
export const triggerBrowserDownload = (blob: Blob, filename: string) => {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
};

const XLSX_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

/**
 * Fetch a file as a blob. The default client throws on an HTTP error, so an error body is never
 * saved as a spreadsheet (R7); the status check covers a client that resolves anyway.
 */
const fetchFile = async (url: string, emptyMessage: string): Promise<Blob> => {
  const response = await apiClient.get<Blob>(url, { responseType: 'blob' });
  if (!response?.data || response.status >= 400) {
    throw new Error(emptyMessage);
  }
  const contentType = (response.headers?.['content-type'] as string) || XLSX_TYPE;
  return new Blob([response.data], { type: contentType });
};

/**
 * Download official Account Import Template (Excel / CSV)
 */
export const downloadAccountImportTemplate = async (): Promise<void> => {
  const blob = await fetchFile(
    API_ACCOUNT.GET_IMPORT_TEMPLATE_ACCOUNT,
    'Gagal mengunduh template impor akun.'
  );
  triggerBrowserDownload(blob, 'template_impor_akun.xlsx');
};

/**
 * Upload Account Import file for server validation and preview parsing
 */
export const uploadAccountImportFile = async (file: File): Promise<AccountImportParsedData> => {
  const formData = new FormData();
  formData.append('attachments', file);

  const response = await apiClient.post<AccountImportApiResponse>(
    API_ACCOUNT.POST_IMPORT_ACCOUNT,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );

  const rawData = response.data?.data;

  // Normalized structure whether backend returns array of objects or single object
  if (Array.isArray(rawData)) {
    return {
      totalData: rawData[0]?.totalData || [],
      correctData: rawData[1]?.correctData || [],
      wrongData: rawData[2]?.wrongData || [],
      wrongMessages: rawData[3]?.wrongMessages || [],
    };
  }

  return {
    totalData: rawData?.totalData || [],
    correctData: rawData?.correctData || [],
    wrongData: rawData?.wrongData || [],
    wrongMessages: rawData?.wrongMessages || [],
  };
};

/**
 * Commit the validated accounts data to persist into the system
 */
export const commitAccountImport = async (payload: CommitImportPayload): Promise<any> => {
  const response = await apiClient.post(API_ACCOUNT.POST_COMMIT_IMPORT_ACCOUNT, payload);
  return response.data;
};

/**
 * Export all Chart of Accounts into Excel / file
 */
export const downloadAccountExport = async (): Promise<void> => {
  const blob = await fetchFile(API_ACCOUNT.GET_EXPORT_ACCOUNT, 'Gagal mengekspor data bagan akun.');
  const today = new Date().toISOString().split('T')[0];
  triggerBrowserDownload(blob, `Bagan_Akun_${today}.xlsx`);
};

/**
 * Reset Chart of Accounts back to default standard configuration
 */
export const resetAccountsToDefault = async (): Promise<any> => {
  const response = await apiClient.post(API_ACCOUNT.POST_RESET_ACCOUNT);
  return response.data;
};
