import type { ReactNode } from 'react';
import { Box, Divider, Group, Paper, Stack, Text, ThemeIcon } from '@mantine/core';
import { IconInfoCircle } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import type { Product } from '@/module/products/domain/product';
import { formatDate } from '@/module/products/domain/productFormat';
import { CopyValueButton } from './CopyValueButton';

function AuditRow({ label, children }: Readonly<{ label: string; children: ReactNode }>) {
  return (
    <Group justify="space-between" wrap="nowrap" align="center">
      <Text size="xs" c="dimmed">
        {label}
      </Text>
      {children}
    </Group>
  );
}

function CopyableValue({
  value,
  label,
  ariaLabel,
  weight,
  color,
}: Readonly<{ value: string; label: string; ariaLabel: string; weight: number; color: string }>) {
  return (
    <Group gap={4} wrap="nowrap">
      <Text size="xs" ff="monospace" c={color} fw={weight}>
        {value}
      </Text>
      <CopyValueButton value={value} label={label} ariaLabel={ariaLabel} />
    </Group>
  );
}

export function ProductAuditPanel({ product }: Readonly<{ product: Product }>) {
  const { t } = useTranslation('products');
  return (
    <Stack gap="lg">
      <Paper withBorder radius="md" p="lg" bg="white">
        <Text fw={700} size="sm" c="primary.9" mb="md">
          {t('detail.technicalTitle')}
        </Text>

        <Stack gap="sm">
          <AuditRow label={t('detail.systemId')}>
            <CopyableValue
              value={product.id}
              label={t('detail.copySystemId')}
              ariaLabel={t('detail.copySystemIdLabel')}
              weight={500}
              color="dark.7"
            />
          </AuditRow>

          <Divider />

          <AuditRow label={t('detail.sku')}>
            <Group gap={4} wrap="nowrap">
              <Text size="xs" ff="monospace" fw={600} c="dark.8">
                {product.sku || '—'}
              </Text>
              {product.sku && (
                <CopyValueButton
                  value={product.sku}
                  label={t('detail.copySku')}
                  ariaLabel={t('detail.copySku')}
                />
              )}
            </Group>
          </AuditRow>

          {product.externalCode && (
            <>
              <Divider />
              <AuditRow label={t('detail.externalCodeLabel')}>
                <CopyableValue
                  value={product.externalCode}
                  label={t('detail.copyExternalCode')}
                  ariaLabel={t('detail.copyExternalCode')}
                  weight={500}
                  color="dark.8"
                />
              </AuditRow>
            </>
          )}

          <Divider />

          <AuditRow label={t('detail.category')}>
            <Text size="xs" fw={600} c="dark.8">
              {product.category?.name || '—'}
            </Text>
          </AuditRow>

          <Divider />

          <AuditRow label={t('detail.created')}>
            <Text size="xs" fw={500} c="dark.8">
              {formatDate(product.createdAt)}
            </Text>
          </AuditRow>

          <Divider />

          <AuditRow label={t('detail.updated')}>
            <Text size="xs" fw={500} c="dark.8">
              {formatDate(product.updatedAt)}
            </Text>
          </AuditRow>
        </Stack>
      </Paper>

      <Paper withBorder radius="md" p="md" bg="blue.0">
        <Group gap="xs" align="flex-start">
          <ThemeIcon size={24} radius="sm" color="blue" variant="filled">
            <IconInfoCircle size={14} />
          </ThemeIcon>
          <Box style={{ flex: 1 }}>
            <Text fw={600} size="xs" c="blue.9">
              {t('detail.tipTitle')}
            </Text>
            <Text size="xs" c="blue.8" mt={4} lh={1.5}>
              {t('detail.tipBody')}
            </Text>
          </Box>
        </Group>
      </Paper>
    </Stack>
  );
}
