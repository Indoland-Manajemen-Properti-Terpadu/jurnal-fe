import { useMemo, useState } from 'react';
import {
  Alert,
  Avatar,
  Badge,
  Box,
  Button,
  Card,
  Container,
  Divider,
  Grid,
  Group,
  LoadingOverlay,
  Modal,
  Paper,
  SimpleGrid,
  Skeleton,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from '@mantine/core';
import {
  IconArrowLeft,
  IconBuildingWarehouse,
  IconEdit,
  IconInfoCircle,
  IconPackage,
  IconShoppingCart,
  IconTag,
  IconTrash,
  IconX,
} from '@tabler/icons-react';
import { useNavigate, useParams } from 'react-router-dom';
import AppShellLayout from '@/components/AppShellLayout';
import ConfirmModal from '@/components/ui/ConfirmModal/ConfirmModal';
import { routes } from '@/router/routes';
import { ProductForm } from '../components/ProductForm';
import {
  useAccountOptions,
  useDeleteProduct,
  useProduct,
  useSaveProduct,
  useTaxes,
} from '../hooks/useProductQueries';
import { resolveProductImageUrl } from '../infrastructure/productApi';
import type { ProductFormValues } from '../types/product';
import { formatDate, formatPrice } from '../utils/productFormat';

export function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [editModalOpened, setEditModalOpened] = useState(false);
  const [deleteConfirmOpened, setDeleteConfirmOpened] = useState(false);

  // Queries
  const { data: product, isLoading, isError, refetch } = useProduct(id);
  const accountsQuery = useAccountOptions();
  const taxesQuery = useTaxes();

  // Mutations
  const saveProductMutation = useSaveProduct(id);
  const deleteProductMutation = useDeleteProduct();

  // Lookups helper maps
  const accountMap = useMemo(() => {
    const map = new Map<string, string>();
    (accountsQuery.data ?? []).forEach((acc) => {
      map.set(acc.id, acc.label);
    });
    return map;
  }, [accountsQuery.data]);

  const taxMap = useMemo(() => {
    const map = new Map<string, string>();
    (taxesQuery.data ?? []).forEach((t) => {
      map.set(t.id, `${t.name} (${t.rate}%)`);
    });
    return map;
  }, [taxesQuery.data]);

  const handleEditSubmit = async (values: ProductFormValues) => {
    await saveProductMutation.mutateAsync(values);
    setEditModalOpened(false);
    refetch();
  };

  const handleDeleteConfirm = async () => {
    if (!product) return;
    await deleteProductMutation.mutateAsync(product.id);
    navigate(routes.baseModules.products);
  };

  if (isLoading) {
    return (
      <AppShellLayout>
        <Container fluid p={{ base: 'md', sm: 'xl' }}>
          <Stack gap="lg">
            <Skeleton height={50} radius="md" />
            <Skeleton height={180} radius="lg" />
            <SimpleGrid cols={{ base: 1, md: 3 }}>
              <Skeleton height={200} radius="lg" />
              <Skeleton height={200} radius="lg" />
              <Skeleton height={200} radius="lg" />
            </SimpleGrid>
          </Stack>
        </Container>
      </AppShellLayout>
    );
  }

  if (isError || !product) {
    return (
      <AppShellLayout>
        <Container fluid p={{ base: 'md', sm: 'xl' }}>
          <Paper withBorder p="xl" radius="lg" ta="center">
            <ThemeIcon size={64} radius="xl" color="red" variant="light" mx="auto" mb="md">
              <IconX size={32} />
            </ThemeIcon>
            <Title order={3} c="dark.8">
              Produk Tidak Ditemukan
            </Title>
            <Text c="dimmed" size="sm" mt="xs" mb="lg">
              Data produk mungkin telah dihapus atau ID produk tidak valid.
            </Text>
            <Button
              variant="default"
              leftSection={<IconArrowLeft size={16} />}
              onClick={() => navigate(routes.baseModules.products)}
            >
              Kembali ke Daftar Produk
            </Button>
          </Paper>
        </Container>
      </AppShellLayout>
    );
  }

  const imageUrl = resolveProductImageUrl(product.image);

  return (
    <AppShellLayout>
      <Box p={{ base: 'md', sm: 'xl' }}>
        <Stack gap="lg">
          {/* Top Bar Navigation & Actions */}
          <Group justify="space-between" align="center" wrap="wrap" gap="sm">
            <Button
              variant="subtle"
              color="gray"
              leftSection={<IconArrowLeft size={18} />}
              onClick={() => navigate(routes.baseModules.products)}
            >
              Kembali ke Daftar Produk
            </Button>

            <Group gap="xs">
              <Button
                variant="outline"
                color="red"
                leftSection={<IconTrash size={16} />}
                onClick={() => setDeleteConfirmOpened(true)}
              >
                Hapus
              </Button>
              <Button
                color="primary"
                leftSection={<IconEdit size={16} />}
                onClick={() => setEditModalOpened(true)}
              >
                Ubah Produk
              </Button>
            </Group>
          </Group>

          {/* Hero Profile Banner */}
          <Paper
            withBorder
            radius="lg"
            p={{ base: 'md', sm: 'xl' }}
            style={{
              background:
                'linear-gradient(135deg, var(--mantine-color-white) 60%, var(--mantine-color-secondary-0) 100%)',
            }}
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
                        Tanpa Kategori
                      </Badge>
                    )}

                    <Badge
                      variant="light"
                      color={product.inventoryInfo.isTracked ? 'teal' : 'gray'}
                      size="sm"
                    >
                      {product.inventoryInfo.isTracked ? 'Stok Fisik Dilacak' : 'Non-Stok / Jasa'}
                    </Badge>

                    {product.externalCode && (
                      <Badge variant="default" size="sm" ff="monospace">
                        Ext: {product.externalCode}
                      </Badge>
                    )}
                  </Group>

                  <Text size="xs" c="dimmed" mt={8}>
                    Dibuat pada {formatDate(product.createdAt)} • Diperbarui pada{' '}
                    {formatDate(product.updatedAt)}
                  </Text>
                </Box>
              </Group>

              {/* Price Highlights */}
              <Group gap="xl">
                <Box ta={{ base: 'left', sm: 'right' }}>
                  <Text size="xs" fw={600} c="dimmed" tt="uppercase" lts={0.5}>
                    Harga Jual
                  </Text>
                  <Text fw={800} fz="xl" c={product.sellingInfo.isSold ? 'teal.7' : 'dimmed'}>
                    {product.sellingInfo.isSold
                      ? formatPrice(product.sellingInfo.unitPrice)
                      : 'Tidak Dijual'}
                  </Text>
                </Box>
                <Divider orientation="vertical" />
                <Box ta={{ base: 'left', sm: 'right' }}>
                  <Text size="xs" fw={600} c="dimmed" tt="uppercase" lts={0.5}>
                    Harga Beli
                  </Text>
                  <Text fw={800} fz="xl" c={product.buyingInfo.isPurchased ? 'blue.7' : 'dimmed'}>
                    {product.buyingInfo.isPurchased
                      ? formatPrice(product.buyingInfo.unitPrice)
                      : 'Tidak Dibeli'}
                  </Text>
                </Box>
              </Group>
            </Group>
          </Paper>

          {/* Detailed Information Grid */}
          <Grid gutter="lg">
            {/* Left 8 Cols: Financial Mapping & Accounts */}
            <Grid.Col span={{ base: 12, md: 8 }}>
              <Stack gap="lg">
                {/* Penjualan Detail Card */}
                <Card withBorder radius="md" p="lg" bg="white">
                  <Group justify="space-between" align="center" mb="md">
                    <Group gap="xs">
                      <ThemeIcon size={32} radius="md" color="teal" variant="light">
                        <IconTag size={18} />
                      </ThemeIcon>
                      <Box>
                        <Text fw={700} size="md" c="primary.9">
                          Pengaturan Penjualan
                        </Text>
                        <Text size="xs" c="dimmed">
                          Mapping akun dan tarif pajak saat membuat faktur atau tagihan pelanggan.
                        </Text>
                      </Box>
                    </Group>
                    <Badge color={product.sellingInfo.isSold ? 'teal' : 'gray'} variant="light">
                      {product.sellingInfo.isSold ? 'Aktif' : 'Nonaktif'}
                    </Badge>
                  </Group>

                  {product.sellingInfo.isSold ? (
                    <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                      <Paper withBorder p="sm" radius="md">
                        <Text size="xs" c="dimmed" fw={600}>
                          Akun Penjualan (Kredit)
                        </Text>
                        <Text size="sm" fw={600} c="primary.9" mt={4}>
                          {product.sellingInfo.salesAccount
                            ? (accountMap.get(product.sellingInfo.salesAccount) ??
                              product.sellingInfo.salesAccount)
                            : 'Belum diatur'}
                        </Text>
                      </Paper>

                      <Paper withBorder p="sm" radius="md">
                        <Text size="xs" c="dimmed" fw={600}>
                          Akun Piutang (Debit)
                        </Text>
                        <Text size="sm" fw={600} c="primary.9" mt={4}>
                          {product.sellingInfo.accountReceivable
                            ? (accountMap.get(product.sellingInfo.accountReceivable) ??
                              product.sellingInfo.accountReceivable)
                            : 'Belum diatur'}
                        </Text>
                      </Paper>

                      <Paper withBorder p="sm" radius="md">
                        <Text size="xs" c="dimmed" fw={600}>
                          Tarif Pajak Penjualan
                        </Text>
                        <Text size="sm" fw={600} c="dark.7" mt={4}>
                          {product.sellingInfo.salesTax
                            ? (taxMap.get(product.sellingInfo.salesTax) ??
                              product.sellingInfo.salesTax)
                            : 'Bebas Pajak (0%)'}
                        </Text>
                      </Paper>

                      <Paper withBorder p="sm" radius="md">
                        <Text size="xs" c="dimmed" fw={600}>
                          Harga Satuan Standar
                        </Text>
                        <Text size="sm" fw={700} c="teal.7" mt={4}>
                          {formatPrice(product.sellingInfo.unitPrice)}
                        </Text>
                      </Paper>
                    </SimpleGrid>
                  ) : (
                    <Alert color="gray" icon={<IconInfoCircle size={16} />}>
                      Produk ini tidak ditandai untuk dijual ke pelanggan.
                    </Alert>
                  )}
                </Card>

                {/* Pembelian Detail Card */}
                <Card withBorder radius="md" p="lg" bg="white">
                  <Group justify="space-between" align="center" mb="md">
                    <Group gap="xs">
                      <ThemeIcon size={32} radius="md" color="blue" variant="light">
                        <IconShoppingCart size={18} />
                      </ThemeIcon>
                      <Box>
                        <Text fw={700} size="md" c="primary.9">
                          Pengaturan Pembelian
                        </Text>
                        <Text size="xs" c="dimmed">
                          Mapping akun beban/biaya dan pajak saat transaksi pengadaan dari vendor.
                        </Text>
                      </Box>
                    </Group>
                    <Badge color={product.buyingInfo.isPurchased ? 'blue' : 'gray'} variant="light">
                      {product.buyingInfo.isPurchased ? 'Aktif' : 'Nonaktif'}
                    </Badge>
                  </Group>

                  {product.buyingInfo.isPurchased ? (
                    <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                      <Paper withBorder p="sm" radius="md">
                        <Text size="xs" c="dimmed" fw={600}>
                          Akun Pembelian / Beban (Debit)
                        </Text>
                        <Text size="sm" fw={600} c="primary.9" mt={4}>
                          {product.buyingInfo.purchaseAccount
                            ? (accountMap.get(product.buyingInfo.purchaseAccount) ??
                              product.buyingInfo.purchaseAccount)
                            : 'Belum diatur'}
                        </Text>
                      </Paper>

                      <Paper withBorder p="sm" radius="md">
                        <Text size="xs" c="dimmed" fw={600}>
                          Tarif Pajak Pembelian
                        </Text>
                        <Text size="sm" fw={600} c="dark.7" mt={4}>
                          {product.buyingInfo.purchaseTax
                            ? (taxMap.get(product.buyingInfo.purchaseTax) ??
                              product.buyingInfo.purchaseTax)
                            : 'Bebas Pajak (0%)'}
                        </Text>
                      </Paper>

                      <Paper withBorder p="sm" radius="md">
                        <Text size="xs" c="dimmed" fw={600}>
                          Harga Beli Satuan Standar
                        </Text>
                        <Text size="sm" fw={700} c="blue.7" mt={4}>
                          {formatPrice(product.buyingInfo.unitPrice)}
                        </Text>
                      </Paper>
                    </SimpleGrid>
                  ) : (
                    <Alert color="gray" icon={<IconInfoCircle size={16} />}>
                      Produk ini tidak ditandai untuk dibeli dari pemasok.
                    </Alert>
                  )}
                </Card>

                {/* Persediaan Detail Card */}
                <Card withBorder radius="md" p="lg" bg="white">
                  <Group justify="space-between" align="center" mb="md">
                    <Group gap="xs">
                      <ThemeIcon size={32} radius="md" color="indigo" variant="light">
                        <IconBuildingWarehouse size={18} />
                      </ThemeIcon>
                      <Box>
                        <Text fw={700} size="md" c="primary.9">
                          Manajemen Persediaan & Stok
                        </Text>
                        <Text size="xs" c="dimmed">
                          Pelacakan saldo fisik barang dan akun neraca persediaan.
                        </Text>
                      </Box>
                    </Group>
                    <Badge
                      color={product.inventoryInfo.isTracked ? 'indigo' : 'gray'}
                      variant="light"
                    >
                      {product.inventoryInfo.isTracked ? 'Dilacak' : 'Non-Stok'}
                    </Badge>
                  </Group>

                  {product.inventoryInfo.isTracked ? (
                    <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                      <Paper withBorder p="sm" radius="md">
                        <Text size="xs" c="dimmed" fw={600}>
                          Akun Aset Persediaan
                        </Text>
                        <Text size="sm" fw={600} c="primary.9" mt={4}>
                          {product.inventoryInfo.inventoryAccount
                            ? (accountMap.get(product.inventoryInfo.inventoryAccount) ??
                              product.inventoryInfo.inventoryAccount)
                            : 'Belum diatur'}
                        </Text>
                      </Paper>

                      <Paper withBorder p="sm" radius="md">
                        <Text size="xs" c="dimmed" fw={600}>
                          Batas Peringatan Stok Minimum
                        </Text>
                        <Text size="sm" fw={700} c="indigo.7" mt={4}>
                          {product.inventoryInfo.minStock} Unit
                        </Text>
                      </Paper>
                    </SimpleGrid>
                  ) : (
                    <Alert color="gray" icon={<IconInfoCircle size={16} />}>
                      Pelacakan stok dinonaktifkan. Nilai persediaan tidak dibukukan ke akun neraca
                      persediaan secara otomatis.
                    </Alert>
                  )}
                </Card>
              </Stack>
            </Grid.Col>

            {/* Right 4 Cols: Technical Specs & Quick Audit Box */}
            <Grid.Col span={{ base: 12, md: 4 }}>
              <Stack gap="lg">
                <Paper withBorder radius="md" p="lg" bg="white">
                  <Text fw={700} size="sm" c="primary.9" mb="md">
                    Rincian Teknis & Audit
                  </Text>

                  <Stack gap="sm">
                    <Group justify="space-between" wrap="nowrap">
                      <Text size="xs" c="dimmed">
                        ID Sistem (MongoDB)
                      </Text>
                      <Text size="xs" ff="monospace" c="dark.7">
                        {product.id}
                      </Text>
                    </Group>

                    <Divider />

                    <Group justify="space-between" wrap="nowrap">
                      <Text size="xs" c="dimmed">
                        SKU
                      </Text>
                      <Text size="xs" ff="monospace" fw={600}>
                        {product.sku}
                      </Text>
                    </Group>

                    {product.externalCode && (
                      <>
                        <Divider />
                        <Group justify="space-between" wrap="nowrap">
                          <Text size="xs" c="dimmed">
                            Kode Eksternal
                          </Text>
                          <Text size="xs" ff="monospace">
                            {product.externalCode}
                          </Text>
                        </Group>
                      </>
                    )}

                    <Divider />

                    <Group justify="space-between" wrap="nowrap">
                      <Text size="xs" c="dimmed">
                        Kategori
                      </Text>
                      <Text size="xs" fw={500}>
                        {product.category?.name ?? '—'}
                      </Text>
                    </Group>

                    <Divider />

                    <Group justify="space-between" wrap="nowrap">
                      <Text size="xs" c="dimmed">
                        Dibuat
                      </Text>
                      <Text size="xs">{formatDate(product.createdAt)}</Text>
                    </Group>

                    <Divider />

                    <Group justify="space-between" wrap="nowrap">
                      <Text size="xs" c="dimmed">
                        Terakhir Diperbarui
                      </Text>
                      <Text size="xs">{formatDate(product.updatedAt)}</Text>
                    </Group>
                  </Stack>
                </Paper>

                {/* Helpful Tips Card */}
                <Paper withBorder radius="md" p="md" bg="blue.0">
                  <Group gap="xs" align="flex-start">
                    <ThemeIcon size={24} radius="sm" color="blue" variant="filled">
                      <IconInfoCircle size={14} />
                    </ThemeIcon>
                    <Box style={{ flex: 1 }}>
                      <Text fw={600} size="xs" c="blue.9">
                        Integrasi Jurnal Otomatis
                      </Text>
                      <Text size="xs" c="blue.8" mt={4} lh={1.5}>
                        Setiap kali produk ini dipilih dalam modul Penjualan atau Pembelian, jurnal
                        akuntansi double-entry otomatis mencatat mutasi pada akun yang telah
                        dipetakan di atas.
                      </Text>
                    </Box>
                  </Group>
                </Paper>
              </Stack>
            </Grid.Col>
          </Grid>
        </Stack>
      </Box>

      {/* Modal Edit Product */}
      <Modal
        opened={editModalOpened}
        onClose={() => setEditModalOpened(false)}
        title={
          <Group gap="xs">
            <ThemeIcon size={32} radius="md" color="primary" variant="light">
              <IconEdit size={18} />
            </ThemeIcon>
            <Text fw={700} fz="md" c="primary.9">
              Ubah Informasi Produk
            </Text>
          </Group>
        }
        size="72rem"
        radius="lg"
        centered
        padding="lg"
      >
        <Box pos="relative">
          <LoadingOverlay
            visible={saveProductMutation.isPending}
            overlayProps={{ radius: 'md', blur: 2 }}
          />
          {editModalOpened && (
            <ProductForm
              product={product}
              isSubmitting={saveProductMutation.isPending}
              onSubmit={handleEditSubmit}
              onCancel={() => setEditModalOpened(false)}
            />
          )}
        </Box>
      </Modal>

      {/* Modal Confirm Delete */}
      <ConfirmModal
        opened={deleteConfirmOpened}
        onClose={() => setDeleteConfirmOpened(false)}
        title="Hapus Produk?"
        message={`Produk "${product.name}" akan dihapus dari katalog.`}
        helperText="Tindakan ini tidak dapat dibatalkan. Riwayat transaksi jurnal terdahulu yang menggunakan produk ini akan tetap tersimpan."
        confirmLoading={deleteProductMutation.isPending}
        onConfirm={handleDeleteConfirm}
      />
    </AppShellLayout>
  );
}

export default ProductDetailPage;
