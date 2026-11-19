import { useDocNotifier } from './useDocNotifier';

/** Success, warning and failure messages of quote actions, in the active language. */
export const useQuoteNotifier = () => useDocNotifier('salesQuotes');
