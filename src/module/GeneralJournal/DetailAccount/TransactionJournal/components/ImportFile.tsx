import { Grid, Group, Text, Container, Stack, ActionIcon } from '@mantine/core';
import { IconEye, IconTrash } from '@tabler/icons-react';
import IconFiles from '@/assets/img/Document-File.svg';
import { themeColors } from '@/theme';
import { useFileStore } from '@/store/GeneralJournal/useFileStore';

const ImportFiles = () => {
    const { files, removeFile } = useFileStore((state) => ({
        files: state.files,
        removeFile: state.removeFile,
    }));
    return (
        <>
            {files.length > 0 ? (
                files.map((file) => (
                    <Group grow key={file.name}>
                        <Container
                            fluid
                            styles={(theme) => ({
                                root: {
                                    border: `1px solid ${theme.colors.dark[0]}`,
                                    borderRadius: theme.radius.md,
                                    padding: theme.spacing.md,
                                },
                            })}
                        >
                            <Grid>
                                <Grid.Col span={6}>
                                    <Group>
                                        <img src={IconFiles} alt='icons-files' />
                                        <Stack gap={5}>
                                            <Text size='12px' c={themeColors.defaultBlack[9]}>{file.name}</Text>
                                            <Text size='12px' c={themeColors.grey[5]}>{(file.size / 1024 / 1024).toFixed(2)} MB</Text>
                                        </Stack>
                                    </Group>
                                </Grid.Col>
                                <Grid.Col span={3} offset={3}>
                                    <Group justify="flex-end">
                                        <ActionIcon
                                            variant="light"
                                            color="gray"
                                            aria-label="View"
                                            size="lg"
                                            onClick={() => window.open(file.url, '_blank')}
                                        >
                                            <IconEye
                                                style={{ width: '70%', height: '70%' }}
                                                stroke={1.5}
                                                color="gray"
                                            />
                                        </ActionIcon>
                                        <ActionIcon
                                            variant="light"
                                            color="gray"
                                            aria-label="Delete"
                                            size="lg"
                                            onClick={() => removeFile(file.name)}
                                        >
                                            <IconTrash style={{ width: '70%', height: '70%' }} stroke={1.5} color="red" />
                                        </ActionIcon>
                                    </Group>
                                </Grid.Col>
                            </Grid>
                        </Container>
                    </Group>
                ))
            ) : (
                undefined
            )}
        </>
    );
};

export default ImportFiles;
