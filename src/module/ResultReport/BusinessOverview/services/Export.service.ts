import { download } from '@/services/apiClient';

interface ExportReportParams {
  url: string; // The endpoint for the report
  fromDate: string; // Start date of the report
  toDate: string; // End date of the report
  type: string; // File type (e.g., 'pdf', 'xlsx')
  filenamePrefix: string; // Prefix for the default filename
  errorNoData?: string; // Custom error message for no data
  errorExportFailed?: string; // Custom error message for export failure
}

const getFilenameFromContentDisposition = (
  contentDisposition: string,
  defaultFilename: string
): string => {
  const matches = contentDisposition.match(/filename="([^"]+)"/);
  return matches?.[1] || defaultFilename;
};

export const exportReport = async ({
  url,
  fromDate,
  toDate,
  type,
  filenamePrefix,
  errorNoData = 'No data received from the server.',
  errorExportFailed = 'Failed to export the report. Please try again.',
}: ExportReportParams) => {
  try {
    const response = await download(url, { fromDate, toDate, type });
    if (!response || !response.data) {
      throw new Error(errorNoData);
    }

    const contentDisposition = response.headers['content-disposition'];
    const defaultFilename = `${filenamePrefix}-${fromDate}_${toDate}.${type}`;
    const filename = contentDisposition
      ? getFilenameFromContentDisposition(contentDisposition, defaultFilename)
      : defaultFilename;

    const blob = new Blob([response.data]);
    const urlObject = window.URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = urlObject;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);
    window.URL.revokeObjectURL(urlObject);
  } catch (error) {
    console.error(error);
    alert(errorExportFailed);
  }
};
