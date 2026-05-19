import { themeColors } from '@/theme';
import { Radio, MultiSelect, Stack, Text, Grid, Group } from '@mantine/core';

interface UserAccessRadioGroupProps {
    userAccess: UserAccessType;
    setField: (field: 'userAccess', value: UserAccessType) => void;
    specialUsers: string[];
    certainRoles: string[];
}


const UserAccessRadioGroup: React.FC<UserAccessRadioGroupProps> = ({ userAccess, setField, specialUsers, certainRoles }) => (
    <>
        <Group justify="space-between" grow>
            <Grid>
                <Grid.Col span={6}>
                    <Text fz={14} fw={600} c="dark">
                        User Access <span style={{ color: 'red' }}>*</span>
                    </Text>
                    <Text c="gray">Select the parties who can access this account</Text>
                </Grid.Col>
                <Grid.Col span={6} style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                    <Radio.Group
                        value={userAccess}
                        onChange={(value) => {
                            if (value !== null) {
                                setField('userAccess', value as UserAccessType);
                            }
                        }}
                    >
                        <Radio value="AllUsers" label="All Users" />
                        <Radio value="SpecialUsers" label="Special Users" />
                        <Radio value="CertainRoles" label="Certain Roles" />
                    </Radio.Group>
                </Grid.Col>
            </Grid>
        </Group>
        {
            userAccess === 'SpecialUsers' && (
                <Stack gap='xs'>
                    <Text fz={14} fw={600} c={themeColors.slate[6]} >
                        Special User Roles <span style={{ color: 'red' }}>*</span>
                    </Text>
                    <MultiSelect
                        placeholder="Pick value"
                        data={specialUsers}
                        maxDropdownHeight={200}
                        checkIconPosition="right"
                    />
                </Stack>
            )
        }
        {
            userAccess === 'CertainRoles' && (
                <Stack>
                    <Text fz={14} fw={600} c={themeColors.slate[6]} >
                        Certain Roles <span style={{ color: 'red' }}>*</span>
                    </Text>
                    <MultiSelect
                        placeholder="Pick value"
                        data={certainRoles}
                        maxDropdownHeight={200}
                        checkIconPosition="right"
                    />
                </Stack>
            )
        }
    </>
);

export default UserAccessRadioGroup;
