import { ActionIcon, Avatar, Badge, Box, Group, Menu, Skeleton, Table, Text } from '@mantine/core';
import { IconDotsVertical, IconEye, IconPackage, IconPencil, IconTrash } from '@tabler/icons-react';
import { EmptyState } from '@/components/EmptyState';
import { useTranslation } from '@/i18n';
import type { Product } from '@/module/products/domain/product';
import { resolveProductImageUrl } from '@/module/products/infrastructure/productApi';
import { formatPrice } from '@/module/products/domain/productFormat';

type ProductTableProps = {
  products: Product[];
  isLoading: boolean;
  onView: (product: Product) => void;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
};

function StatusBadge({ active, label }: Readonly<{ active: boolean; label: string }>) {
  return (
    <Badge
      size="sm"
      radius="sm"
      variant="light"
      color={active ? 'primary' : 'gray'}
      styles={{ root: { textTransform: 'none', fontWeight: 600 } }}
    >
      {label}
    </Badge>
  );
}

function PriceCell({ enabled, value }: Readonly<{ enabled: boolean; value: number | null }>) {
  const { t } = useTranslation('products');
  if (!enabled) {
    return (
      <Text size="sm" c="dimmed">
        {t('table.notTradable')}
      </Text>
    );
  }
  return (
    <Text size="sm" fw={500} c="dark.8" style={{ fontVariantNumeric: 'tabular-nums' }}>
      {formatPrice(value)}
    </Text>
  );
}

export function ProductTable({
  products,
  isLoading,
  onView,
  onEdit,
  onDelete,
}: Readonly<ProductTableProps>) {
  const { t } = useTranslation('products');
  const rows = isLoading
    ? Array.from({ length: 6 }, (_, i) => (
        <Table.Tr key={`skeleton-${i}`}>
          {Array.from({ length: 6 }, (__, j) => (
            <Table.Td key={j}>
              <Skeleton height={14} radius="sm" width={j === 0 ? '80%' : '60%'} />
            </Table.Td>
          ))}
        </Table.Tr>
      ))
    : products.map((product) => (
        <Table.Tr key={product.id} onClick={() => onView(product)} style={{ cursor: 'pointer' }}>
          <Table.Td>
            <Group gap="sm" wrap="nowrap">
              <Avatar
                src={resolveProductImageUrl(product.image)}
                radius="md"
                size={40}
                color="primary"
                variant="light"
              >
                <IconPackage size={20} />
              </Avatar>
              <Box miw={0}>
                <Text size="sm" fw={600} c="primary.9" truncate>
                  {product.name}
                </Text>
                <Text size="xs" c="dimmed" ff="monospace" truncate>
                  {product.sku}
                </Text>
              </Box>
            </Group>
          </Table.Td>
          <Table.Td>
            {product.category ? (
              <Badge variant="dot" color="secondary.7" radius="sm" tt="none" fw={500}>
                {product.category.name}
              </Badge>
            ) : (
              <Text size="sm" c="dimmed">
                {t('table.noCategory')}
              </Text>
            )}
          </Table.Td>
          <Table.Td>
            <PriceCell enabled={product.sellingInfo.isSold} value={product.sellingInfo.unitPrice} />
          </Table.Td>
          <Table.Td>
            <PriceCell
              enabled={product.buyingInfo.isPurchased}
              value={product.buyingInfo.unitPrice}
            />
          </Table.Td>
          <Table.Td>
            <StatusBadge
              active={product.inventoryInfo.isTracked}
              label={product.inventoryInfo.isTracked ? t('table.tracked') : t('table.notTracked')}
            />
          </Table.Td>
          <Table.Td onClick={(event) => event.stopPropagation()}>
            <Group justify="flex-end">
              <Menu position="bottom-end" shadow="md" withinPortal>
                <Menu.Target>
                  <ActionIcon
                    variant="subtle"
                    color="gray"
                    aria-label={t('table.actionsFor', { name: product.name })}
                  >
                    <IconDotsVertical size={18} />
                  </ActionIcon>
                </Menu.Target>
                <Menu.Dropdown>
                  <Menu.Item leftSection={<IconEye size={16} />} onClick={() => onView(product)}>
                    {t('table.view')}
                  </Menu.Item>
                  <Menu.Item leftSection={<IconPencil size={16} />} onClick={() => onEdit(product)}>
                    {t('table.edit')}
                  </Menu.Item>
                  <Menu.Divider />
                  <Menu.Item
                    color="red"
                    leftSection={<IconTrash size={16} />}
                    onClick={() => onDelete(product)}
                  >
                    {t('table.remove')}
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu>
            </Group>
          </Table.Td>
        </Table.Tr>
      ));

  return (
    <Table.ScrollContainer minWidth={860}>
      <Table verticalSpacing="sm" horizontalSpacing="md" highlightOnHover>
        <Table.Thead bg="gray.0">
          <Table.Tr>
            {(
              ['colProduct', 'colCategory', 'colSellPrice', 'colBuyPrice', 'colInventory'] as const
            ).map((key) => (
              <Table.Th key={key}>
                <Text size="xs" fw={600} c="dimmed" tt="uppercase" lts={0.4}>
                  {t(`table.${key}`)}
                </Text>
              </Table.Th>
            ))}
            <Table.Th w={64} />
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {rows}
          {!isLoading && products.length === 0 && (
            <Table.Tr>
              <Table.Td colSpan={6} p={0}>
                <EmptyState
                  icon={<IconPackage size={32} stroke={1.6} />}
                  title={t('table.emptyTitle')}
                  description={t('table.emptyDescription')}
                />
              </Table.Td>
            </Table.Tr>
          )}
        </Table.Tbody>
      </Table>
    </Table.ScrollContainer>
  );
}
