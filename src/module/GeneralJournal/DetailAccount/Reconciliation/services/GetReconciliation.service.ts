import { API_ACCOUNT } from '@/services/endpoint';
import { useQuery } from '@tanstack/react-query';
import { get } from '@/services/apiClient';
import { GetReconciliationModel } from '../types/GetReconciliationModel';

export const GetReconciliation = (idAccount: string) => {
  return useQuery<GetReconciliationModel>({
    queryKey: ['get_reconciliation', idAccount],
    queryFn: async () => {
      const result = await get(`${API_ACCOUNT.GET_RECONCILIATION}${idAccount}`);
      console.log('GetReconciliation Raw Result:', {
        fullResult: result,
        resultData: result?.data,
        hasBankStatements: !!result?.data?.bankStatements,
      });

      const data = result?.data || result;

      // Calculate balance from top recommendation if not provided
      let calculatedBalance = data?.balance;
      if (!calculatedBalance && data?.bankStatements) {
        let totalDebit = 0;
        let totalCredit = 0;

        data.bankStatements.forEach((bs: any) => {
          // Take only the top recommendation from each bank statement
          if (bs.recommendations && bs.recommendations.length > 0) {
            const topRecommendation = bs.recommendations[0];
            if (topRecommendation?.journalDetail) {
              const jd = topRecommendation.journalDetail;
              totalDebit += jd.debit || 0;
              totalCredit += jd.credit || 0;
            }
          }
        });

        calculatedBalance = totalDebit - totalCredit;
      }

      return {
        ...data,
        balance: calculatedBalance || 0,
      };
    },
    enabled: !!idAccount,
    retry: false,
  });
};
