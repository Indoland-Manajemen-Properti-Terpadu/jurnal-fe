
// import { useState } from 'react';
// import { Stack } from '@mantine/core';
// import ImportBankStatement from './ImportBankStatement';
// import { BankStatementModel, BankStatementModelV2 } from '../types/BankStatementModel';
// import BankStatementTable from '../components/BankStatementTable';
// import { getBankStatement } from '../service/ListBankStatement.service';
// import { useParams } from 'react-router-dom';
// import EmptyState from '@/components/EmptyState/EmptyTable';
// import { useQueryClient } from '@tanstack/react-query';


// export default function BankStatement() {
//     const { idAccount } = useParams<{ idAccount: string }>();
//     const queryClient = useQueryClient()

//     let { data, isLoading, isError } = getBankStatement(idAccount!);
//     const [selectedRecords, setSelectedRecords] = useState<BankStatementModelV2['results']>([]);
//     const isEmpty = data?.results?.length == 0

//     const handleRefresh = () => {
//         queryClient.invalidateQueries({ queryKey: ['bank_statement', idAccount] })
//     }

//     if (isLoading) return <div>Loading...</div>;
//     if (isError) return <EmptyState />;

//     return (
//         isEmpty ? (
//             <ImportBankStatement onContinue={handleRefresh} idAccount={idAccount!} />
//         ) : (
//             <BankStatementTable
//                 records={data?.results || []}
//                 selectedRecords={selectedRecords}
//                 onSelectedRecordsChange={setSelectedRecords}
//             />
//         )
//     );
// }
