/**
 * The label of a journal's transaction type. A type without a translation is written out from its
 * code ("PURCHASE_BILL" becomes "Purchase Bill"), so a raw translation key never reaches the screen.
 */
export const transactionTypeLabel = (
  type: string,
  translated: (type: string) => string | undefined
): string => {
  if (!type) return '';
  return (
    translated(type) ??
    type
      .toLowerCase()
      .split('_')
      .filter(Boolean)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  );
};
