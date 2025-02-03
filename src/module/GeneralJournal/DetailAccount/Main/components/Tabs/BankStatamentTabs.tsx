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
            <Flex justify="space-between" align="center" mt="md">
                <SearchActions
                    onDelete={() => setSelectedRecords([])}
                    hasSelection={selectedRecords.length > 0}
                />
                <Button
                    size="xs"
                    variant="outline"
                    color={themeColors.blue[6]}
                    onClick={handleOpenModal}
                >
                    Import Bank Statement
                </Button>
                <ImportBankStatementModal
                    idAccount={idAccount}
                    onContinue={onRefresh}
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                />
            </Flex>
            <BankStatementTable
                selectedRecords={selectedRecords}
                setSelectedRecords={setSelectedRecords}
            />
        </Stack>
    );
};

export default BankStatementTab;
