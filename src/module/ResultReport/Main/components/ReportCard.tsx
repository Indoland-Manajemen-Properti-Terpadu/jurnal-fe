import { Button, Card, Flex, Group, Stack, Text } from '@mantine/core';
import { themeColors } from '@/theme';
import { IconArrowUpRight } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';

type ReportCardProps = {
    title: string;
    description: string;
    route: string;
};

const ReportCard: React.FC<ReportCardProps> = ({ title, description, route }) => {
    const navigate = useNavigate();

    return (
        <Card withBorder radius="md" p="md" shadow="none">
            <Stack gap='md' style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                <Stack gap="md">
                    <Text c={themeColors.dark[8]} fz={16} tt="capitalize" fw={500}>
                        {title}
                    </Text>
                    <Text c={themeColors.grey[6]} fz={14} fw={400}>
                        {description}
                    </Text>
                </Stack>
                <Flex flex={1}></Flex>
                <Group justify='flex-end'>
                    <Button
                        variant="outline"
                        color={themeColors.primary[6]}
                        p="xs"
                        radius="md"
                        rightSection={<IconArrowUpRight size={16} />}
                        onClick={() => navigate(route)}
                    >
                        View Report
                    </Button>
                </Group>
            </Stack>
        </Card>
    );
};

export default ReportCard;
