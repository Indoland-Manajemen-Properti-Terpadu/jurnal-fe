import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(timezone);

export function formatDate(date: Date | null): string {
  if (!date) return '';
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export const dateFormatV1 = (date: string | Date, format: string = 'DD/MM/YYYY') => {
  const dayjsDate = typeof date === 'string' ? dayjs(date) : dayjs(date.toString());
  return dayjsDate.format(format);
};

export const dateFormatV2 = (date: string | Date, format: string = 'MMM DD, YYYY') => {
  const dayjsDate = typeof date === 'string' ? dayjs(date) : dayjs(date.toString());
  return dayjsDate.format(format);
};

export const dateFormatTimeZone = (date: string | Date | null): string => {
  if (!date) {
    return 'No data available';
  }

  return dayjs(date).tz('Asia/Jakarta').format('MMM D, YYYY [at] HH:mm:ss ([GMT]Z)');
};
