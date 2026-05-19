import React, { useState, useEffect } from "react";
import { Button, Grid, Stack, TextInput, Notification, Select, Text, ActionIcon, Center, Menu, Group, Container, MultiSelect, Checkbox, Textarea } from "@mantine/core";
import { IconDots, IconPencil, IconTrash, IconCheck, IconX, IconChevronDown, IconPlus } from "@tabler/icons-react";
import { DataTable } from "mantine-datatable";
import { themeColors } from "@/theme";
import EmptyState from "@/components/EmptyState/EmptyTable";
import { showNotification } from "@mantine/notifications";
import { JournalAccounts } from "@/module/GeneralJournal/JournalAccount/types/JournalAccountModel";
import AdditionalAddress from "../AdditionalAddress";
import { useNavigate } from "react-router-dom";

const ContactInformationForm: React.FC = () => {
    const navigate = useNavigate();
    const [showAdditionalAddress, setShowAdditionalAddress] = useState(false);
    const [sameAsBillingAddress, setSameAsBillingAddress] = useState(false);
    return (
        <Stack gap='md'>
            <Text c={themeColors.teal[6]} fz={18} fw={500}>Add Contact Information</Text>
            <TextInput
                label="Display Name"
                withAsterisk
                placeholder="Add display name"
            />
            <Grid >
                <Grid.Col span={3}>
                    <Select
                        label="Title"
                        withAsterisk
                        placeholder="Choose title"
                        rightSection={<IconChevronDown size={14} />}
                        data={['Mr', 'Mrs', 'Ny']}

                    />
                </Grid.Col>
                <Grid.Col span={9}>
                    <TextInput
                        label="Full Name"
                        withAsterisk
                        placeholder="Add full name"
                    />
                </Grid.Col>
            </Grid>
            <MultiSelect
                label="Contact Type"
                withAsterisk
                placeholder="Contact type"
                rightSection={<IconChevronDown size={14} />}
                data={['Supplier', 'Vendor', 'Vue', 'Svelte']}

            />
            <MultiSelect
                label="Email"
                withAsterisk
                placeholder="Add email"
                rightSection={<IconChevronDown size={14} />}
                data={['Supplier', 'Vendor', 'Vue', 'Svelte']}

            />
            <Grid >
                <Grid.Col span={3}>
                    <Select
                        label="Identity"
                        withAsterisk
                        placeholder="Choose identity"
                        rightSection={<IconChevronDown size={14} />}
                        data={['KTP', 'SIM', 'Pasport']}

                    />
                </Grid.Col>
                <Grid.Col span={9}>
                    <TextInput
                        label="Identity Number"
                        withAsterisk
                        placeholder="Add number"
                    />
                </Grid.Col>
            </Grid>
            <TextInput
                label="Company Name"
                withAsterisk
                placeholder="Add company name"
            />
            <Grid >
                <Grid.Col span={6}>
                    <TextInput
                        label="Mobile Phone Number"
                        withAsterisk
                        placeholder="Add number"
                    />
                </Grid.Col>
                <Grid.Col span={6}>
                    <TextInput
                        label="Telephone Number"
                        withAsterisk
                        placeholder="Add number"
                    />
                </Grid.Col>
            </Grid>
            <Grid >
                <Grid.Col span={6}>
                    <TextInput
                        label="Fax Number"
                        withAsterisk
                        placeholder="Add fax"
                    />
                </Grid.Col>
                <Grid.Col span={6}>
                    <TextInput
                        label="Telephone Number"
                        withAsterisk
                        placeholder="Add Number"
                    />
                </Grid.Col>
            </Grid>
            <Textarea
                label="Billing Address"
                withAsterisk
                placeholder="Add address"
                resize="vertical"
            />
            <Checkbox
                checked={showAdditionalAddress}
                onChange={(event) => setShowAdditionalAddress(event.currentTarget.checked)}
                label="Additional Address Details"
            />
            {showAdditionalAddress && <AdditionalAddress />}

            {!sameAsBillingAddress && (
                <Textarea
                    label="Shipping Address"
                    withAsterisk
                    placeholder="Add address"
                    resize="vertical"
                />
            )}
            {sameAsBillingAddress && (<Text fw={500} fz={14} c={themeColors.black[9]}>
                Shipping Address <span style={{ color: 'red' }}>*</span>
            </Text>)}
            <Checkbox
                checked={sameAsBillingAddress}
                onChange={(event) => setSameAsBillingAddress(event.currentTarget.checked)}
                label="Same as billing address"
            />
        </Stack>
    );
};

export default ContactInformationForm;
