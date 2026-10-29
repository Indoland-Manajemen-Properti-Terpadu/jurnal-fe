import React, { useState } from 'react';
import { Stack, Flex, Button } from '@mantine/core';
import { themeColors } from '@/theme';
import ImportBankStatementModal from '@/module/bank-statements/presentation/components/ImportBankStatementModal';
import SearchActions from '../SearchAction';
import BankStatementTable from '@/module/bank-statements/presentation/components/BankStatementTable';
import { Result } from '@/module/bank-statements/domain/bankStatement';

interface Props {
    selectedRecords: Result[];
    setSelectedRecords: React.Dispatch<React.SetStateAction<Result[]>>;
    idAccount: string;
    onRefresh: () => void;
}

const BankStatementTab = ({ selectedRecords, setSelectedRecords, idAccount, onRefresh }: Props) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const handleOpenModal = () => setIsModalOpen(true);
    const handleCloseModal = () => setIsModalOpen(false);

    return (
        <Stack gap="md">
            <BankStatementTable
                selectedRecords={selectedRecords}
                setSelectedRecords={setSelectedRecords}
            />
        </Stack>
    );
};

export default BankStatementTab;
