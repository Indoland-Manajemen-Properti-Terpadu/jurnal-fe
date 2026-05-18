import React, { useState } from 'react';
import { Stack, Flex, Button } from '@mantine/core';
import { themeColors } from '@/theme';
import ImportBankStatementModal from '../../../BankStatement/components/ImportBankStatementModal';
import SearchActions from '../SearchAction';
import BankStatementTable from '../../../BankStatement/components/BankStatementTable';
import { Result } from '../../../BankStatement/types/BankStatementModel';

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
