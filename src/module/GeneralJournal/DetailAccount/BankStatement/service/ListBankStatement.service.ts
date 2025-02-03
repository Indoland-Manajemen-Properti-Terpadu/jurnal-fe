// hooks/useBankStatement.ts
import { API_ACCOUNT } from '@/services/endpoint';
import { useQuery } from '@tanstack/react-query';
import { get } from '@/services/apiClient';
import { BankStatementModelV2 } from '../types/BankStatementModel';

export const getBankStatement = (idAccount: string) => {
  return useQuery<BankStatementModelV2>({
    queryKey: ['bank_statement', idAccount],
    queryFn: async () => {
      const result = await get(`${API_ACCOUNT.GET_BANK_STATEMENT}/${idAccount}`);
      return result;
    },
    enabled: !!idAccount,
    retry: false,
  });
};
