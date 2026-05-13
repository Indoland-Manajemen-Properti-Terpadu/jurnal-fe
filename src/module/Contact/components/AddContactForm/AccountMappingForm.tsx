import React, { useState, useEffect } from "react";
import { Button, Grid, Stack, TextInput, Notification, Select, Text, ActionIcon, Center, Menu, Group, Container } from "@mantine/core";
import { IconDots, IconPencil, IconTrash, IconCheck, IconX, IconChevronDown, IconPlus } from "@tabler/icons-react";
import { DataTable } from "mantine-datatable";
import { themeColors } from "@/theme";
import EmptyState from "@/components/EmptyState/EmptyTable";
import { showNotification } from "@mantine/notifications";
import { JournalAccounts } from "@/module/JurnalUmum/AkunJurnal/types/JournalAccountModel";

const AccountMappingForm: React.FC = () => {
    return (
        <Stack gap='md'>
            <Text c={themeColors.primary[6]} fz={18} fw={500}>Add Account Mapping</Text>
            <Select
                label="Accounts Receivable"
                withAsterisk
                rightSection={<IconChevronDown size={14} />}
                placeholder="Choose account"
                data={['Mandiri', 'BCA', 'BNI', 'DKI Jakarta']}
            />
            <Select
                label="Accounts Payable"
                withAsterisk
                rightSection={<IconChevronDown size={14} />}
                placeholder="Choose account"
                data={['Mandiri', 'BCA', 'BNI', 'DKI Jakarta']}
            />
            <Select
                label="Main Payment Terms"
                withAsterisk
                rightSection={<IconChevronDown size={14} />}
                placeholder="Choose account"
                data={['Net 15', 'Net 30', 'Net 60', 'Cash on Delivery']}
            />
        </Stack>
    );
};

export default AccountMappingForm;
