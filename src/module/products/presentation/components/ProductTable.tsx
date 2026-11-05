import {
  ActionIcon,
  Avatar,
  Badge,
  Box,
  CopyButton,
  Group,
  Menu,
  Pagination,
  Paper,
  Select,
  Skeleton,
  Stack,
  Table,
  Text,
  Tooltip,
} from '@mantine/core';
import {
  IconCheck,
  IconCopy,
  IconDotsVertical,
  IconEye,
  IconPackage,
  IconPencil,
  IconPlus,
  IconTrash,
} from '@tabler/icons-react';
import { EmptyState } from '@/components/EmptyState';
import { useTranslation } from '@/i18n';
import type { Product } from '@/module/products/domain/product';
import { resolveProductImageUrl } from '@/module/products/infrastructure/productApi';
import { formatPrice } from '@/module/products/domain/productFormat';

const PAGE_SIZES = ['10', '25', '50'];
const COLUMN_COUNT = 6;

type ProductTableProps = {
  products: Product[];
  isLoading: boolean;
  isFiltered: boolean;
  page: number;
  totalPages: number;
  total: number;
  limit: number;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  onView: (product: Product) => void;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
  onCreate: () => void;
};

function InventoryCell({ product }: Readonly<{ product: Product }>) {
  const { t } = useTranslation('products');
  const { isTracked, minStock } = product.inventoryInfo;
  return (
    <Box>
      <Badge variant="light" color={isTracked ? 'teal' : 'gray'} radius="sm" tt="none">
        {isTracked ? t('table.tracked') : t('table.notTracked')}
      </Badge>
      <Text size="xs" c="dimmed" mt={4}>
        {isTracked ? t('table.minStock', { count: minStock }) : t('table.notTrackedHint')}
      </Text>
    </Box>
  );
}

type PriceCellProps = {
  enabled: boolean;
  value: number | null;
  unit: string | null;
  offLabel: string;
};

function PriceCell({ enabled, value, unit, offLabel }: Readonly<PriceCellProps>) {
  if (!enabled) {
    return (
      <Text size="sm" c="dimmed">
        {offLabel}
      </Text>
    );
  }
  return (
    <>
      <Text size="sm" fw={700} c="dark.8" style={{ fontVariantNumeric: 'tabular-nums' }}>
        {formatPrice(value)}
      </Text>
      {unit && (
        <Text size="xs" c="dimmed">
          / {unit}
        </Text>
      )}
    </>
  );
}

function ProductRow({
  product,
  onView,
  onEdit,
  onDelete,
}: Readonly<Pick<ProductTableProps, 'onView' | 'onEdit' | 'onDelete'> & { product: Product }>) {
  const { t } = useTranslation('products');
  return (
    <Table.Tr style={{ cursor: 'pointer' }} onClick={() => onView(product)}>
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
            <Text size="sm" fw={700} c="primary.9" truncate>
              {product.name}
            </Text>
            <Group gap={4} wrap="nowrap" onClick={(event) => event.stopPropagation()}>
              <Text size="xs" c="dimmed" truncate>
                {product.sku}
              </Text>
              {product.sku && (
                <CopyButton value={product.sku} timeout={2000}>
                  {({ copied, copy }) => (
                    <Tooltip label={copied ? t('table.copied') : t('table.copySku')} withArrow>
                      <ActionIcon
                        size="xs"
                        variant="subtle"
                        color={copied ? 'teal' : 'gray'}
                        onClick={copy}
                        aria-label={t('table.copySku')}
                      >
                        {copied ? <IconCheck size={12} /> : <IconCopy size={12} />}
                      </ActionIcon>
                    </Tooltip>
                  )}
                </CopyButton>
              )}
            </Group>
          </Box>
        </Group>
      </Table.Td>
      <Table.Td>
        {product.category ? (
          <Text size="sm" c="dark.7">
            {product.category.name}
          </Text>
        ) : (
          <Text size="sm" c="dimmed">
            {t('table.noCategory')}
          </Text>
        )}
      </Table.Td>
      <Table.Td ta="right">
        <PriceCell
          enabled={product.sellingInfo.isSold}
          value={product.sellingInfo.unitPrice}
          unit={product.unit}
          offLabel={t('table.notSold')}
        />
      </Table.Td>
      <Table.Td ta="right">
        <PriceCell
          enabled={product.buyingInfo.isPurchased}
          value={product.buyingInfo.unitPrice}
          unit={product.unit}
          offLabel={t('table.notBought')}
        />
      </Table.Td>
      <Table.Td>
        <InventoryCell product={product} />
      </Table.Td>
      <Table.Td ta="center" onClick={(event) => event.stopPropagation()}>
        <Menu position="bottom-end" shadow="md" width={200} withinPortal>
          <Menu.Target>
            <ActionIcon
              variant="subtle"
              color="gray"
              radius="md"
              aria-label={t('table.actionsFor', { name: product.name })}
            >
              <IconDotsVertical size={16} />
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
      </Table.Td>
    </Table.Tr>
  );
}

