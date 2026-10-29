import React from 'react';
import { Stack } from '@mantine/core';
import { BankStatementTable, type BankStatementRow } from '@/module/bank-statements';

interface Props {
  selectedRecords: BankStatementRow[];
  setSelectedRecords: React.Dispatch<React.SetStateAction<BankStatementRow[]>>;
  idAccount: string;
  onRefresh: () => void;
}

const BankStatementTab = ({ selectedRecords, setSelectedRecords }: Props) => (
  <Stack gap="md">
    <BankStatementTable selectedRecords={selectedRecords} setSelectedRecords={setSelectedRecords} />
  </Stack>
);

export default BankStatementTab;
