import { Group, Text, Stack, ActionIcon, Paper, Box } from '@mantine/core';
import { IconTrash, IconFileText } from '@tabler/icons-react';
import { themeColors } from '@/theme';
import { useFileStore } from '@/store/GeneralJournal/useFileStore';

const ImportFiles = () => {
    const { files, removeFile } = useFileStore((state) => ({
        files: state.files,
        removeFile: state.removeFile,
    }));
    return (
        <Stack gap="xs">
            {files.length > 0 ? (
                files.map((file) => (
                    <Paper withBorder p="xs" radius="sm" key={file.name}>
                        <Group justify="space-between" wrap="nowrap">
                            <Group gap="sm" wrap="nowrap">
                                <Box bg={themeColors.blue[0]} p={8} style={{ borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <IconFileText size={20} color={themeColors.blue[6]} />
                                </Box>
                                <Stack gap={2}>
                                    <Text size='sm' fw={500} c={themeColors.black[9]}>{file.name}</Text>
                                    <Text size='10px' c={themeColors.gray[5]}>{(file.size / 1024 / 1024).toFixed(0)} mb | 100% • Complete</Text>
                                </Stack>
                            </Group>
                            <ActionIcon
                                variant="subtle"
                                color="gray"
                                onClick={() => removeFile(file.name)}
                            >
                                <IconTrash size={18} color={themeColors.gray[3]} />
                            </ActionIcon>
                        </Group>
                    </Paper>
                ))
            ) : null}
        </Stack>
    );
};

export default ImportFiles;
