import { Group, Text, rem } from '@mantine/core';
import { IconUpload, IconX, IconCloudUpload } from '@tabler/icons-react';
import {
  Dropzone,
  DropzoneProps,
  FileRejection,
  FileWithPath,
  MIME_TYPES,
} from '@mantine/dropzone';
import { themeColors } from '@/theme';
import { useFileStore } from '@/store/JurnalUmum/useFileStore';
import { useState } from 'react';

interface DropzoneComponentProps extends Partial<DropzoneProps> {
  maxSize?: number;
  accept?: string[];
  onReject?: (files: FileRejection[]) => void;
  handleDrop?: (files: FileWithPath[]) => void;
  description?: string;
}

const CustomDropzone: React.FC<DropzoneComponentProps> = ({
  maxSize = 5 * 1024 ** 2,
  accept = [MIME_TYPES.csv],
  onReject,
  handleDrop,
  description = 'Attach csv file, the file should not exceed 5mb',
  ...props
}) => {
  const addFile = useFileStore((state) => state.addFile);

  return (
    <Dropzone
      onDrop={(files) => handleDrop && handleDrop(files)}
      onReject={onReject}
      maxSize={maxSize}
      accept={accept}
      onChange={console.log}
      {...props}
      styles={(theme) => ({
        root: {
          border: `1px dashed ${theme.colors.dark[0]}`,
          borderRadius: theme.radius.md,
          padding: theme.spacing.md,
        },
      })}
    >
      <Group justify="center" gap="xl" mih={220} style={{ pointerEvents: 'none' }}>
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
          <IconCloudUpload
            style={{ width: rem(52), height: rem(52) }}
            color={themeColors.defaultBlack[9]}
            stroke={1.5}
          />
        </Dropzone.Idle>

        <div>
          <Text size="lg" inline c={themeColors.defaultBlack[9]} ta="center">
            Drag file here or click to select files
          </Text>
          <Text size="sm" c="dimmed" inline mt={10}>
            {description}
          </Text>
        </div>
      </Group>
    </Dropzone>
  );
};

export default CustomDropzone;
