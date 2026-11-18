import { useEffect, useMemo, useState } from 'react';
import { ActionIcon, Box, Group, Image, Stack, Text, Tooltip } from '@mantine/core';
import { Dropzone, type FileRejection } from '@mantine/dropzone';
import { IconPhotoUp, IconUpload, IconX } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import { MAX_ASSET_PHOTOS } from '@/module/assets/domain/asset';
import { ASSET_PHOTO_LIMITS, validatePhotoFile } from '@/module/assets/domain/assetRules';
import classes from '@/module/assets/presentation/components/AssetPhotoPicker.module.css';

export type AssetPhotoPickerProps = {
  /** Photos already saved on the asset. */
  saved: string[];
  onSavedChange: (saved: string[]) => void;
  /** Photos picked from the device that are not saved yet. */
  files: File[];
  onFilesChange: (files: File[]) => void;
  error?: string;
  disabled?: boolean;
};

type Tile = { key: string; src: string; name: string; remove: () => void };

/** Photo picker: drop or choose JPG/PNG files; saved and new photos share the limit of five. */
export function AssetPhotoPicker({
  saved,
  onSavedChange,
  files,
  onFilesChange,
  error,
  disabled,
}: Readonly<AssetPhotoPickerProps>) {
  const { t } = useTranslation('assets');
  const [problems, setProblems] = useState<string[]>([]);
  const total = saved.length + files.length;
  const room = MAX_ASSET_PHOTOS - total;

  const previews = useMemo(() => files.map((file) => URL.createObjectURL(file)), [files]);
  useEffect(() => () => previews.forEach((url) => URL.revokeObjectURL(url)), [previews]);

  const add = (accepted: File[]) => {
    const messages: string[] = [];
    const usable = accepted.filter((file) => {
      const key = validatePhotoFile(file);
      if (key) messages.push(t(key, { name: file.name }));
      return !key;
    });
    if (usable.length > room) messages.push(t('errPhotoTooMany'));
    setProblems(messages);
    if (usable.length > 0 && room > 0) onFilesChange([...files, ...usable.slice(0, room)]);
  };

  const reject = (rejections: FileRejection[]) =>
    setProblems(
      rejections.map(({ file }) =>
        t(validatePhotoFile(file) ?? 'errPhotoType', { name: file.name })
      )
    );

  const tiles: Tile[] = [
    ...saved.map((src, index) => ({
      key: `saved-${src}`,
      src,
      name: src.split('/').pop() ?? src,
      remove: () => onSavedChange(saved.filter((_, at) => at !== index)),
    })),
    ...files.map((file, index) => ({
      key: `new-${file.name}-${index}`,
      src: previews[index],
      name: file.name,
      remove: () => onFilesChange(files.filter((_, at) => at !== index)),
    })),
  ];

  const messages = [...problems, ...(error ? [error] : [])];

  return (
    <Stack gap="sm">
      <Dropzone
        onDrop={add}
        onReject={reject}
        accept={[...ASSET_PHOTO_LIMITS.mime]}
        maxSize={ASSET_PHOTO_LIMITS.maxBytes}
        disabled={disabled || room <= 0}
        radius="md"
        className={classes.dropzone}
        data-error={messages.length > 0 || undefined}
      >
        <Group justify="center" gap="md" mih={96} wrap="nowrap" style={{ pointerEvents: 'none' }}>
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
              {t('photoDropTitle')}
            </Text>
            <Text size="xs" c="dimmed">
              {t('photoDropHint', { max: MAX_ASSET_PHOTOS })}
            </Text>
          </Box>
        </Group>
      </Dropzone>

      {tiles.length > 0 && (
        <Group gap="sm">
          {tiles.map((tile) => (
            <Box key={tile.key} className={classes.tile}>
              <Image src={tile.src} alt="" className={classes.thumb} />
              <Text size="xs" lineClamp={1} mt={4} title={tile.name}>
                {tile.name}
              </Text>
              <Tooltip label={t('removePhoto', { name: tile.name })} withArrow>
                <ActionIcon
                  variant="filled"
                  color="dark"
                  size="sm"
                  radius="xl"
                  className={classes.remove}
                  aria-label={t('removePhoto', { name: tile.name })}
                  onClick={() => {
                    setProblems([]);
                    tile.remove();
                  }}
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
          {t('photoCount', { count: total, max: MAX_ASSET_PHOTOS })}
        </Text>
      </Group>
    </Stack>
  );
}

export default AssetPhotoPicker;
