import React from 'react';
import { Stack } from '@mantine/core';
import CashMapping from '../../../PemetaanKas/pages/CashMapping';
import SearchActions from '../SearchAction';
const CashMappingTab = () => {
    return (
        <Stack gap="md" mt="md">
            <SearchActions onDelete={() => { }} hasSelection />
            <CashMapping />
        </Stack>
    );
};

export default CashMappingTab;
