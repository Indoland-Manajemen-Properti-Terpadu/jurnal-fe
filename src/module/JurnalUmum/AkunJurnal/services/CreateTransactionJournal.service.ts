// import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
// import { del, get } from '@/services/apiClient';
// import { API_ACCOUNT } from '@/services/endpoint';
// import { useJournalAccountStore } from '@/store/JurnalUmum/useJournalAccount';
// import { notifications } from '@mantine/notifications';
// import { JournalAccounts } from '../types/JournalAccountModel';

// export const createTransactionJournal = () => {
//   const { accounts, setAccounts } = useJournalAccountStore();
//   const { data, isLoading, isError } = useQuery({
//     queryKey: ['account'],
//     queryFn: async () => {
//       const result = await get(API_ACCOUNT.GET_ALL_ACCOUNT, null);
//       return result;
//     },
//     enabled: !accounts,
//     meta: {
//       onSuccess: (data: JournalAccounts[]) => {
//         setAccounts(data);
//       },
//     },
//   });

//   return {
//     accounts: accounts || data,
//     isLoading,
//     isError,
//   };
// };
