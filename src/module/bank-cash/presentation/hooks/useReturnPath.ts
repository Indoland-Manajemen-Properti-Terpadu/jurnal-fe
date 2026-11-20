import { useSearchParams } from 'react-router-dom';
import { safeReturnTo } from '@/module/bank-cash/domain/accountPrefill';
import { routes } from '@/router/routes';

/** Where a posting form goes after saving or leaving: the page that opened it, else Kas & Bank. */
export const useReturnPath = (): string => {
  const [searchParams] = useSearchParams();
  return safeReturnTo(searchParams.get('returnTo')) ?? routes.bankCash.main;
};
