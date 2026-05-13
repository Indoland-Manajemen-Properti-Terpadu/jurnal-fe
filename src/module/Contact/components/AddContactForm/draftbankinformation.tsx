// import { ActionIcon, Anchor, Button, Center, Checkbox, Text, Flex, Grid, Menu, Paper, PaperProps, rem, Select, Stack, Table, TextInput, Container, Group } from '@mantine/core';
// import { themeColors } from '@/theme';
// import { IconChevronDown, IconDots, IconInfoCircle, IconPencil, IconSearch, IconTrash } from '@tabler/icons-react';
// import { useNavigate } from 'react-router-dom';
// import { useDeleteJurnalAccount } from '@/module/JurnalUmum/AkunJurnal/service/DeleteTransaction.service';
// import { useEffect, useState } from 'react';
// import { GetJournalAccounts } from '@/module/JurnalUmum/AkunJurnal/service/AccountJournal.service';
// import { NotFound } from '@/components/ErrorPage/NotFound';
// import EmptyState from '@/components/EmptyState/EmptyTable';
// import { formatCurrency } from '@/utils/FormatCurrency';
// import BadgeStatusReconciled from '@/module/JurnalUmum/LaporanBank/components/BadgeStatus';
// import { dateFormatV1 } from '@/utils/FormatDate';
// import { JournalAccounts } from '@/module/JurnalUmum/AkunJurnal/types/JournalAccountModel';
// import { DataTable } from 'mantine-datatable';




// const TableListBankInformation = () => {
//     const { accounts, isError, isEmpty } = GetJournalAccounts();
//     const JournalAccounts = Array.isArray(accounts) ? accounts : [];
//     const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
//     const [selectedRecords, setSelectedRecords] = useState<JournalAccounts[]>([]);
//     const [searchQuery, setSearchQuery] = useState<string>('');
//     const { mutate: deleteAccount } = useDeleteJurnalAccount();


//     if (isError) {
//         return <NotFound />;
//     }

//     if (isEmpty) {
//         return <EmptyState />;
//     }

//     const accountBankAndCash = JournalAccounts.filter((account) => account.isBankAndCash === true);

//     const searchData = (event: React.ChangeEvent<HTMLInputElement>) => {
//         setSearchQuery(event.currentTarget.value);
//     };


//     const handleDeleteAccount = () => {
//         const ids = {
//             accountIds: selectedRecords.map((item) => item.id),
//         };
//         deleteAccount(ids);
//     };


//     const columns = [
//         {
//             accessor: 'bank',
//             title: <Text size="sm" fz={14} fw={500} c={themeColors.defaultBlack[10]} >Bank</Text>,
//             render: () => (
//                 <Text c={themeColors.defaultBlack[10]} size="sm">
//                     PT Bank Mandiri (Persero) Tbk
//                 </Text>
//             ),
//         },
//         {
//             accessor: 'branch',
//             title: <Text size="sm" fz={14} fw={500} ta='center' c={themeColors.defaultBlack[10]} >Branch</Text>,
//             render: () => (
//                 <Text size="sm" fz={14} fw={400} c={themeColors.defaultBlack[10]} ta='center'>
//                     Bekasi
//                 </Text>
//             ),
//         },
//         {
//             accessor: 'accountHolder',
//             title: <Text size="sm" fz={14} fw={500} c={themeColors.defaultBlack[10]} >Account Holder</Text>,
//             render: () => (
//                 <Text c={themeColors.defaultBlack[10]} size="sm">
//                     Raga Murtad
//                 </Text>
//             ),
//         },
//         {
//             accessor: 'accountNumber',
//             title: <Text size="sm" fz={14} fw={500} c={themeColors.defaultBlack[10]} >Account Number</Text>,
//             render: () => (
//                 <Text c={themeColors.defaultBlack[10]} size="sm">
//                     123-456-7890
//                 </Text>
//             ),
//         },
//         {
//             accessor: 'reconciled',
//             title: <Text size="sm" fz={14} fw={500} ta='center' c={themeColors.defaultBlack[10]} >Action</Text>,
//             render: () =>
//                 <Center>
//                     <Menu position="bottom-end">
//                         <Menu.Target>
//                             <ActionIcon bg={themeColors.grey[0]}>
//                                 <IconDots size={14} color={themeColors.grey[6]} />
//                             </ActionIcon>
//                         </Menu.Target>
//                         <Menu.Dropdown>
//                             <Menu.Item
//                                 leftSection={<IconPencil style={{ width: rem(14), height: rem(14) }} />}
//                                 component="a"
//                             >
//                                 Edit
//                             </Menu.Item>
//                             <Menu.Item
//                                 leftSection={<IconTrash style={{ width: rem(14), height: rem(14) }} />}
//                                 component="a"
//                                 c={themeColors.red[6]}
//                                 target="_blank"
//                             >
//                                 Delete
//                             </Menu.Item>
//                         </Menu.Dropdown>
//                     </Menu>
//                 </Center>
//         }

//     ];

//     return (
//         <Stack gap="lg">
//             <Grid align="flex-end">
//                 <Grid.Col span={6}>
//                     <TextInput
//                         leftSectionPointerEvents="none"
//                         leftSection={<IconSearch size={14} />}
//                         placeholder="Find Bank"
//                         size='xs'
//                         value={searchQuery}
//                         onChange={searchData}
//                     />
//                 </Grid.Col>
//                 <Grid.Col span={6} style={{ display: "flex", justifyContent: "flex-end" }}>
//                     {selectedRecords.length > 0 && (
//                         <Button
//                             onClick={handleDeleteAccount}
//                             color={themeColors.red[6]}
//                             size='xs'
//                             leftSection={<IconTrash size={14}
//                             />}
//                         >
//                             Delete Account
//                         </Button>
//                     )}
//                 </Grid.Col>
//             </Grid>

//             {isEmpty ? (
//                 <>
//                     <Container fluid p='xl'>
//                         <EmptyState />
//                     </Container>
//                 </>
//             ) : (
//                 <DataTable
//                     withTableBorder
//                     borderRadius="md"
//                     highlightOnHover
//                     fz="sm"
//                     selectedRecords={selectedRecords}
//                     onSelectedRecordsChange={setSelectedRecords}
//                     columns={columns}
//                     records={accountBankAndCash}
//                 />
//             )
//             }
//         </Stack >
//     );
// }

// export default TableListBankInformation;