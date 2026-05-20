import { Group, Stack, Text, rem, ActionIcon, Paper, Box } from '@mantine/core';
import { IconUpload, IconX, IconTrash, IconFileText } from '@tabler/icons-react';
import {
  Dropzone,
  DropzoneProps,
  FileRejection,
  FileWithPath,
  MIME_TYPES,
} from '@mantine/dropzone';
import { themeColors } from '@/theme';
import { useFileStore } from '@/store/GeneralJournal/useFileStore';
import { CloudArrowUpIcon } from '@phosphor-icons/react';
import { themeText } from '@/theme/constants';

interface DropzoneComponentProps extends Partial<DropzoneProps> {
  title?: string;
  maxSize?: number;
  accept?: string[];
  onReject?: (files: FileRejection[]) => void;
  handleDrop?: (files: FileWithPath[]) => void;
  description?: React.ReactNode;
  uploadedTitle?: string;
  showUploadedFiles?: boolean;
}

const CustomDropzone: React.FC<DropzoneComponentProps> = ({
  title = 'ss',
  maxSize = 5 * 1024 ** 2,
  accept = [MIME_TYPES.csv],
  onReject,
  handleDrop,
  description = 'Attach csv file, the file should not exceed 5mb',
  uploadedTitle = 'File Terunggah',
  showUploadedFiles = true,
  ...props
}) => {
  const files = useFileStore((state) => state.files);
  const removeFile = useFileStore((state) => state.removeFile);
  const hasFiles = showUploadedFiles && files.length > 0;

  return (
    <Stack gap="xs">
      <Text style={themeText.label.label2} c={themeColors.black[0]}>{title}</Text>
      <Dropzone
        title={title}
        onDrop={(f) => handleDrop && handleDrop(f)}
        onReject={onReject}
        maxSize={maxSize}
        accept={accept}
        {...props}
        styles={(theme) => ({
          root: {
            border: `1px dashed ${theme.colors.dark[0]}`,
            borderRadius: theme.radius.md,
            padding: theme.spacing.md,
          },
        })}
      >
        <Stack align="center" p="md">
          <Dropzone.Accept>
            <IconUpload
              style={{ width: rem(52), height: rem(52), color: 'var(--mantine-color-blue-6)' }}
              stroke={1.5}
            />
          </Dropzone.Accept>
          <Dropzone.Reject>
            <IconX
              style={{ width: rem(52), height: rem(52), color: 'var(--mantine-color-red-6)' }}
              stroke={1.5}
            />
          </Dropzone.Reject>
          <Dropzone.Idle>
            <CloudArrowUpIcon
              style={{ width: rem(52), height: rem(52) }}
              color={themeColors.teal[5]}
              weight="duotone"
            />
          </Dropzone.Idle>

          <div>
            <Text size="lg" inline c={themeColors.black[9]} ta="center">
              Drag file here or click to select files
            </Text>
            <Text size="sm" c="dimmed" inline mt={10}>
              {description}
            </Text>
          </div>
        </Stack>
      </Dropzone>

      {hasFiles ? (
        <Stack gap="xs" mt="sm">
          <Text style={themeText.label.label2} c={themeColors.black[0]}>{uploadedTitle}</Text>
          {files.map((file) => (
            <Box
              key={file.name}
              p='md'
              bg={themeColors.slate[0]}

              style={{
                borderRadius: 8,
                border: `1px solid ${themeColors.slate[2]}`,
              }}

            >
              <Group justify="space-between" wrap="nowrap">
                <Group gap="sm" wrap="nowrap">
                  <Box
                    bg={themeColors.blue[0]}
                    p={8}
                    style={{
                      borderRadius: 4,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <IconFileText size={20} color={themeColors.blue[6]} />
                  </Box>
                  <Stack gap={2}>
                    <Text size="sm" fw={500} c={themeColors.black[9]}>{file.name}</Text>
                    <Text size="10px" c={themeColors.gray[5]}>
                      {(file.size / 1024 / 1024).toFixed(0)} mb | 100% • Complete
                    </Text>
                  </Stack>
                </Group>
                <ActionIcon
                  variant="subtle"
                  color="gray"
                  onClick={() => removeFile(file.name)}
                  aria-label={`Hapus ${file.name}`}
                >
                  <IconTrash size={18} color={themeColors.slate[5]} />
                </ActionIcon>
              </Group>
            </Box>
          ))}
        </Stack>
      ) : null}
    </Stack>
  );
};

export default CustomDropzone;
