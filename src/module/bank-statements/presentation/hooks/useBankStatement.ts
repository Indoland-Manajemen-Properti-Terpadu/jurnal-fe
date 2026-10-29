import { useQuery } from '@tanstack/react-query';
import { fetchBankStatement } from '../../infrastructure/bankStatementApi';

export const useBankStatement = (idAccount: string) =>
  useQuery({
    queryKey: ['bank_statement', idAccount],
    queryFn: () => fetchBankStatement(idAccount),
    enabled: !!idAccount,
    retry: false,
  });
