// hooks/useBankStatement.ts
import { API_ACCOUNT } from '@/services/endpoint';
import { useQuery } from '@tanstack/react-query';
import { get } from '@/lib/http/apiClient';
import { BankStatementModelV2 } from '../../domain/bankStatement';

export const useBankStatement = (idAccount: string) => {
  return useQuery<BankStatementModelV2>({
    queryKey: ['bank_statement', idAccount],
    queryFn: async () => {
      const result = await get(`${API_ACCOUNT.GET_BANK_STATEMENT}?accountId=${idAccount}`);

      console.log('BankStatement API Raw Result:', result);

      let rawResults: any[] = [];
      if (result?.data?.results && Array.isArray(result.data.results)) {
        rawResults = result.data.results;
      } else if (result?.data?.resultTransaction && Array.isArray(result.data.resultTransaction)) {
        rawResults = result.data.resultTransaction;
      } else if (result?.results && Array.isArray(result.results)) {
        rawResults = result.results;
      } else if (result?.data && Array.isArray(result.data)) {
        rawResults = result.data;
      } else if (Array.isArray(result)) {
        rawResults = result;
      }

      const mappedResults = rawResults.map((item) => ({
        ...item,
        transactionName: item.description || item.transactionName,
        transactionDate: item.date || item.transactionDate,
        debit: item.amount > 0 ? item.amount : 0,
        credit: item.amount < 0 ? Math.abs(item.amount) : 0,
        reconciled: item.isReconciled ?? item.reconciled,
      }));

      return { results: mappedResults };
    },
    enabled: !!idAccount,
    retry: false,
  });
};
