import dayjs from 'dayjs';

export const formatDateTime = (value: string): string =>
  value ? dayjs(value).format('DD/MM/YYYY HH:mm') : '';

export const formatDay = (value: string): string =>
  value ? dayjs(value).format('DD/MM/YYYY') : '';
