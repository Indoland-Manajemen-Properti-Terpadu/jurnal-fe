import { format } from 'date-fns';

const moneyFormatter = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  minimumFractionDigits: 0,
  maximumFractionDigits: 20,
});

const countFormatter = new Intl.NumberFormat('id-ID');

export const formatMoney = (value: number) => moneyFormatter.format(value);
export const formatCount = (value: number) => countFormatter.format(value);
export const dateOnly = (value: Date) => format(value, 'yyyy-MM-dd');

export function displayDate(value: string): string {
  const datePart = value.slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(datePart)) return value;
  return `${datePart.slice(8, 10)}/${datePart.slice(5, 7)}/${datePart.slice(0, 4)}`;
}
