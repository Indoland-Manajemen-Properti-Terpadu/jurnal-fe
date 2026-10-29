import { Avatar, Badge, Box, Button, Divider, Group, Paper, Text, Title } from '@mantine/core';
import { IconArrowLeft, IconEdit, IconPackage, IconTrash } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import type { Product } from '@/module/products/domain/product';
import { formatDate, formatPrice } from '@/module/products/domain/productFormat';

const BANNER_BACKGROUND =
  'linear-gradient(135deg, var(--mantine-color-white) 60%, var(--mantine-color-secondary-0) 100%)';

type ProductDetailHeaderProps = {
  product: Product;
  imageUrl: string | null;
  onBack: () => void;
  onEdit: () => void;
  onDelete: () => void;
};

export function ProductDetailHeader({
  product,
  imageUrl,
  onBack,
  onEdit,
  onDelete,
}: Readonly<ProductDetailHeaderProps>) {
  const { t } = useTranslation('products');
  return (
    <>
      <Paper
        withBorder
        radius="lg"
        p={{ base: 'md', sm: 'xl' }}
        style={{ background: BANNER_BACKGROUND }}
      >
        <Group justify="space-between" align="center" wrap="wrap" gap="sm">
          <Button
            variant="subtle"
            color="gray"
            leftSection={<IconArrowLeft size={18} />}
            onClick={onBack}
          >
            {t('detail.backToList')}
          </Button>

          <Group gap="xs">
            <Button
              variant="outline"
              color="red"
              leftSection={<IconTrash size={16} />}
              onClick={onDelete}
            >
              {t('detail.remove')}
            </Button>
            <Button color="primary" leftSection={<IconEdit size={16} />} onClick={onEdit}>
              {t('detail.edit')}
            </Button>
          </Group>
        </Group>
      </Paper>

      <Paper
        withBorder
        radius="lg"
        p={{ base: 'md', sm: 'xl' }}
        style={{ background: BANNER_BACKGROUND }}
      >
        <Group justify="space-between" align="flex-start" wrap="wrap" gap="lg">
          <Group gap="lg" align="flex-start">
            <Avatar
              src={imageUrl}
              size={96}
              radius="md"
              color="primary"
              variant="light"
              style={{
                border: '2px solid var(--mantine-color-gray-2)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
              }}
            >
              <IconPackage size={48} />
            </Avatar>
            <Box>
              <Group gap="xs" align="center">
                <Title order={2} fz={{ base: 22, sm: 28 }} c="primary.9">
                  {product.name}
                </Title>
                <Badge variant="light" color="primary" size="md" ff="monospace">
                  {product.sku}
                </Badge>
              </Group>

              <Group gap="xs" mt={8}>
                {product.category ? (
                  <Badge variant="outline" color="secondary.8" size="sm">
                    {product.category.name}
                  </Badge>
                ) : (
                  <Badge variant="dot" color="gray" size="sm">
                    {t('detail.noCategory')}
                  </Badge>
                )}

                <Badge
                  variant="light"
                  color={product.inventoryInfo.isTracked ? 'teal' : 'gray'}
                  size="sm"
                >
                  {product.inventoryInfo.isTracked
                    ? t('detail.stockTracked')
                    : t('detail.nonStock')}
                </Badge>

                {product.externalCode && (
                  <Badge variant="default" size="sm" ff="monospace">
                    {t('detail.externalCode', { code: product.externalCode })}
                  </Badge>
                )}
              </Group>

              <Text size="xs" c="dimmed" mt={8}>
                {t('detail.createdUpdated', {
                  created: formatDate(product.createdAt),
                  updated: formatDate(product.updatedAt),
                })}
              </Text>
            </Box>
          </Group>

          <Group gap="xl">
            <Box ta={{ base: 'left', sm: 'right' }}>
              <Text size="xs" fw={600} c="dimmed" tt="uppercase" lts={0.5}>
                {t('detail.sellPrice')}
              </Text>
              <Text fw={800} fz="xl" c={product.sellingInfo.isSold ? 'teal.7' : 'dimmed'}>
                {product.sellingInfo.isSold
                  ? formatPrice(product.sellingInfo.unitPrice)
                  : t('detail.notSold')}
              </Text>
            </Box>
            <Divider orientation="vertical" />
            <Box ta={{ base: 'left', sm: 'right' }}>
              <Text size="xs" fw={600} c="dimmed" tt="uppercase" lts={0.5}>
                {t('detail.buyPrice')}
              </Text>
              <Text fw={800} fz="xl" c={product.buyingInfo.isPurchased ? 'blue.7' : 'dimmed'}>
                {product.buyingInfo.isPurchased
                  ? formatPrice(product.buyingInfo.unitPrice)
                  : t('detail.notBought')}
              </Text>
            </Box>
          </Group>
        </Group>
      </Paper>
    </>
  );
}
