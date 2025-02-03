import { ActionIcon, Group, Text, TextInput, Title } from '@mantine/core';
import { useNavigate } from 'react-router';
import { DataTable, DataTableColumn } from 'mantine-datatable';
import { formatCurrency } from '@/utils/FormatCurrency';
import { dateFormatV1 } from '@/utils/FormatDate';
import EmptyState from '@/components/EmptyState/EmptyTable';
import classes from '../pages/ImportBankStatementDraft.module.css'
import { IconAdjustments, IconCalendar, IconCheck, IconPencil, IconTrash, IconX } from '@tabler/icons-react';
import { themeColors } from '@/theme';
import { Data } from '../types/ImportBankStatement.model';
import { useEffect, useState } from 'react';
import { DateInput } from '@mantine/dates';
import { format, parse } from 'date-fns';
import { useBankStatementStore } from '../store/useBankStatement.store';

interface ImportBankStatementDraftTableProps {
    records: Data[];
    typeTable: string;
}

const ImportBankStatementDraftTable = ({
    records,
    typeTable
}: ImportBankStatementDraftTableProps) => {
    const [localData, setLocalData] = useState<Data[]>([])
    const [editRowId, setEditRowId] = useState(-1);
    const {
        wrongData,
        correctData,
        setCorrectData,
        setWrongData,
        totalData,
        errorMessages,
        setShowAlert,
        setErrorMessages
    } = useBankStatementStore()

    const handleEditClick = (index: number) => {
        setEditRowId(index);
    };

    useEffect(() => {
        setLocalData(records);
    }, [records]);

    const removeItemById = (datas: Data, id: string) => {
        return datas.filter((item: Data) => item.id !== id);
    };

    const handleDateChange = (id: string, value: Date | string) => {
        const updatedData = [...localData];
        const recordIndex = updatedData.findIndex((item) => item.id === id);

        if (recordIndex > -1) {
            let formattedValue = value instanceof Date ? format(value, 'dd/MM/yyyy') : value;
            let updatedErrors = updatedData[recordIndex].errors?.filter(error => error !== "transactionDate");

            updatedData[recordIndex] = {
                ...updatedData[recordIndex],
                transactionDate: formattedValue,
                errors: updatedErrors,
            };
        }
        
        setLocalData(updatedData);
    };

    const handleNumberChange = (id: string, field: string, value: string) => {
        const updatedData = [...localData];
        const recordIndex = updatedData.findIndex((item) => item.id === id);

        const localDataF = localData.find((item) => item.id === id)
        const parsedValue = parseInt(value, 10);
        const validValue = isNaN(parsedValue) ? 0 : parsedValue;

        const updatedErrors = localDataF?.errors?.filter(error => error !== field);

        updatedData[recordIndex] = {
            ...updatedData[recordIndex],
            errors: updatedErrors,
            [field]: validValue
        };

        setLocalData(updatedData);
    };

    const handleSaveChange = (id: string) => {
        const localDataF = localData.find((item) => item.id === id)
        const countErrors = localDataF?.errors?.length
        const wrongF = wrongData.find((item: Data) => item.id === id)

        if (countErrors === 0 && localDataF) {
            const removeWrongData = removeItemById(wrongData, id)
            const updatedCorrectData = [...correctData, localDataF];

            handleErrorMessages(localDataF.transactionName!)

            if (wrongF && countErrors === 0) {
                setCorrectData(updatedCorrectData);
            } else {
                handleCorrectData(id, localDataF)
            }

            setWrongData(removeWrongData)
            handleMasterData(id, localDataF)
        }
        setEditRowId(-1);
    }

    const handleMasterData = (id: string, item: Data) => {
        const recordMasterIndex = totalData.findIndex((fi: Data) => fi.id === id);
        Object.assign(totalData[recordMasterIndex], item);
    }

    const handleCorrectData = (id: string, item: Data) => {
        const recordCorrectIndex = correctData.findIndex((fi: Data) => fi.id === id);
        Object.assign(correctData[recordCorrectIndex], item);
    }

    const handleErrorMessages = (transactionName: string) => {
        const filteredArray = errorMessages.filter((item: string) => !item.includes(transactionName));

        setErrorMessages(filteredArray)
    }

    const handleCancelChange = (index: number) => {
        const updatedData = [...localData];

        updatedData[index] = records[index];

        setLocalData(updatedData);
        setEditRowId(-1);
    }

    const columns: DataTableColumn<Data>[] = [
        {
            accessor: 'id',
            title: 'No',
            render: (element, index) => (
                <Text size="sm" c={themeColors.defaultBlack[10]}>
                    {index + 1}
                </Text>
            ),
        },
        {
            accessor: 'transactionName',
            title: 'Transaction',
            render: (element: Data, index) => (
                <Text
                    size="sm"
                    c={element.errors?.includes("transactionName") ? themeColors.red[6] : themeColors.defaultBlack[10]}
                >
                    {element.transactionName}
                </Text>
            ),
        },
        {
            accessor: 'transactionDate',
            title: 'Transaction Date',
            render: (element, index) => {
                let parsedDate = null;
                if (element.transactionDate && element.transactionDate !== '0') {
                    parsedDate = parse(element.transactionDate, 'dd/MM/yyyy', new Date());
                    if (isNaN(parsedDate.getTime())) {
                        parsedDate = null;
                    }
                }

                return index === editRowId ? (
                    <DateInput
                        valueFormat="DD/MM/YYYY"
                        rightSection={<IconCalendar />}
                        data-autofocus
                        value={parsedDate}
                        onChange={(e) => handleDateChange(element.id, e!)}
                    />
                ) : (
                    <Text
                        size="sm"
                        c={element.errors?.includes("transactionDate") ? themeColors.red[6] : themeColors.defaultBlack[10]}
                    >
                        {element.transactionDate ? element.transactionDate : '-'}
                    </Text>
                );
            },
        },
        {
            accessor: 'debit',
            title: 'Received',
            render: (element, index) => (
                index === editRowId ? (
                    <TextInput
                        disabled={element?.credit ? true : false}
                        leftSectionPointerEvents="none"
                        leftSection="Rp"
                        data-autofocus
                        value={element.debit}
                        onChange={(e) => handleNumberChange(element.id, 'debit', e.currentTarget.value)}
                    />
                ) : (
                    <Text
                        size="sm"
                        c={element.errors?.includes("debit") ? themeColors.red[6] : themeColors.defaultBlack[10]}
                    >
                        {formatCurrency(element.debit || 0)}
                    </Text>
                )
            ),
        },
        {
            accessor: 'credit',
            title: 'Sent',
            render: (element, index) => (
                index === editRowId ? (
                    <TextInput
                        disabled={element?.debit ? true : false}
                        leftSectionPointerEvents="none"
                        leftSection="Rp"
                        data-autofocus
                        value={element.credit}
                        onChange={(e) => handleNumberChange(element.id, 'credit', e.currentTarget.value)}
                    />
                ) : (
                    <Text
                        size="sm"
                        c={element.errors?.includes("credit") ? themeColors.red[6] : themeColors.defaultBlack[10]}
                    >
                        {formatCurrency(element.credit || 0)}
                    </Text>
                )
            ),
        },
        {
            accessor: 'action',
            title: 'Action',
            render: (element, index) => (
                index === editRowId ? (
                    <Group>
                        <ActionIcon variant="default" onClick={() => handleSaveChange(element.id)}>
                            <IconCheck style={{ width: '70%', height: '70%' }} stroke={1.5} />
                        </ActionIcon>
                        <ActionIcon variant="default" onClick={() => handleCancelChange(index)}>
                            <IconX style={{ width: '70%', height: '70%' }} stroke={1.5} />
                        </ActionIcon>
                    </Group>
                ) : (
                    <Group>
                        <ActionIcon
                            variant="default"
                            aria-label="Settings"
                            onClick={() => handleEditClick(index)}
                        >
                            <IconPencil style={{ width: '70%', height: '70%' }} stroke={1.5} />
                        </ActionIcon>
                        <ActionIcon
                            variant="default"
                            aria-label="Settings"
                        >
                            <IconTrash style={{ width: '70%', height: '70%' }} stroke={1.5} />
                        </ActionIcon>
                    </Group>
                )
            ),
        },
    ];

    return (
        <DataTable
            withTableBorder
            minHeight={500}
            highlightOnHover
            fz="sm"
            className={classes.tableBorder}
            columns={columns}
            records={localData}
            emptyState={<EmptyState />}
            rowStyle={(record) => ({
                backgroundColor: record.errors && record.errors.length > 0 ? themeColors.red[0] : 'inherit',
            })}
        />
    );
};

export default ImportBankStatementDraftTable;