const COLUMNS: { key: string; align?: 'right' | 'center'; width?: number }[] = [
  { key: 'colProduct' },
  { key: 'colCategory' },
  { key: 'colSellPrice', align: 'right' },
  { key: 'colBuyPrice', align: 'right' },
  { key: 'colInventory' },
  { key: 'colAction', align: 'center', width: 80 },
];

export function ProductTable({
  products,
  isLoading,
  isFiltered,
  page,
  totalPages,
  total,
  limit,
  onPageChange,
  onLimitChange,
  onView,
  onEdit,
  onDelete,
  onCreate,
}: Readonly<ProductTableProps>) {
  const { t } = useTranslation('products');
  return (
    <Stack gap="md">
      <Paper withBorder radius="md" bg="white" p={0} style={{ overflow: 'hidden' }}>
        <Table.ScrollContainer minWidth={860}>
          <Table verticalSpacing="sm" horizontalSpacing="md" highlightOnHover>
            <Table.Thead bg="gray.0">
              <Table.Tr>
                {COLUMNS.map((column) => (
                  <Table.Th key={column.key} ta={column.align} w={column.width}>
                    <Text
                      size="xs"
                      fw={700}
                      c="dimmed"
                      tt="uppercase"
                      style={{ whiteSpace: 'nowrap' }}
                    >
                      {t(`table.${column.key}`)}
                    </Text>
                  </Table.Th>
                ))}
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {isLoading &&
                Array.from({ length: Math.min(limit, 6) }, (_, i) => (
                  <Table.Tr key={`skeleton-${i}`}>
                    <Table.Td colSpan={COLUMN_COUNT}>
                      <Skeleton height={16} radius="sm" />
                    </Table.Td>
                  </Table.Tr>
                ))}
              {!isLoading &&
                products.map((product) => (
                  <ProductRow
                    key={product.id}
                    product={product}
                    onView={onView}
                    onEdit={onEdit}
                    onDelete={onDelete}
                  />
                ))}
              {!isLoading && products.length === 0 && (
                <Table.Tr>
                  <Table.Td colSpan={COLUMN_COUNT} p={0}>
                    <EmptyState
                      icon={<IconPackage size={32} stroke={1.6} />}
                      title={isFiltered ? t('table.emptyTitle') : t('table.emptyNoDataTitle')}
                      description={
                        isFiltered ? t('table.emptyDescription') : t('table.emptyNoDataDescription')
                      }
                      actionLabel={isFiltered ? undefined : t('list.addProduct')}
                      onAction={isFiltered ? undefined : onCreate}
                      actionIcon={<IconPlus size={16} />}
                    />
                  </Table.Td>
                </Table.Tr>
              )}
            </Table.Tbody>
          </Table>
        </Table.ScrollContainer>
      </Paper>

      <Group justify="space-between" align="center" wrap="wrap" px="xs">
        <Text size="xs" c="dimmed">
          {t('list.showing', { shown: products.length, total })}
        </Text>
        <Group gap="sm">
          <Select
            size="xs"
            w={110}
            data={PAGE_SIZES.map((size) => ({
              value: size,
              label: t('list.perPage', { count: size }),
            }))}
            value={String(limit)}
            onChange={(value) => onLimitChange(Number(value) || 10)}
            aria-label={t('list.limitPlaceholder')}
            allowDeselect={false}
          />
          <Pagination
            size="sm"
            value={page}
            total={totalPages}
            onChange={onPageChange}
            color="primary"
          />
        </Group>
      </Group>
    </Stack>
  );
}
