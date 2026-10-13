import {
  ActionIcon,
  Avatar,
  Badge,
  Box,
  Button,
  Card,
  Divider,
  Drawer,
  Grid,
  Group,
  Paper,
  SimpleGrid,
  Stack,
  Text,
  ThemeIcon,
} from '@mantine/core';
import {
  IconBuildingWarehouse,
  IconEdit,
  IconPackage,
  IconShoppingCart,
  IconTag,
  IconTrash,
  IconX,
} from '@tabler/icons-react';
import type { Product } from '../types/product';
import { resolveProductImageUrl } from '../infrastructure/productApi';
import { formatDate, formatPrice } from '../utils/productFormat';

type ProductDetailDrawerProps = {
  product: Product | null;
  opened: boolean;
  onClose: () => void;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
};

export function ProductDetailDrawer({
  product,
  opened,
  onClose,
  onEdit,
  onDelete,
}: Readonly<ProductDetailDrawerProps>) {
  if (!product) return null;

  const imageUrl = resolveProductImageUrl(product.image);

  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      position="right"
      size="lg"
      padding="lg"
      withCloseButton={false}
      styles={{
        header: { display: 'none' },
        body: { padding: 0 },
      }}
    >
      <Box p="lg" style={{ borderBottom: '1px solid var(--mantine-color-gray-2)' }}>
        <Group justify="space-between" align="flex-start" wrap="nowrap">
          <Group gap="md" wrap="nowrap">
            <Avatar src={imageUrl} radius="md" size={60} color="primary" variant="light">
              <IconPackage size={32} />
            </Avatar>
            <Box>
              <Text fw={700} fz="lg" c="primary.9">
                {product.name}
              </Text>
              <Group gap="xs" mt={4}>
                <Badge variant="light" color="primary" radius="sm" ff="monospace">
                  {product.sku}
                </Badge>
                {product.category && (
                  <Badge variant="outline" color="secondary.8" radius="sm">
                    {product.category.name}
                  </Badge>
                )}
              </Group>
            </Box>
          </Group>
          <ActionIcon variant="subtle" color="gray" onClick={onClose} aria-label="Tutup detail">
            <IconX size={20} />
          </ActionIcon>
        </Group>
      </Box>

      <Stack p="lg" gap="lg">
        {/* Sales & Purchase Overview Cards */}
        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
          <Paper withBorder p="md" radius="md">
            <Group gap="xs" mb="xs">
              <ThemeIcon size={28} radius="sm" color="teal" variant="light">
                <IconTag size={16} />
              </ThemeIcon>
              <Text fw={600} size="sm">
                Harga Jual
              </Text>
            </Group>
            <Text fw={700} fz="xl" c={product.sellingInfo.isSold ? 'teal.7' : 'dimmed'}>
              {product.sellingInfo.isSold
                ? formatPrice(product.sellingInfo.unitPrice)
                : 'Tidak Dijual'}
            </Text>
            <Text size="xs" c="dimmed" mt={4}>
              {product.sellingInfo.isSold
                ? 'Aktif untuk transaksi invoice/penjualan'
                : 'Dinonaktifkan'}
            </Text>
          </Paper>

          <Paper withBorder p="md" radius="md">
            <Group gap="xs" mb="xs">
              <ThemeIcon size={28} radius="sm" color="blue" variant="light">
                <IconShoppingCart size={16} />
              </ThemeIcon>
              <Text fw={600} size="sm">
                Harga Beli
              </Text>
            </Group>
            <Text fw={700} fz="xl" c={product.buyingInfo.isPurchased ? 'blue.7' : 'dimmed'}>
              {product.buyingInfo.isPurchased
                ? formatPrice(product.buyingInfo.unitPrice)
                : 'Tidak Dibeli'}
            </Text>
            <Text size="xs" c="dimmed" mt={4}>
              {product.buyingInfo.isPurchased
                ? 'Aktif untuk purchase order & pengadaan'
                : 'Dinonaktifkan'}
            </Text>
          </Paper>
        </SimpleGrid>

        {/* Inventory Status Card */}
        <Card withBorder radius="md" p="md">
          <Group justify="space-between" align="center">
            <Group gap="sm">
              <ThemeIcon
                size={34}
                radius="md"
                color={product.inventoryInfo.isTracked ? 'primary' : 'gray'}
                variant="light"
              >
                <IconBuildingWarehouse size={18} />
              </ThemeIcon>
              <Box>
                <Text fw={600} size="sm">
                  Pelacakan Persediaan
                </Text>
                <Text size="xs" c="dimmed">
                  {product.inventoryInfo.isTracked
                    ? 'Stok fisik produk dilacak secara otomatis'
                    : 'Produk bertipe jasa / biaya langsung (tanpa stok fisik)'}
                </Text>
              </Box>
            </Group>
            <Badge
              color={product.inventoryInfo.isTracked ? 'primary' : 'gray'}
              variant="filled"
              radius="sm"
            >
              {product.inventoryInfo.isTracked ? 'Dilacak' : 'Non-Stok'}
            </Badge>
          </Group>
          {product.inventoryInfo.isTracked && (
            <>
              <Divider my="sm" />
              <Group justify="space-between">
                <Text size="xs" c="dimmed">
                  Peringatan Minimum Stok:
                </Text>
                <Text size="sm" fw={600}>
                  {product.inventoryInfo.minStock} unit
                </Text>
              </Group>
            </>
          )}
        </Card>

        {/* Metadata Details */}
        <Paper withBorder p="md" radius="md">
          <Text fw={600} size="sm" mb="sm" c="dimmed">
            Informasi Sistem & Audit
          </Text>
          <Grid gutter="xs">
            <Grid.Col span={5}>
              <Text size="xs" c="dimmed">
                ID Produk
              </Text>
            </Grid.Col>
            <Grid.Col span={7}>
              <Text size="xs" ff="monospace" c="dark.7">
                {product.id}
              </Text>
            </Grid.Col>

            {product.externalCode && (
              <>
                <Grid.Col span={5}>
                  <Text size="xs" c="dimmed">
                    Kode Eksternal
                  </Text>
                </Grid.Col>
                <Grid.Col span={7}>
                  <Text size="xs" ff="monospace" c="dark.7">
                    {product.externalCode}
                  </Text>
                </Grid.Col>
              </>
            )}

            <Grid.Col span={5}>
              <Text size="xs" c="dimmed">
                Dibuat Pada
              </Text>
            </Grid.Col>
            <Grid.Col span={7}>
              <Text size="xs" c="dark.7">
                {formatDate(product.createdAt)}
              </Text>
            </Grid.Col>

            <Grid.Col span={5}>
              <Text size="xs" c="dimmed">
                Terakhir Diperbarui
              </Text>
            </Grid.Col>
            <Grid.Col span={7}>
              <Text size="xs" c="dark.7">
                {formatDate(product.updatedAt)}
              </Text>
            </Grid.Col>
          </Grid>
        </Paper>

        {/* Action Buttons */}
        <Group justify="flex-end" mt="md" gap="sm">
          <Button
            variant="light"
            color="red"
            leftSection={<IconTrash size={16} />}
            onClick={() => onDelete(product)}
          >
            Hapus
          </Button>
          <Button
            color="primary"
            leftSection={<IconEdit size={16} />}
            onClick={() => {
              onClose();
              onEdit(product);
            }}
          >
            Ubah Produk
          </Button>
        </Group>
      </Stack>
    </Drawer>
  );
}
