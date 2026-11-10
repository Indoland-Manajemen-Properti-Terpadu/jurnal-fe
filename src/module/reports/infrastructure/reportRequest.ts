import axios from 'axios';

const FILENAME_PATTERN = /filename\*?=(?:UTF-8'')?"?([^";]+)"?/i;

/** A failed report request with the status the server answered (400 a refusal, 403 no right). */
export class ReportRequestError extends Error {
  constructor(
    message: string,
    readonly status?: number
  ) {
    super(message);
    this.name = 'ReportRequestError';
  }
}

export const statusOf = (error: unknown): number | undefined =>
  axios.isAxiosError(error) ? error.response?.status : undefined;

/** The server's own message of a failed request, or the fallback. */
export const reportErrorMessage = (error: unknown, fallback: string): string =>
  axios.isAxiosError<{ message?: string }>(error)
    ? (error.response?.data?.message ?? fallback)
    : fallback;

/** A failed download carries its JSON message inside the blob, so the text is read back. */
export const blobErrorMessage = async (error: unknown, fallback: string): Promise<string> => {
  if (axios.isAxiosError(error) && error.response?.data instanceof Blob) {
    const text = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => resolve('');
      reader.readAsText(error.response?.data as Blob);
    });
    try {
      const { message } = JSON.parse(text) as { message?: string };
      if (message) return message;
    } catch {
      // Not JSON: use the fallback.
    }
  }
  return reportErrorMessage(error, fallback);
};

/** The file name the server gives in Content-Disposition, or the fallback. */
export const filenameFromHeader = (header: unknown, fallback: string): string =>
  FILENAME_PATTERN.exec(String(header ?? ''))?.[1] ?? fallback;
