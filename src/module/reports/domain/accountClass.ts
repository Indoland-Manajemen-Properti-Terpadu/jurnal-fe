/**
 * The chart of accounts numbers its classes by the first digit: 1 assets, 2 liabilities, 3 equity,
 * 4 revenue, 5 cost of goods sold, 6 expenses, 7 other income, 8 other expenses. An account whose
 * number starts otherwise goes to `other`. Reports group their accounts under these classes.
 */
export type AccountClass = '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | 'other';

export const accountClassOf = (accountNumber: string): AccountClass => {
  const digit = accountNumber.trim().charAt(0);
  return digit >= '1' && digit <= '8' ? (digit as AccountClass) : 'other';
};

const CLASS_ORDER: AccountClass[] = ['1', '2', '3', '4', '5', '6', '7', '8', 'other'];

export interface AccountClassGroup<T> {
  key: AccountClass;
  items: T[];
}

/** Groups items by the class of their account number, in chart order, leaving out empty classes. */
export const groupByAccountClass = <T>(
  items: T[],
  numberOf: (item: T) => string
): AccountClassGroup<T>[] =>
  CLASS_ORDER.map((key) => ({
    key,
    items: items.filter((item) => accountClassOf(numberOf(item)) === key),
  })).filter((group) => group.items.length > 0);
