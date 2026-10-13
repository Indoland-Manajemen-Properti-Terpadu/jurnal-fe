import { useMemo, useState } from 'react';
import {
  ActionIcon,
  Alert,
  Avatar,
  Badge,
  Box,
  Button,
  Card,
  CopyButton,
  Divider,
  Grid,
  Group,
  Paper,
  SimpleGrid,
  Skeleton,
  Stack,
  Table,
  Text,
  ThemeIcon,
  Title,
  Tooltip,
} from '@mantine/core';
import {
  IconAddressBook,
  IconArchive,
  IconArrowLeft,
  IconBuildingBank,
  IconCheck,
  IconCopy,
  IconEdit,
  IconFileInvoice,
  IconId,
  IconInfoCircle,
  IconMail,
  IconMapPin,
  IconPhone,
  IconUser,
  IconX,
} from '@tabler/icons-react';
import { useNavigate, useParams } from 'react-router-dom';
import AppShellLayout from '@/components/AppShellLayout';
import ConfirmModal from '@/components/ui/ConfirmModal/ConfirmModal';
import { routes } from '@/router/routes';
import { ContactFormModal } from '../components/ContactFormModal';
import {
  useAccountOptions,
  useArchiveContact,
  useContact,
  useSaveContact,
} from '../hooks/useContactQueries';
import type { ContactFormValues, ContactType } from '../types/contact';
import {
  formatContactName,
  formatDate,
  formatPaymentTerm,
  getContactTypeBadgeConfig,
  resolveAccountName,
} from '../utils/contactFormat';

const getInitials = (name: string): string => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

