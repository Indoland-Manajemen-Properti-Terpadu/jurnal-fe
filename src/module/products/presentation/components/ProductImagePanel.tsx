import { ActionIcon, Alert, Box, Group, Image, Paper, Stack, Text, ThemeIcon } from '@mantine/core';
import { Dropzone, IMAGE_MIME_TYPE } from '@mantine/dropzone';
import { IconInfoCircle, IconPhoto, IconUpload, IconX } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import { MAX_IMAGE_BYTES } from '@/module/products/domain/productRules';

type ProductImagePanelProps = {
  preview: string | null;
  nothingEnabled: boolean;
  onPick: (file: File | null) => void;
  onClear: () => void;
};

export function ProductImagePanel({
  preview,
  nothingEnabled,
  onPick,
  onClear,
}: Readonly<ProductImagePanelProps>) {
  const { t } = useTranslation('products');
  return (
    <Paper withBorder radius="md" p="md" bg="white">
      <Group gap="xs" mb="xs">
        <ThemeIcon variant="light" color="primary" radius="sm" size={28}>
          <IconPhoto size={16} />
        </ThemeIcon>
        <Box>
          <Text fw={600} size="sm" c="primary.9">
            {t('form.imageTitle')}
          </Text>
          <Text size="xs" c="dimmed">
            {t('form.imageHint')}
          </Text>
        </Box>
      </Group>

      {preview ? (
        <Box pos="relative" mt="sm">
          <Image
            src={preview}
            radius="md"
            h={180}
            fit="contain"
            bg="gray.0"
            alt={t('form.imagePreviewAlt')}
          />
          <ActionIcon
            pos="absolute"
            top={8}
            right={8}
            variant="filled"
            color="red"
            radius="xl"
            size="sm"
            aria-label={t('form.imageRemove')}
            onClick={onClear}
          >
            <IconX size={14} />
          </ActionIcon>
        </Box>
      ) : (
        <Dropzone
          mt="sm"
          onDrop={(files) => onPick(files[0] ?? null)}
          accept={IMAGE_MIME_TYPE}
          maxSize={MAX_IMAGE_BYTES}
          maxFiles={1}
          radius="md"
          p="md"
          style={{ borderStyle: 'dashed' }}
        >
          <Stack align="center" gap={4} py="sm" style={{ pointerEvents: 'none' }}>
            <Dropzone.Accept>
              <IconUpload size={28} color="var(--mantine-color-primary-6)" />
            </Dropzone.Accept>
            <Dropzone.Reject>
              <IconX size={28} color="var(--mantine-color-red-6)" />
            </Dropzone.Reject>
            <Dropzone.Idle>
              <IconPhoto size={28} color="var(--mantine-color-gray-5)" />
            </Dropzone.Idle>
            <Text size="xs" fw={600} ta="center" c="dark.8">
              {t('form.dropTitle')}
            </Text>
            <Text size="xs" c="dimmed" ta="center">
              {t('form.dropHint')}
            </Text>
          </Stack>
        </Dropzone>
      )}

      {nothingEnabled && (
        <Alert
          color="yellow"
          radius="md"
          icon={<IconInfoCircle size={16} />}
          p="xs"
          mt="md"
          styles={{ message: { fontSize: 12 } }}
        >
          {t('form.nothingEnabled')}
        </Alert>
      )}
    </Paper>
  );
}
