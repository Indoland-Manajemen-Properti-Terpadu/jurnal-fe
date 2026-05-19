import { DataTable, DataTableRowExpansionProps } from 'mantine-datatable';
import { ActionIcon, Button, Group, Text, TextInput, Title } from '@mantine/core';
import { useEffect, useState } from 'react';
import { gradientColors, themeColors } from '@/theme';
import { formatCurrency, numberFormat, sanitizedInput } from '@/utils/FormatCurrency';
import classes from '../pages/BeginningBalance.module.css';
import EmptyState from '@/components/EmptyState/EmptyTable';
import defaultEmptyImage from '@/assets/img/Empty-Dataa.svg';
import { useInitialBalanceStore } from '@/store/GeneralJournal/initialBalanceAccount';
import { JournalAccounts } from '../../JournalAccount/types/JournalAccountModel';

type TableBeginningBalanceProps = {
    data: JournalAccounts[];
};

const TableBeginningBalance = ({ data }: TableBeginningBalanceProps) => {
    const [localData, setLocalData] = useState<JournalAccounts[]>([]);
    const { countData, setAccounts } = useInitialBalanceStore();

    useEffect(() => {
        if (data.length > 0) {
            setAccounts(data)
            setLocalData(data);
        }
    }, [data]);

    console.log(` Local Data ${localData}`);

    const handleInputChange = (index: number, field: 'debit' | 'credit', value: string) => {
        const sanitizedValue = sanitizedInput(value) || 0;
        const updatedData = [...localData];
        updatedData[index] = { ...updatedData[index], [(field)]: sanitizedValue };
        setLocalData(updatedData);
        countData(updatedData)
        setAccounts(updatedData)
    };



    const columns = [
        {
            accessor: 'accountNumber',
            title: 'Code',
            width: 100,
            noWrap: true,
            render: ({ accountNumber }: JournalAccounts) => (
                <Group>
                    <Text className={classes.columnText} c={themeColors.black[9]}>
                        {accountNumber}
                    </Text>
                </Group>
            ),
        },
        {
            accessor: 'name',
            width: 200,
            title: 'Account Name',
            render: (item: JournalAccounts) => (
                <Text
                    variant="gradient"
                    gradient={gradientColors.mainGR}
                    className={classes.accountNameColumn}
                >
                    {item.name}
                </Text>
            ),
        },
        {
            accessor: 'debit',
            title: (
                <Title size="h6" ta="left">
                    Debit
                </Title>
            ),
            width: 160,
            cellsStyle: (item: JournalAccounts) => () => {
                if (!item.category?.isDebit) {
                    return {
                        background: themeColors.red[0],
                    };
                }
            },
            render: (item: JournalAccounts, index: number) => (
                <Group justify='space-between'>
                    <TextInput
                        disabled={!item.category?.isDebit}
                        leftSectionPointerEvents="none"
                        data-autofocus
                        // value={formatCurrency(localData[index]?.debit ? (localData[index]?.debit) : 0)}
                        value={numberFormat(localData[index]?.debit)}
                        leftSection='Rp '
                        onChange={(e) => {
                            const intValue = parseInt(e.target.value.replaceAll('.', ''), 10);
                            console.log(intValue);
                            handleInputChange(index, 'debit', `${intValue}`)
                        }
                        }
                        styles={{
                            input: {
                                backgroundColor: 'transparent',
                                color: 'inherit',
                                border: 'none',
                                outline: 'none',
                                boxShadow: 'none',
                            },
                        }}
                    />
                </Group>
            ),
        },
        {
            accessor: 'credit',
            title: (
                <Title size="h6" ta="left">
                    Credit
                </Title>
            ),
            cellsStyle: (item: JournalAccounts) => () => {
                if (item.category?.isDebit) {
                    return {
                        background: themeColors.red[0],
                    };
                }
            },
            width: 160,
            render: (item: JournalAccounts, index: number) => (
                <Group justify='space-between'>
                    <TextInput
                        disabled={item.category?.isDebit}
                        leftSectionPointerEvents="none"
                        data-autofocus
                        min={0}
                        value={numberFormat(localData[index]?.credit)}
                        leftSection='Rp '
                        onChange={(e) => {
                            const intValue = parseInt(e.target.value.replaceAll('.', ''), 10);
                            console.log(intValue);
                            handleInputChange(index, 'credit', `${intValue}`)
                        }
                        }
                        styles={{
                            input: {
                                backgroundColor: 'transparent',
                                color: 'inherit',
                                border: 'none',
                                outline: 'none',
                                boxShadow: 'none',
                            },
                        }}
                    />
                </Group>
            ),
        },
    ];

    return (
        <DataTable
            classNames={{ header: classes.tableHeader }}
            withTableBorder
            records={localData}
            columns={columns}
            borderRadius="md"
            c={themeColors.black[9]}
            minHeight={300}
            emptyState={
                <EmptyState
                    title="There is no data account available yet"
                    imageSrc={defaultEmptyImage}
                    imageAlt="No data found"
                />
            }
            loaderType="bars"
            loaderBackgroundBlur={2}
        />
    );
};

export default TableBeginningBalance;
