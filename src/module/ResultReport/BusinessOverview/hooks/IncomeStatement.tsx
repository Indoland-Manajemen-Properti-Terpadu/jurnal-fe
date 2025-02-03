

// import { useQuery } from '@tanstack/react-query';
// import { GetIncomeStatementReport } from '../services/IncomeStatement.service';

// export const useIncomeStatementReport = (fromDate: string | null, toDate: string | null) => {
//   const fetchReport = async () => {
//     if (!fromDate || !toDate) {
//       throw new Error("Both fromDate and toDate are required");
//     }
//     return await GetIncomeStatementReport(fromDate, toDate);
//   };

//   return useQuery(["incomeStatement", fromDate, toDate], fetchReport, {
//     enabled: !!fromDate && !!toDate, // Only fetch when dates are valid
//   });
// };
