/** Positive amounts get a plus, negative amounts a minus sign (U+2212) with the absolute value. */
export const formatSignedAmount = (amount: number, money: (value: number) => string): string =>
  amount > 0 ? `+${money(amount)}` : `−${money(Math.abs(amount))}`;
