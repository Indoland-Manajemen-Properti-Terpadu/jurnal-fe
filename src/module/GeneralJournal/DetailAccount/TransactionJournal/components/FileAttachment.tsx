// utils/renderAttachments.tsx

import React from 'react';
import { Container, Grid, Group, Text, Button, Stack, ActionIcon } from '@mantine/core';
import IconFiles from '@/assets/img/Document-File.svg';
import { IconDownload, IconEye } from '@tabler/icons-react';
import { Attachment } from '../types/TransactionDetailModel';
import { themeColors } from '@/theme';


interface FileAttachmentsProps {
    attachments?: Attachment[];
}

const FileAttachments: React.FC<FileAttachmentsProps> = ({ attachments }) => {
    if (!attachments || attachments.length === 0) {
        return (
            <Text fz={14} fw={400} c={themeColors.black[9]}>
                No Attached File
            </Text>
        );
    }

    return (
        <>
            {attachments.map((attachment) => (
                <Group grow key={attachment.id}>
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
                                        <Text size='12px' c={themeColors.black[9]}>{attachment.fileName}</Text>
                                        <Text size='12px' c={themeColors.gray[5]}>{attachment.mimeType}</Text>
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
                                        onClick={() => window.open(attachment.filePath, '_blank')}
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
                                        aria-label="Download"
                                        size="lg"
                                        onClick={() => {
                                            if (attachment.filePath && attachment.fileName) {
                                                const link = document.createElement('a');
                                                link.href = `/${attachment.filePath}`;
                                                link.download = attachment.fileName;
                                                document.body.appendChild(link);
                                                link.click();
                                                document.body.removeChild(link);
                                            } else {
                                                console.error('File path or file name is undefined');
                                            }
                                        }}
                                    >
                                        <IconDownload
                                            style={{ width: '70%', height: '70%' }}
                                            stroke={1.5}
                                            color="gray"
                                        />
                                    </ActionIcon>


                                </Group>
                            </Grid.Col>



                        </Grid>
                    </Container >
                </Group>
            ))}
        </>
    );
};

export default FileAttachments;
