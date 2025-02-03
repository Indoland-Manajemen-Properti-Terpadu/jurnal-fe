import { Grid, Radio, MultiSelect, Text } from '@mantine/core';
interface AccountTypeRadioGroupProps {
    accountType: string;
    setField: (field: string, value: string) => void;
    individualAccountTypes: string[];
    businessAccountTypes: string[];
}


const AccountTypeRadioGroup: React.FC<AccountTypeRadioGroupProps> = ({
    accountType,
    setField,
    individualAccountTypes,
    businessAccountTypes
}) => (
    <>
        <Grid>
            <Grid.Col span={6}>
                <Text fz={14} fw={600} c="dark">
                    Account Type <span style={{ color: 'red' }}>*</span>
                </Text>
                <Text c="gray">Select the type of account</Text>
            </Grid.Col>
            <Grid.Col span={6}>
                <Radio.Group name="accountType" value={accountType} onChange={(val) => setField('accountType', val)}>
                    <Radio value="Individual" label="Individual Account" />
                    <Radio value="Business" label="Business Account" />
                </Radio.Group>
            </Grid.Col>
        </Grid>

        {accountType === 'Individual' && (
            <MultiSelect
                placeholder="Select Individual Account Type"
                data={individualAccountTypes}
                maxDropdownHeight={200}
                checkIconPosition="right"
            />
        )}
        {accountType === 'Business' && (
            <MultiSelect
                placeholder="Select Business Account Type"
                data={businessAccountTypes}
                maxDropdownHeight={200}
                checkIconPosition="right"
            />
        )}
    </>
);