export function DetailContactPage() {
  const { idAccount } = useParams<{ idAccount: string }>();
  const navigate = useNavigate();

  const [editModalOpened, setEditModalOpened] = useState(false);
  const [archiveConfirmOpened, setArchiveConfirmOpened] = useState(false);

  // Queries
  const { data: contact, isLoading, isError, refetch } = useContact(idAccount);
  const accountsQuery = useAccountOptions();

  // Mutations
  const saveMutation = useSaveContact(contact?.id);
  const archiveMutation = useArchiveContact();

  // Lookups helper maps
  const accountMap = useMemo(() => {
    const map = new Map<string, string>();
    (accountsQuery.data ?? []).forEach((acc) => {
      map.set(acc.id, acc.label);
    });
    return map;
  }, [accountsQuery.data]);

  const handleEditSubmit = async (values: ContactFormValues) => {
    await saveMutation.mutateAsync(values);
    setEditModalOpened(false);
    refetch();
  };

  const handleArchiveConfirm = async () => {
    if (!contact) return;
    await archiveMutation.mutateAsync(contact.id);
    navigate(routes.Contact.Main);
  };

  if (isLoading) {
    return (
      <AppShellLayout>
        <Box p={{ base: 'md', sm: 'xl' }}>
          <Stack gap="lg">
            <Skeleton height={50} radius="md" />
            <Skeleton height={170} radius="lg" />
            <SimpleGrid cols={{ base: 1, md: 3 }} spacing="md">
              <Skeleton height={200} radius="lg" />
              <Skeleton height={200} radius="lg" />
              <Skeleton height={200} radius="lg" />
            </SimpleGrid>
          </Stack>
        </Box>
      </AppShellLayout>
    );
  }

  if (isError || !contact) {
    return (
      <AppShellLayout>
        <Box p={{ base: 'md', sm: 'xl' }}>
          <Paper withBorder p="xl" radius="lg" ta="center" bg="white">
            <ThemeIcon size={64} radius="xl" color="red" variant="light" mx="auto" mb="md">
              <IconX size={32} />
            </ThemeIcon>
            <Title order={3} c="dark.8">
              Kontak Tidak Ditemukan
            </Title>
            <Text c="dimmed" size="sm" mt="xs" mb="lg">
              Data kontak mungkin telah dihapus atau ID kontak tidak valid di sistem.
            </Text>
            <Button
              variant="default"
              leftSection={<IconArrowLeft size={16} />}
              onClick={() => navigate(routes.Contact.Main)}
            >
              Kembali ke Direktori Kontak
            </Button>
          </Paper>
        </Box>
      </AppShellLayout>
    );
  }

  const initials = getInitials(contact.displayName);
  const fullNameStr = formatContactName(contact);
  const arLabel = resolveAccountName(contact.mappingAccount?.arAccount, accountMap);
  const apLabel = resolveAccountName(contact.mappingAccount?.apAccount, accountMap);

  return (
    <AppShellLayout>
      <Box p={{ base: 'md', sm: 'xl' }}>
        <Stack gap="lg">
          {/* Top Bar Navigation & Actions */}
          <Paper
            withBorder
            radius="lg"
            p={{ base: 'md', sm: 'lg' }}
            style={{
              background:
                'linear-gradient(135deg, var(--mantine-color-white) 60%, var(--mantine-color-secondary-0) 100%)',
            }}
          >
            <Group justify="space-between" align="center" wrap="wrap" gap="sm">
              <Button
                variant="subtle"
                color="gray"
                leftSection={<IconArrowLeft size={18} />}
                onClick={() => navigate(routes.Contact.Main)}
              >
                Kembali ke Direktori Kontak
              </Button>

              <Group gap="xs">
                <Button
                  variant="outline"
                  color="red"
                  leftSection={<IconArchive size={16} />}
                  onClick={() => setArchiveConfirmOpened(true)}
                >
                  Arsipkan
                </Button>
                <Button
                  color="primary"
                  leftSection={<IconEdit size={16} />}
                  onClick={() => setEditModalOpened(true)}
                >
                  Ubah Data Kontak
                </Button>
              </Group>
            </Group>
          </Paper>

          {/* Hero Profile Banner */}
          <Paper
            withBorder
            radius="lg"
            p={{ base: 'md', sm: 'xl' }}
            style={{
              background:
                'linear-gradient(135deg, var(--mantine-color-white) 65%, var(--mantine-color-secondary-0) 100%)',
            }}
          >
            <Group justify="space-between" align="flex-start" wrap="wrap" gap="lg">
              <Group gap="lg" align="flex-start">
                <Avatar
                  size={92}
                  radius="md"
                  color="primary"
                  variant="light"
                  fw={700}
                  fz={32}
                  style={{
                    border: '2px solid var(--mantine-color-gray-2)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                  }}
                >
                  {initials}
                </Avatar>

                <Box>
                  <Group gap="xs" align="center" wrap="wrap">
                    <Title order={2} fz={{ base: 22, sm: 26 }} c="primary.9">
                      {contact.displayName}
                    </Title>
                    <Badge variant="light" color="primary" size="md" ff="monospace">
                      {contact.contactNumber || '—'}
                    </Badge>
                  </Group>

                  <Group gap="xs" mt={8} wrap="wrap">
                    {contact.contactType && contact.contactType.length > 0 ? (
                      contact.contactType.map((t: ContactType) => {
                        const cfg = getContactTypeBadgeConfig(t);
                        return (
                          <Badge
                            key={t}
                            variant="filled"
                            color={cfg.color}
                            size="sm"
                            radius="sm"
                          >
                            {cfg.label}
                          </Badge>
                        );
                      })
                    ) : (
                      <Badge variant="outline" color="gray" size="sm">
                        Lainnya
                      </Badge>
                    )}

                    {contact.companyName && (
                      <Badge variant="outline" color="secondary.8" size="sm">
                        {contact.companyName}
                      </Badge>
                    )}

                    {contact.npwp && (
                      <Badge variant="dot" color="blue" size="sm">
                        NPWP: {contact.npwp}
                      </Badge>
                    )}
                  </Group>
                </Box>
              </Group>
            </Group>
          </Paper>

          {/* Detail Grid */}
          <Grid gutter="lg">
            {/* Left 8 Cols: Contact Profile & Financial Mapping */}
            <Grid.Col span={{ base: 12, md: 8 }}>
              <Stack gap="lg">
                {/* 1. Informasi Kontak & Identitas */}
                <Card withBorder radius="md" p="lg" bg="white">
                  <Group gap="xs" mb="md">
                    <ThemeIcon size={32} radius="md" color="primary" variant="light">
                      <IconUser size={18} />
                    </ThemeIcon>
                    <Box>
                      <Text fw={700} size="md" c="primary.9">
                        Profil & Identitas Pribadi
                      </Text>
                      <Text size="xs" c="dimmed">
                        Informasi lengkap nama resmi, identitas kependudukan, dan saluran komunikasi.
                      </Text>
                    </Box>
                  </Group>

                  <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                    <Paper withBorder p="sm" radius="md">
                      <Text size="xs" c="dimmed" fw={600}>
                        Nama Lengkap Resmi
                      </Text>
                      <Text size="sm" fw={600} c="dark.8" mt={4}>
                        {fullNameStr || '—'}
                      </Text>
                    </Paper>

                    <Paper withBorder p="sm" radius="md">
                      <Text size="xs" c="dimmed" fw={600}>
                        Perusahaan
                      </Text>
                      <Text size="sm" fw={600} c="dark.8" mt={4}>
                        {contact.companyName || '—'}
                      </Text>
                    </Paper>

                    <Paper withBorder p="sm" radius="md">
                      <Text size="xs" c="dimmed" fw={600}>
                        NPWP
                      </Text>
                      <Text size="sm" fw={600} ff="monospace" c="dark.8" mt={4}>
                        {contact.npwp || '—'}
                      </Text>
                    </Paper>

                    <Paper withBorder p="sm" radius="md">
                      <Text size="xs" c="dimmed" fw={600}>
                        Identitas ({contact.identity?.type || 'KTP'})
                      </Text>
                      <Text size="sm" fw={600} ff="monospace" c="dark.8" mt={4}>
                        {contact.identity?.number || '—'}
                      </Text>
                    </Paper>

                    <Paper withBorder p="sm" radius="md">
                      <Text size="xs" c="dimmed" fw={600}>
                        Email
                      </Text>
                      <Text size="sm" fw={600} c="dark.8" mt={4}>
                        {(contact.emails && contact.emails.length > 0 && contact.emails[0]) || '—'}
                      </Text>
                    </Paper>

                    <Paper withBorder p="sm" radius="md">
                      <Text size="xs" c="dimmed" fw={600}>
                        No. Handphone (Mobile)
                      </Text>
                      <Text size="sm" fw={600} c="dark.8" mt={4}>
                        {contact.phones?.mobile || '—'}
                      </Text>
                    </Paper>

                    <Paper withBorder p="sm" radius="md">
                      <Text size="xs" c="dimmed" fw={600}>
                        Telepon Kantor
                      </Text>
                      <Text size="sm" fw={600} c="dark.8" mt={4}>
                        {contact.phones?.telephone || '—'}
                      </Text>
                    </Paper>

                    <Paper withBorder p="sm" radius="md">
                      <Text size="xs" c="dimmed" fw={600}>
                        Nomor Fax
                      </Text>
                      <Text size="sm" fw={600} c="dark.8" mt={4}>
                        {contact.phones?.fax || '—'}
                      </Text>
                    </Paper>
                  </SimpleGrid>

                  <Paper withBorder p="sm" radius="md" mt="md" bg="gray.0">
                    <Text size="xs" c="dimmed" fw={600}>
                      Catatan Tambahan
                    </Text>
                    <Text size="xs" c="dark.8" mt={2}>
                      {contact.otherInfo || '—'}
                    </Text>
                  </Paper>
                </Card>

                {/* 2. Alamat Penagihan & Pengiriman */}
                <Card withBorder radius="md" p="lg" bg="white">
                  <Group gap="xs" mb="md">
                    <ThemeIcon size={32} radius="md" color="teal" variant="light">
                      <IconMapPin size={18} />
                    </ThemeIcon>
                    <Box>
                      <Text fw={700} size="md" c="primary.9">
                        Alamat Domisili & Logistik
                      </Text>
                      <Text size="xs" c="dimmed">
                        Alamat untuk pengiriman tagihan (billing) dan pengantaran fisik barang (shipping).
                      </Text>
                    </Box>
                  </Group>

                  <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                    <Paper withBorder p="sm" radius="md">
                      <Text size="xs" c="dimmed" fw={600} mb={4}>
                        Alamat Penagihan (Billing)
                      </Text>
                      <Text size="sm" fw={500} c="dark.8" lh={1.5}>
                        {contact.addresses?.billing?.general || '—'}
                      </Text>
                      {contact.addresses?.billing?.detail?.city && (
                        <Text size="xs" c="dimmed" mt={4}>
                          {[
                            contact.addresses.billing.detail.city,
                            contact.addresses.billing.detail.province,
                            contact.addresses.billing.detail.zipCode,
                          ]
                            .filter(Boolean)
                            .join(', ')}
                        </Text>
                      )}
                    </Paper>

                    <Paper withBorder p="sm" radius="md">
                      <Group justify="space-between" align="center" mb={4}>
                        <Text size="xs" c="dimmed" fw={600}>
                          Alamat Pengiriman (Shipping)
                        </Text>
                        {contact.addresses?.shipping?.isSameAsBilling && (
                          <Badge size="xs" variant="light" color="teal">
                            Sama dengan billing
                          </Badge>
                        )}
                      </Group>
                      <Text size="sm" fw={500} c="dark.8" lh={1.5}>
                        {contact.addresses?.shipping?.general ||
                          (contact.addresses?.shipping?.isSameAsBilling
                            ? contact.addresses?.billing?.general
                            : undefined) ||
                          '—'}
                      </Text>
                    </Paper>
                  </SimpleGrid>
                </Card>

                {/* 3. Rekening Bank */}
                <Card withBorder radius="md" p="lg" bg="white">
                  <Group gap="xs" mb="md">
                    <ThemeIcon size={32} radius="md" color="indigo" variant="light">
                      <IconBuildingBank size={18} />
                    </ThemeIcon>
                    <Box>
                      <Text fw={700} size="md" c="primary.9">
                        Rekening Bank
                      </Text>
                      <Text size="xs" c="dimmed">
                        Daftar rekening terdaftar untuk transaksi perbankan dan transfer dana.
                      </Text>
                    </Box>
                  </Group>

                  {(() => {
                    const validBankAccounts = (contact.bankAccounts || []).filter(
                      (b) =>
                        Boolean(
                          b.bankName?.trim() ||
                            b.accountNumber?.trim() ||
                            b.accountHolder?.trim() ||
                            b.branch?.trim()
                        )
                    );

                    if (validBankAccounts.length === 0) {
                      return (
                        <Alert color="gray" icon={<IconInfoCircle size={16} />}>
                          Belum ada rekening bank yang tersimpan untuk kontak ini.
                        </Alert>
                      );
                    }

                    return (
                      <Table.ScrollContainer minWidth={500}>
                        <Table verticalSpacing="xs">
                          <Table.Thead bg="gray.0">
                            <Table.Tr>
                              <Table.Th>
                                <Text size="xs" fw={700} c="dimmed">
                                  Nama Bank
                                </Text>
                              </Table.Th>
                              <Table.Th>
                                <Text size="xs" fw={700} c="dimmed">
                                  Nomor Rekening
                                </Text>
                              </Table.Th>
                              <Table.Th>
                                <Text size="xs" fw={700} c="dimmed">
                                  Atas Nama
                                </Text>
                              </Table.Th>
                              <Table.Th>
                                <Text size="xs" fw={700} c="dimmed">
                                  Cabang
                                </Text>
                              </Table.Th>
                            </Table.Tr>
                          </Table.Thead>
                          <Table.Tbody>
                            {validBankAccounts.map((b, idx) => (
                              // eslint-disable-next-line react/no-array-index-key
                              <Table.Tr key={`bank-${idx}`}>
                                <Table.Td>
                                  <Text size="sm" fw={600} c="primary.9">
                                    {b.bankName || '—'}
                                  </Text>
                                </Table.Td>
                                <Table.Td>
                                  <Text size="sm" ff="monospace" fw={600} c="dark.8">
                                    {b.accountNumber || '—'}
                                  </Text>
                                </Table.Td>
                                <Table.Td>
                                  <Text size="sm" c="dark.8">
                                    {b.accountHolder || '—'}
                                  </Text>
                                </Table.Td>
                                <Table.Td>
                                  <Text size="sm" c="dimmed">
                                    {b.branch || '—'}
                                  </Text>
                                </Table.Td>
                              </Table.Tr>
                            ))}
                          </Table.Tbody>
                        </Table>
                      </Table.ScrollContainer>
                    );
                  })()}
                </Card>

                {/* 4. Pemetaan Akun Akuntansi (Account Mapping) */}
                <Card withBorder radius="md" p="lg" bg="white">
                  <Group justify="space-between" align="center" mb="md">
                    <Group gap="xs">
                      <ThemeIcon size={32} radius="md" color="blue" variant="light">
                        <IconFileInvoice size={18} />
                      </ThemeIcon>
                      <Box>
                        <Text fw={700} size="md" c="primary.9">
                          Pemetaan Akun Akuntansi (Account Mapping)
                        </Text>
                        <Text size="xs" c="dimmed">
                          Akun neraca piutang & hutang yang otomatis dibukukan saat bertransaksi dengan kontak ini.
                        </Text>
                      </Box>
                    </Group>
                    <Badge color="blue" variant="light">
                      Double-Entry Ready
                    </Badge>
                  </Group>

                  <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                    <Paper withBorder p="sm" radius="md">
                      <Text size="xs" c="dimmed" fw={600}>
                        Akun Piutang (Accounts Receivable)
                      </Text>
                      <Text size="sm" fw={600} c={arLabel === '—' ? 'dimmed' : 'teal.8'} mt={4}>
                        {arLabel}
                      </Text>
                      <Text size="xs" c="dimmed" mt={2}>
                        Digunakan pada faktur / invoice penjualan ke pelanggan.
                      </Text>
                    </Paper>

                    <Paper withBorder p="sm" radius="md">
                      <Text size="xs" c="dimmed" fw={600}>
                        Akun Hutang (Accounts Payable)
                      </Text>
                      <Text size="sm" fw={600} c={apLabel === '—' ? 'dimmed' : 'blue.8'} mt={4}>
                        {apLabel}
                      </Text>
                      <Text size="xs" c="dimmed" mt={2}>
                        Digunakan pada tagihan / bill pembelian dari vendor.
                      </Text>
                    </Paper>

                    <Paper withBorder p="sm" radius="md">
                      <Text size="xs" c="dimmed" fw={600}>
                        Termin Pembayaran Default
                      </Text>
                      <Text size="sm" fw={700} c={formatPaymentTerm(contact.mappingAccount?.defaultPaymentTerm) === '—' ? 'dimmed' : 'dark.8'} mt={4}>
                        {formatPaymentTerm(contact.mappingAccount?.defaultPaymentTerm)}
                      </Text>
                      <Text size="xs" c="dimmed" mt={2}>
                        Jatuh tempo faktur otomatis dihitung berdasarkan termin ini.
                      </Text>
                    </Paper>

                    <Paper withBorder p="sm" radius="md">
                      <Text size="xs" c="dimmed" fw={600}>
                        Batas Maksimum Piutang (Kredit)
                      </Text>
                      <Text size="sm" fw={600} c={contact.mappingAccount?.maxReceivable?.isActive ? 'dark.8' : 'dimmed'} mt={4}>
                        {contact.mappingAccount?.maxReceivable?.isActive
                          ? `Rp ${contact.mappingAccount.maxReceivable.amount.toLocaleString('id-ID')}`
                          : '—'}
                      </Text>
                      <Text size="xs" c="dimmed" mt={2}>
                        Membatasi nilai outstanding transaksi piutang.
                      </Text>
                    </Paper>

                    <Paper withBorder p="sm" radius="md">
                      <Text size="xs" c="dimmed" fw={600}>
                        Batas Maksimum Hutang
                      </Text>
                      <Text size="sm" fw={600} c={contact.mappingAccount?.maxPayable?.isActive ? 'dark.8' : 'dimmed'} mt={4}>
                        {contact.mappingAccount?.maxPayable?.isActive
                          ? `Rp ${contact.mappingAccount.maxPayable.amount.toLocaleString('id-ID')}`
                          : '—'}
                      </Text>
                      <Text size="xs" c="dimmed" mt={2}>
                        Membatasi nilai outstanding transaksi hutang ke vendor.
                      </Text>
                    </Paper>
                  </SimpleGrid>
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
                    {/* ID Sistem */}
                    <Group justify="space-between" wrap="nowrap" align="center">
                      <Text size="xs" c="dimmed">
                        ID Sistem (MongoDB)
                      </Text>
                      <Group gap={4} wrap="nowrap">
                        <Text size="xs" ff="monospace" c="dark.7" fw={500}>
                          {contact.id}
                        </Text>
                        <CopyButton value={contact.id} timeout={2000}>
                          {({ copied, copy }) => (
                            <Tooltip label={copied ? 'Tersalin' : 'Salin ID'} withArrow position="top">
                              <ActionIcon
                                color={copied ? 'teal' : 'gray'}
                                variant="subtle"
                                size="xs"
                                onClick={copy}
                                aria-label="Salin ID Sistem"
                              >
                                {copied ? <IconCheck size={12} /> : <IconCopy size={12} />}
                              </ActionIcon>
                            </Tooltip>
                          )}
                        </CopyButton>
                      </Group>
                    </Group>

                    <Divider />

                    {/* Nomor Kontak */}
                    <Group justify="space-between" wrap="nowrap" align="center">
                      <Text size="xs" c="dimmed">
                        Nomor Kontak
                      </Text>
                      <Group gap={4} wrap="nowrap">
                        <Text size="xs" ff="monospace" fw={600} c="dark.8">
                          {contact.contactNumber || '—'}
                        </Text>
                        {contact.contactNumber && (
                          <CopyButton value={contact.contactNumber} timeout={2000}>
                            {({ copied, copy }) => (
                              <Tooltip label={copied ? 'Tersalin' : 'Salin Nomor'} withArrow position="top">
                                <ActionIcon
                                  color={copied ? 'teal' : 'gray'}
                                  variant="subtle"
                                  size="xs"
                                  onClick={copy}
                                  aria-label="Salin Nomor Kontak"
                                >
                                  {copied ? <IconCheck size={12} /> : <IconCopy size={12} />}
                                </ActionIcon>
                              </Tooltip>
                            )}
                          </CopyButton>
                        )}
                      </Group>
                    </Group>

                    <Divider />

                    {/* Kode Eksternal */}
                    <Group justify="space-between" wrap="nowrap" align="center">
                      <Text size="xs" c="dimmed">
                        Kode Eksternal
                      </Text>
                      <Group gap={4} wrap="nowrap">
                        <Text size="xs" ff="monospace" c={contact.external_id ? 'dark.8' : 'dimmed'} fw={500}>
                          {contact.external_id || '—'}
                        </Text>
                        {contact.external_id ? (
                          <CopyButton value={contact.external_id} timeout={2000}>
                            {({ copied, copy }) => (
                              <Tooltip
                                label={copied ? 'Tersalin' : 'Salin Kode Eksternal'}
                                withArrow
                                position="top"
                              >
                                <ActionIcon
                                  color={copied ? 'teal' : 'gray'}
                                  variant="subtle"
                                  size="xs"
                                  onClick={copy}
                                  aria-label="Salin Kode Eksternal"
                                >
                                  {copied ? <IconCheck size={12} /> : <IconCopy size={12} />}
                                </ActionIcon>
                              </Tooltip>
                            )}
                          </CopyButton>
                        ) : null}
                      </Group>
                    </Group>

                    <Divider />

                    {/* Status */}
                    <Group justify="space-between" wrap="nowrap" align="center">
                      <Text size="xs" c="dimmed">
                        Status Kontak
                      </Text>
                      <Badge color={contact.deleted ? 'red' : 'teal'} variant="light" size="xs">
                        {contact.deleted ? 'Diarsipkan' : 'Aktif'}
                      </Badge>
                    </Group>

                    <Divider />

                    {/* Dibuat */}
                    <Group justify="space-between" wrap="nowrap" align="center">
                      <Text size="xs" c="dimmed">
                        Dibuat
                      </Text>
                      <Text size="xs" fw={500} c="dark.8">
                        {formatDate(contact.createdAt)}
                      </Text>
                    </Group>

                    <Divider />

                    {/* Terakhir Diperbarui */}
                    <Group justify="space-between" wrap="nowrap" align="center">
                      <Text size="xs" c="dimmed">
                        Terakhir Diperbarui
                      </Text>
                      <Text size="xs" fw={500} c="dark.8">
                        {formatDate(contact.updatedAt)}
                      </Text>
                    </Group>
                  </Stack>
                </Paper>

                {/* Info Card */}
                <Paper withBorder radius="md" p="md" bg="blue.0">
                  <Group gap="xs" align="flex-start">
                    <ThemeIcon size={24} radius="sm" color="blue" variant="filled">
                      <IconInfoCircle size={14} />
                    </ThemeIcon>
                    <Box style={{ flex: 1 }}>
                      <Text fw={600} size="xs" c="blue.9">
                        Integrasi Transaksi Otomatis
                      </Text>
                      <Text size="xs" c="blue.8" mt={4} lh={1.5}>
                        Setiap transaksi penjualan atau pembelian yang menggunakan kontak ini akan
                        langsung mencatat ayat jurnal ke akun piutang atau hutang yang telah Anda petakan.
                      </Text>
                    </Box>
                  </Group>
                </Paper>
              </Stack>
            </Grid.Col>
          </Grid>
        </Stack>
      </Box>

      {/* Edit Contact Modal */}
      <ContactFormModal
        opened={editModalOpened}
        contact={contact}
        isSubmitting={saveMutation.isPending}
        onClose={() => setEditModalOpened(false)}
        onSubmit={handleEditSubmit}
      />

      {/* Archive Confirm Modal */}
      <ConfirmModal
        opened={archiveConfirmOpened}
        onClose={() => setArchiveConfirmOpened(false)}
        onConfirm={handleArchiveConfirm}
        title="Arsipkan Kontak Ini?"
        message={`Apakah Anda yakin ingin mengarsipkan kontak "${contact.displayName}"? Data historis transaksi tetap aman tersimpan.`}
        confirmLabel="Arsipkan"
        confirmLoading={archiveMutation.isPending}
        confirmButtonProps={{ color: 'red' }}
      />
    </AppShellLayout>
  );
}

export default DetailContactPage;
