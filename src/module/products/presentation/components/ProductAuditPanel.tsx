import { Divider, Group, Image, Paper, Stack, Text, ThemeIcon, Title } from '@mantine/core';
import { IconInfoCircle } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import type { Product } from '@/module/products/domain/product';
import { formatDate } from '@/module/products/domain/productFormat';
import { CopyValueButton } from './CopyValueButton';
import { DetailField } from './DetailField';

type ProductAuditPanelProps = { product: Product; imageUrl: string | null };

export function ProductAuditPanel({ product, imageUrl }: Readonly<ProductAuditPanelProps>) {
  const { t } = useTranslation('products');
  return (
    <Paper withBorder radius="lg" p={{ base: 'md', sm: 'lg' }} bg="white">
      <Group gap="sm" wrap="nowrap" align="flex-start" mb="md">
        <ThemeIcon size={36} radius="md" color="primary" variant="light">
          <IconInfoCircle size={19} />
        </ThemeIcon>
        <div>
          <Title order={3} size="md" lh={1.3}>
            {t('detail.technicalTitle')}
          </Title>
          <Text size="xs" c="dimmed" mt={2}>
            {t('detail.technicalDescription')}
          </Text>
        </div>
      </Group>

      {imageUrl && (
        <Image
          src={imageUrl}
          alt={product.name}
          radius="md"
          h={180}
          fit="contain"
          bg="gray.0"
          mb="md"
        />
      )}

      <Stack gap="md">
        <DetailField
          label={t('detail.sku')}
          action={
            product.sku ? (
              <CopyValueButton
                value={product.sku}
                label={t('detail.copySku')}
                ariaLabel={t('detail.copySku')}
              />
            ) : null
          }
        >
          {product.sku}
        </DetailField>
        {product.externalCode && (
          <DetailField
            label={t('detail.externalCodeLabel')}
            action={
              <CopyValueButton
                value={product.externalCode}
                label={t('detail.copyExternalCode')}
                ariaLabel={t('detail.copyExternalCode')}
              />
            }
          >
            {product.externalCode}
          </DetailField>
        )}
        <DetailField label={t('detail.category')}>{product.category?.name}</DetailField>
        <Divider />
        <DetailField label={t('detail.created')}>{formatDate(product.createdAt)}</DetailField>
        <DetailField label={t('detail.updated')}>{formatDate(product.updatedAt)}</DetailField>
      </Stack>
    </Paper>
  );
}
