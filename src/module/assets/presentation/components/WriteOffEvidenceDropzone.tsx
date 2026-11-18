import { useEffect, useMemo, useState } from 'react';
import { ActionIcon, Box, Group, Image, Stack, Text, Tooltip } from '@mantine/core';
import { Dropzone, type FileRejection } from '@mantine/dropzone';
import { IconFileTypePdf, IconPhotoUp, IconUpload, IconX } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import { WRITE_OFF_LIMITS, validateEvidenceFile } from '@/module/assets/domain/writeOffRules';
import classes from '@/module/assets/presentation/components/WriteOffForm.module.css';

export type WriteOffEvidenceDropzoneProps = {
  files: File[];
  onChange: (files: File[]) => void;
  /** Files already on the report (adding evidence later); they count toward the limit. */
  existingCount?: number;
  error?: string;
  disabled?: boolean;
};

/** Evidence picker: JPG, PNG or PDF up to 10 MB, five files in all, each removable. */
export function WriteOffEvidenceDropzone({
  files,
  onChange,
  existingCount = 0,
  error,
  disabled,
}: Readonly<WriteOffEvidenceDropzoneProps>) {
  const { t } = useTranslation('assetWriteOffs');
  const [problems, setProblems] = useState<string[]>([]);
  const room = WRITE_OFF_LIMITS.maxFiles - existingCount - files.length;

  const previews = useMemo(
    () => files.map((file) => (file.type.startsWith('image/') ? URL.createObjectURL(file) : null)),
    [files]
  );
  useEffect(() => () => previews.forEach((url) => url && URL.revokeObjectURL(url)), [previews]);

  const add = (accepted: File[]) => {
    const messages: string[] = [];
    const usable = accepted.filter((file) => {
      const key = validateEvidenceFile(file);
      if (key) messages.push(t(key, { name: file.name }));
      return !key;
    });
    if (usable.length > room) messages.push(t('errEvidenceTooMany'));
    setProblems(messages);
    if (usable.length > 0 && room > 0) onChange([...files, ...usable.slice(0, room)]);
  };

  const reject = (rejections: FileRejection[]) =>
    setProblems(
      rejections.map(({ file }) =>
        t(validateEvidenceFile(file) ?? 'errFileType', { name: file.name })
      )
    );

  const remove = (index: number) => {
    setProblems([]);
    onChange(files.filter((_, at) => at !== index));
  };

  const messages = [...problems, ...(error ? [error] : [])];

  return (
    <Stack gap="sm">
      <Dropzone
        onDrop={add}
        onReject={reject}
        accept={[...WRITE_OFF_LIMITS.evidenceMime]}
        maxSize={WRITE_OFF_LIMITS.maxFileBytes}
        disabled={disabled || room <= 0}
        radius="md"
        className={classes.dropzone}
        data-error={messages.length > 0 || undefined}
      >
        <Group justify="center" gap="md" mih={88} wrap="nowrap" style={{ pointerEvents: 'none' }}>
          <Dropzone.Accept>
            <IconUpload size={32} color="var(--mantine-color-primary-6)" />
          </Dropzone.Accept>
          <Dropzone.Reject>
            <IconX size={32} color="var(--mantine-color-red-6)" />
          </Dropzone.Reject>
          <Dropzone.Idle>
            <IconPhotoUp size={32} color="var(--mantine-color-primary-4)" />
          </Dropzone.Idle>
          <Box>
            <Text size="sm" fw={600}>
              {t('dropTitle')}
            </Text>
            <Text size="xs" c="dimmed">
              {t('dropHint', { max: WRITE_OFF_LIMITS.maxFiles })}
            </Text>
          </Box>
        </Group>
      </Dropzone>

      {files.length > 0 && (
        <Group gap="sm">
          {files.map((file, index) => (
            <Box key={`${file.name}-${index}`} className={classes.fileTile}>
              {previews[index] ? (
                <Image src={previews[index]} alt="" className={classes.fileThumb} />
              ) : (
                <Box className={classes.fileThumb} data-pdf>
                  <IconFileTypePdf size={26} />
                </Box>
              )}
              <Text size="xs" lineClamp={1} className={classes.fileName} title={file.name}>
                {file.name}
              </Text>
              <Tooltip label={t('removeFile', { name: file.name })} withArrow>
                <ActionIcon
                  variant="filled"
                  color="dark"
                  size="sm"
                  radius="xl"
                  className={classes.fileRemove}
                  aria-label={t('removeFile', { name: file.name })}
                  onClick={() => remove(index)}
                >
                  <IconX size={12} />
                </ActionIcon>
              </Tooltip>
            </Box>
          ))}
        </Group>
      )}

      <Group justify="space-between" gap="xs">
        <Box>
          {messages.map((message) => (
            <Text key={message} size="xs" c="red.7" role="alert">
              {message}
            </Text>
          ))}
        </Box>
        <Text size="xs" c="dimmed">
          {t('fileCount', { count: existingCount + files.length, max: WRITE_OFF_LIMITS.maxFiles })}
        </Text>
      </Group>
    </Stack>
  );
}

export default WriteOffEvidenceDropzone;
