import { themeColors } from '@/theme';
import { dateFormatV2 } from '@/utils/FormatDate';
import { Box, Group, Stack, Text } from '@mantine/core';

interface ReportHeaderPeriodProps {
    fromDate: string;
    toDate: string;
}

const ReportHeaderPeriod: React.FC<ReportHeaderPeriodProps> = ({ fromDate, toDate }) => {
    return (
        <Box
            bg={themeColors.teal[0]}
            bd="sm"
            p={10}
            style={{
                borderTopLeftRadius: 5,
                borderTopRightRadius: 5,
                borderColor: themeColors.gray[1],
                borderStyle: 'solid',
                borderWidth: '1px',
                borderBottomWidth: '0px'
            }}
        >
            <Group justify="space-between">
                <Stack gap={1}>
                    <Text c={themeColors.black[9]} fz={14} fw={500}>Report</Text>
                    <Text c={themeColors.gray[6]} fz={14} fw={500}>
                        Period : {dateFormatV2(fromDate)} - {dateFormatV2(toDate)}
                    </Text>
                </Stack>
                <Text c={themeColors.black[9]} fz={14} fw={500}>Total </Text>
            </Group>
        </Box >
    );
};

export default ReportHeaderPeriod;
