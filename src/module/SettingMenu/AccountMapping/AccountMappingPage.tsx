import { useEffect, useState } from 'react';
import {
  ActionIcon,
  Alert,
  Badge,
  Button,
  Card,
  Divider,
  Group,
  Modal,
  Paper,
  Select,
  Skeleton,
  Stack,
  Table,
  Tabs,
  Text,
  TextInput,
  ThemeIcon,
  Title,
  Tooltip,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import {
  IconAlertCircle,
  IconArrowRight,
  IconCheck,
  IconDeviceFloppy,
  IconEdit,
  IconRefresh,
  IconSearch,
  IconSitemap,
  IconSparkles,
} from '@tabler/icons-react';
import SettingsLayout from '../components/SettingsLayout';
import {
  useAccountMappings,
  useSeedAccountMappings,
  useUpdateAccountMapping,
  useUpdateAccountMappingBatch,
} from '../hooks/useSettingQueries';
import { getJournalAccounts } from '@/module/GeneralJournal/JournalAccount/services/AccountJournal.service';
import type { AccountMappingItem } from '../services/settingApi';

const GROUP_LABELS: Record<string, { label: string; color: string }> = {
  ar_ap: { label: 'Piutang & Hutang (AR/AP)', color: 'blue' },
  sales: { label: 'Penjualan (Sales)', color: 'teal' },
  purchase: { label: 'Pembelian (Purchase)', color: 'orange' },
  inventory: { label: 'Persediaan (Inventory)', color: 'grape' },
  other: { label: 'Lainnya & Aset Tetap', color: 'gray' },
};

export default function AccountMappingPage() {
  const { data: mappingsData, isLoading, refetch } = useAccountMappings();
  const seedMutation = useSeedAccountMappings();
  const updateBatchMutation = useUpdateAccountMappingBatch();
  const updateSingleMutation = useUpdateAccountMapping();

  const [activeTab, setActiveTab] = useState<string>('all');
  const [search, setSearch] = useState<string>('');
  const [accounts, setAccounts] = useState<Array<{ value: string; label: string }>>([]);
  const [isAccountsLoading, setIsAccountsLoading] = useState(false);

  // Draft state for batch edits: mappingId -> accountId
  const [draftChanges, setDraftChanges] = useState<Record<string, string>>({});

  // Single Edit Modal State
  const [editModalOpened, { open: openEditModal, close: closeEditModal }] = useDisclosure(false);
  const [editingItem, setEditingItem] = useState<AccountMappingItem | null>(null);
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);

  // Load COA accounts for selector
  useEffect(() => {
    const loadAccounts = async () => {
      try {
        setIsAccountsLoading(true);
        const res = await getJournalAccounts();
        if (Array.isArray(res)) {
          const uniqueMap = new Map<string, { value: string; label: string }>();
          res.forEach((acc: any) => {
            if (acc?.id && !uniqueMap.has(acc.id)) {
              uniqueMap.set(acc.id, {
                value: acc.id,
                label: `${acc.accountNumber ? `${acc.accountNumber} - ` : ''}${acc.name} (${acc.type || acc.category?.name || 'Akun'})`,
              });
            }
          });
          setAccounts(Array.from(uniqueMap.values()));
        }
      } catch (err) {
        console.error('Failed to load accounts for mapping:', err);
      } finally {
        setIsAccountsLoading(false);
      }
    };
    loadAccounts();
  }, []);

  // Flatten all mapping items
  const allItems: AccountMappingItem[] = Object.entries(mappingsData || {}).flatMap(
    ([group, items]) => (Array.isArray(items) ? items.map((it) => ({ ...it, group })) : [])
  );

  const filteredItems = allItems.filter((item) => {
    const matchesTab = activeTab === 'all' || item.group === activeTab;
    const matchesSearch =
      item.label.toLowerCase().includes(search.toLowerCase()) ||
      item.key.toLowerCase().includes(search.toLowerCase()) ||
      (item.account?.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (item.account?.accountNumber || '').toLowerCase().includes(search.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const hasDraftChanges = Object.keys(draftChanges).length > 0;

  const handleAccountChange = (mappingId: string, newAccountId: string) => {
    setDraftChanges((prev) => ({
      ...prev,
      [mappingId]: newAccountId,
    }));
  };

  const handleSaveBatch = async () => {
    const payload = Object.entries(draftChanges).map(([id, account]) => ({
      id,
      account,
    }));
    if (payload.length === 0) return;
    await updateBatchMutation.mutateAsync(payload);
    setDraftChanges({});
  };

  const handleOpenSingleEdit = (item: AccountMappingItem) => {
    setEditingItem(item);
    setSelectedAccountId(item.account?.id || null);
    openEditModal();
  };

  const handleSaveSingleEdit = async () => {
    if (!editingItem || !selectedAccountId) return;
    await updateSingleMutation.mutateAsync({
      id: editingItem.id,
      accountId: selectedAccountId,
    });
    closeEditModal();
  };

  const handleSeedDefaults = async () => {
    await seedMutation.mutateAsync();
    refetch();
  };

  return (
    <SettingsLayout
      title="Pemetaan Akun Default (Account Mapping)"
      description="Konfigurasi akun bawaan Chart of Accounts (COA) yang otomatis digunakan saat pencatatan transaksi penjualan, pembelian, persediaan, dan buku besar."
      action={
        <Group gap="xs">
          <Button
            variant="default"
            leftSection={<IconRefresh size={16} />}
            onClick={() => refetch()}
            loading={isLoading}
          >
            Segarkan
          </Button>
          {allItems.length === 0 && (
            <Button
              color="indigo"
              leftSection={<IconSparkles size={16} />}
              onClick={handleSeedDefaults}
              loading={seedMutation.isPending}
            >
              Generate Pemetaan Default
            </Button>
          )}
          {hasDraftChanges && (
            <Button
              color="primary"
              leftSection={<IconDeviceFloppy size={16} />}
              onClick={handleSaveBatch}
              loading={updateBatchMutation.isPending}
            >
              Simpan {Object.keys(draftChanges).length} Perubahan
            </Button>
          )}
        </Group>
      }
    >
      <Stack gap="lg">
        {hasDraftChanges && (
          <Alert icon={<IconAlertCircle size={16} />} color="orange" radius="md">
            <Group justify="space-between" align="center">
              <Text size="sm">
                Ada <strong>{Object.keys(draftChanges).length}</strong> pemetaan akun yang diubah dan belum disimpan ke server.
              </Text>
              <Group gap="xs">
                <Button size="xs" variant="default" onClick={() => setDraftChanges({})}>
                  Batalkan
                </Button>
                <Button
                  size="xs"
                  color="primary"
                  onClick={handleSaveBatch}
                  loading={updateBatchMutation.isPending}
                >
                  Simpan Sekarang
                </Button>
              </Group>
            </Group>
          </Alert>
        )}

        <Paper withBorder p="md" radius="md" bg="white">
          <Group justify="space-between" wrap="wrap" gap="md">
            <Tabs value={activeTab} onChange={(val) => setActiveTab(val || 'all')} variant="pills" radius="md">
              <Tabs.List>
                <Tabs.Tab value="all">Semua ({allItems.length})</Tabs.Tab>
                <Tabs.Tab value="ar_ap">Piutang & Hutang</Tabs.Tab>
                <Tabs.Tab value="sales">Penjualan</Tabs.Tab>
                <Tabs.Tab value="purchase">Pembelian</Tabs.Tab>
                <Tabs.Tab value="inventory">Persediaan</Tabs.Tab>
                <Tabs.Tab value="other">Lainnya</Tabs.Tab>
              </Tabs.List>
            </Tabs>

            <TextInput
              placeholder="Cari label atau akun..."
              leftSection={<IconSearch size={16} />}
              value={search}
              onChange={(e) => setSearch(e.currentTarget.value)}
              w={{ base: '100%', sm: 260 }}
              radius="md"
            />
          </Group>
        </Paper>

        {isLoading ? (
          <Card withBorder radius="md" p="xl" bg="white">
            <Stack gap="md">
              <Skeleton height={40} radius="md" />
              <Skeleton height={40} radius="md" />
              <Skeleton height={40} radius="md" />
            </Stack>
          </Card>
        ) : filteredItems.length === 0 ? (
          <Paper withBorder p="xl" radius="md" ta="center" bg="white">
            <ThemeIcon size={48} radius="xl" color="indigo" variant="light" mx="auto" mb="sm">
              <IconSitemap size={24} />
            </ThemeIcon>
            <Title order={4} c="dark.8">
              Belum Ada Pemetaan Akun
            </Title>
            <Text size="sm" c="dimmed" mt={4} maw={450} mx="auto">
              Sistem membutuhkan akun pemetaan default agar transaksi penjualan, pembelian, dan persediaan dapat langsung dibukukan ke jurnal umum.
            </Text>
            <Button
              mt="md"
              color="indigo"
              leftSection={<IconSparkles size={16} />}
              onClick={handleSeedDefaults}
              loading={seedMutation.isPending}
            >
              Generate Pemetaan Akun Bawaan
            </Button>
          </Paper>
        ) : (
          <Paper withBorder radius="md" bg="white" style={{ overflow: 'hidden' }}>
            <Table highlightOnHover verticalSpacing="sm" horizontalSpacing="md">
              <Table.Thead bg="gray.0">
                <Table.Tr>
                  <Table.Th style={{ width: '22%' }}>Kategori / Grup</Table.Th>
                  <Table.Th style={{ width: '28%' }}>Parameter Sistem</Table.Th>
                  <Table.Th style={{ width: '40%' }}>Akun Chart of Accounts (COA) Terpilih</Table.Th>
                  <Table.Th style={{ width: '10%', textAlign: 'center' }}>Aksi</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {filteredItems.map((item) => {
                  const grp = GROUP_LABELS[item.group] || { label: item.group, color: 'gray' };
                  const currentAccountId = draftChanges[item.id] ?? item.account?.id ?? '';
                  const isModified = Boolean(draftChanges[item.id]);

                  return (
                    <Table.Tr key={item.id} bg={isModified ? 'orange.0' : undefined}>
                      <Table.Td>
                        <Badge color={grp.color} variant="light" size="sm">
                          {grp.label}
                        </Badge>
                      </Table.Td>
                      <Table.Td>
                        <Text size="sm" fw={600} c="dark.8">
                          {item.label}
                        </Text>
                        <Text size="xs" c="dimmed" ff="monospace">
                          {item.key}
                        </Text>
                      </Table.Td>
                      <Table.Td>
                        <Select
                          data={accounts}
                          value={currentAccountId}
                          onChange={(val) => val && handleAccountChange(item.id, val)}
                          searchable
                          clearable={false}
                          disabled={isAccountsLoading}
                          placeholder="Pilih akun COA..."
                          size="xs"
                          radius="md"
                        />
                      </Table.Td>
                      <Table.Td style={{ textAlign: 'center' }}>
                        <Tooltip label="Ubah Akun (Modal Dialog)">
                          <ActionIcon
                            variant="subtle"
                            color="primary"
                            onClick={() => handleOpenSingleEdit(item)}
                          >
                            <IconEdit size={16} />
                          </ActionIcon>
                        </Tooltip>
                      </Table.Td>
                    </Table.Tr>
                  );
                })}
              </Table.Tbody>
            </Table>
          </Paper>
        )}
      </Stack>

      {/* Edit Single Modal */}
      <Modal
        opened={editModalOpened}
        onClose={closeEditModal}
        title={
          <Group gap="xs">
            <ThemeIcon size={28} radius="md" color="primary" variant="light">
              <IconEdit size={16} />
            </ThemeIcon>
            <Text fw={700} c="dark.8">
              Ubah Pemetaan Akun
            </Text>
          </Group>
        }
        radius="md"
      >
        {editingItem && (
          <Stack gap="md">
            <Paper withBorder p="sm" radius="md" bg="gray.0">
              <Text size="xs" c="dimmed">
                Parameter:
              </Text>
              <Text size="sm" fw={700} c="dark.8">
                {editingItem.label} ({editingItem.key})
              </Text>
            </Paper>

            <Select
              label="Pilih Akun Chart of Accounts"
              description="Transaksi terkait akan otomatis dijurnalkan ke akun ini"
              placeholder="Pilih rekening atau akun COA..."
              data={accounts}
              value={selectedAccountId}
              onChange={setSelectedAccountId}
              searchable
              required
            />

            <Divider />

            <Group justify="flex-end" gap="xs">
              <Button variant="default" onClick={closeEditModal}>
                Batal
              </Button>
              <Button
                color="primary"
                onClick={handleSaveSingleEdit}
                loading={updateSingleMutation.isPending}
                disabled={!selectedAccountId}
              >
                Simpan Pemetaan
              </Button>
            </Group>
          </Stack>
        )}
      </Modal>
    </SettingsLayout>
  );
}
