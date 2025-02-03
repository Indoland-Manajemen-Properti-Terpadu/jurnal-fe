import { useState } from 'react';

export function useSelectionHandler<T>(initialSelection: T[] = []) {
  const [selectedRecords, setSelectedRecords] = useState<T[]>(initialSelection);

  const safeSetSelectedRecords = (value: T[] | ((prev: T[]) => T[])) => {
    if (typeof value === 'function') {
      setSelectedRecords((prev) => value(prev));
    } else {
      setSelectedRecords(value);
    }
  };

  return { selectedRecords, setSelectedRecords: safeSetSelectedRecords };
}
