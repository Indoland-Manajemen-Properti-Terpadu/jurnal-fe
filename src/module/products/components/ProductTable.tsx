import {
  ActionIcon,
  Avatar,
  Badge,
  Box,
  Group,
  Menu,
  Skeleton,
  Stack,
  Table,
  Text,
  ThemeIcon,
} from '@mantine/core';
import { IconDotsVertical, IconEye, IconPackage, IconPencil, IconTrash } from '@tabler/icons-react';
import type { Product } from '../types/product';
import { resolveProductImageUrl } from '../infrastructure/productApi';
import { formatPrice } from '../utils/productFormat';

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
  if (!enabled) {
    return (
      <Text size="sm" c="dimmed">
        Tidak dijual/dibeli
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
                Tanpa kategori
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
              label={product.inventoryInfo.isTracked ? 'Dilacak' : 'Tidak dilacak'}
            />
          </Table.Td>
          <Table.Td onClick={(event) => event.stopPropagation()}>
            <Group justify="flex-end">
              <Menu position="bottom-end" shadow="md" withinPortal>
                <Menu.Target>
                  <ActionIcon variant="subtle" color="gray" aria-label={`Aksi ${product.name}`}>
                    <IconDotsVertical size={18} />
                  </ActionIcon>
                </Menu.Target>
                <Menu.Dropdown>
                  <Menu.Item leftSection={<IconEye size={16} />} onClick={() => onView(product)}>
                    Lihat detail
                  </Menu.Item>
                  <Menu.Item leftSection={<IconPencil size={16} />} onClick={() => onEdit(product)}>
                    Ubah produk
                  </Menu.Item>
                  <Menu.Divider />
                  <Menu.Item
                    color="red"
                    leftSection={<IconTrash size={16} />}
                    onClick={() => onDelete(product)}
                  >
                    Hapus
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
            {['Produk', 'Kategori', 'Harga Jual', 'Harga Beli', 'Persediaan'].map((label) => (
              <Table.Th key={label}>
                <Text size="xs" fw={600} c="dimmed" tt="uppercase" lts={0.4}>
                  {label}
                </Text>
              </Table.Th>
            ))}
            <Table.Th w={64} />
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>{rows}</Table.Tbody>
      </Table>
      {!isLoading && products.length === 0 && (
        <Stack align="center" gap={6} py={56}>
          <ThemeIcon size={56} radius="xl" variant="light" color="primary">
            <IconPackage size={28} />
          </ThemeIcon>
          <Text fw={600} mt="xs" c="dark.8">
            Belum ada produk yang cocok
          </Text>
          <Text size="sm" c="dimmed" ta="center" maw={360}>
            Coba ubah kata kunci pencarian, atau tambahkan produk baru untuk mulai mencatat
            transaksi.
          </Text>
        </Stack>
      )}
    </Table.ScrollContainer>
  );
}
