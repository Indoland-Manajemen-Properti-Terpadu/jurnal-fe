export function formatCurrency(amount: number, withDecimals: boolean = true): string {
  return amount.toLocaleString('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: withDecimals ? 2 : 0,
    maximumFractionDigits: withDecimals ? 2 : 0,
  });
}

export function sanitizedInput(amount: string): number {
  return parseInt(amount.replace(/^0+(?=\d)/, ''), 10);
}

export function numberFormat(value: number | undefined): string {
  return new Intl.NumberFormat('id-ID', {}).format(value || '0');
}
