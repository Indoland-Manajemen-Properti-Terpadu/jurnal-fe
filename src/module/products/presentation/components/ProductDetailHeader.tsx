import { Badge, Button, Group, Stack, Text } from '@mantine/core';
import { IconArrowLeft, IconEdit, IconPackage, IconTrash } from '@tabler/icons-react';
import { ModuleHeader } from '@/components/ModuleHeader/ModuleHeader';
import { useTranslation } from '@/i18n';
import type { Product } from '@/module/products/domain/product';
import { formatDate } from '@/module/products/domain/productFormat';

type ProductDetailHeaderProps = {
  product: Product;
  onBack: () => void;
  onEdit: () => void;
  onDelete: () => void;
};

export function ProductDetailHeader({
  product,
  onBack,
  onEdit,
  onDelete,
}: Readonly<ProductDetailHeaderProps>) {
  const { t } = useTranslation('products');
  const metaParts = [product.category?.name ?? t('detail.noCategory')];
  if (product.unit) metaParts.push(t('detail.unitBadge', { unit: product.unit }));

  const description = (
    <Stack gap={6}>
      <Group gap="xs" wrap="wrap" align="center">
        <Text fz="var(--jurnal-text-sm)" fw={700} c="dark.8">
          {product.sku || '—'}
        </Text>
        {metaParts.map((part) => (
          <Group key={part} gap={6} wrap="nowrap">
            <Text fz="var(--jurnal-text-sm)" c="dimmed" aria-hidden>
              ·
            </Text>
            <Text fz="var(--jurnal-text-sm)" c="dimmed">
              {part}
            </Text>
          </Group>
        ))}
        {product.sellingInfo.isSold && (
          <Badge variant="light" color="primary" radius="sm" tt="none">
            {t('detail.soldBadge')}
          </Badge>
        )}
        {product.buyingInfo.isPurchased && (
          <Badge variant="light" color="primary" radius="sm" tt="none">
            {t('detail.boughtBadge')}
          </Badge>
        )}
        <Badge
          variant="light"
          color={product.inventoryInfo.isTracked ? 'teal' : 'gray'}
          radius="sm"
          tt="none"
        >
          {product.inventoryInfo.isTracked ? t('detail.stockTracked') : t('detail.nonStock')}
        </Badge>
      </Group>
      <Text size="sm" c="dimmed">
        {t('detail.createdUpdated', {
          created: formatDate(product.createdAt),
          updated: formatDate(product.updatedAt),
        })}
      </Text>
    </Stack>
  );

  return (
    <ModuleHeader
      icon={IconPackage}
      title={product.name}
      description={description}
      actions={
        <Group gap="xs" wrap="wrap">
          <Button
            variant="default"
            size="md"
            leftSection={<IconArrowLeft size={16} />}
            onClick={onBack}
          >
            {t('detail.backToList')}
          </Button>
          <Button
            variant="default"
            size="md"
            c="red.7"
            leftSection={<IconTrash size={16} />}
            onClick={onDelete}
          >
            {t('detail.remove')}
          </Button>
          <Button color="primary" size="md" leftSection={<IconEdit size={16} />} onClick={onEdit}>
            {t('detail.edit')}
          </Button>
        </Group>
      }
    />
  );
}
