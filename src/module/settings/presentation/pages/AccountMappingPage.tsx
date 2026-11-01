import { useState } from 'react';
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
  IconDeviceFloppy,
  IconEdit,
  IconRefresh,
  IconSearch,
  IconSitemap,
  IconSparkles,
} from '@tabler/icons-react';
import SettingsLayout from '@/module/settings/presentation/components/SettingsLayout';
import {
  useAccountMappings,
  useSeedAccountMappings,
  useUpdateAccountMapping,
  useUpdateAccountMappingBatch,
} from '@/module/settings/presentation/hooks/useAccountMappings';
import type { AccountMappingItem } from '@/module/settings/domain/settingTypes';

import { useTranslation } from '@/i18n';

import { useAccountOptions } from '@/module/settings/presentation/hooks/useAccountOptions';

const GROUP_LABELS: Record<string, { labelKey: string; color: string }> = {
  ar_ap: { labelKey: 'mapping.groupArAp', color: 'blue' },
  sales: { labelKey: 'mapping.groupSales', color: 'teal' },
  purchase: { labelKey: 'mapping.groupPurchase', color: 'orange' },
  inventory: { labelKey: 'mapping.groupInventory', color: 'grape' },
  other: { labelKey: 'mapping.groupOther', color: 'gray' },
};

export default function AccountMappingPage() {
  const { t: st } = useTranslation('settings');
  const { data: mappingsData, isLoading, refetch } = useAccountMappings();
  const seedMutation = useSeedAccountMappings();
  const updateBatchMutation = useUpdateAccountMappingBatch();
  const updateSingleMutation = useUpdateAccountMapping();

  const [activeTab, setActiveTab] = useState<string>('all');
  const [search, setSearch] = useState<string>('');

  // Draft state for batch edits: mappingId -> accountId
  const [draftChanges, setDraftChanges] = useState<Record<string, string>>({});

  // Single Edit Modal State
  const [editModalOpened, { open: openEditModal, close: closeEditModal }] = useDisclosure(false);
  const [editingItem, setEditingItem] = useState<AccountMappingItem | null>(null);
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);

  const { accounts, isAccountsLoading } = useAccountOptions(
    (account) => ` (${account.type || account.category?.name || st('mapping.account')})`
  );

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
      title={st('mapping.title')}
      description={st('mapping.description')}
      action={
        <Group gap="xs">
          <Button
            variant="default"
            leftSection={<IconRefresh size={16} />}
            onClick={() => refetch()}
            loading={isLoading}
          >
            {st('common.refresh')}
          </Button>
          {allItems.length === 0 && (
            <Button
              color="indigo"
              leftSection={<IconSparkles size={16} />}
              onClick={handleSeedDefaults}
              loading={seedMutation.isPending}
            >
              {st('mapping.generate')}
            </Button>
          )}
          {hasDraftChanges && (
            <Button
              color="primary"
              leftSection={<IconDeviceFloppy size={16} />}
              onClick={handleSaveBatch}
              loading={updateBatchMutation.isPending}
            >
              {st('mapping.savePrefix')} {Object.keys(draftChanges).length}{' '}
              {st('mapping.saveSuffix')}
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
                {st('mapping.pendingPrefix')} <strong>{Object.keys(draftChanges).length}</strong>{' '}
                {st('mapping.pendingSuffix')}
              </Text>
              <Group gap="xs">
                <Button size="xs" variant="default" onClick={() => setDraftChanges({})}>
                  {st('mapping.discard')}
                </Button>
                <Button
                  size="xs"
                  color="primary"
                  onClick={handleSaveBatch}
                  loading={updateBatchMutation.isPending}
                >
                  {st('mapping.saveNow')}
                </Button>
              </Group>
            </Group>
          </Alert>
        )}

        <Paper withBorder p="md" radius="md" bg="white">
          <Group justify="space-between" wrap="wrap" gap="md">
            <Tabs
              value={activeTab}
              onChange={(val) => setActiveTab(val || 'all')}
              variant="pills"
              radius="md"
            >
              <Tabs.List>
                <Tabs.Tab value="all">
                  {st('mapping.tabAll')}
                  {allItems.length})
                </Tabs.Tab>
                <Tabs.Tab value="ar_ap">{st('mapping.tabArAp')}</Tabs.Tab>
                <Tabs.Tab value="sales">{st('mapping.tabSales')}</Tabs.Tab>
                <Tabs.Tab value="purchase">{st('mapping.tabPurchase')}</Tabs.Tab>
                <Tabs.Tab value="inventory">{st('mapping.tabInventory')}</Tabs.Tab>
                <Tabs.Tab value="other">{st('mapping.tabOther')}</Tabs.Tab>
              </Tabs.List>
            </Tabs>

            <TextInput
              placeholder={st('mapping.search')}
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
              {st('mapping.emptyTitle')}
            </Title>
            <Text size="sm" c="dimmed" mt={4} maw={450} mx="auto">
              {st('mapping.emptyDescription')}
            </Text>
            <Button
              mt="md"
              color="indigo"
              leftSection={<IconSparkles size={16} />}
              onClick={handleSeedDefaults}
              loading={seedMutation.isPending}
            >
              {st('mapping.generateBuiltIn')}
            </Button>
          </Paper>
        ) : (
          <Paper withBorder radius="md" bg="white" style={{ overflow: 'hidden' }}>
            <Table highlightOnHover verticalSpacing="sm" horizontalSpacing="md">
              <Table.Thead bg="gray.0">
                <Table.Tr>
                  <Table.Th style={{ width: '22%' }}>{st('mapping.colGroup')}</Table.Th>
                  <Table.Th style={{ width: '28%' }}>{st('mapping.colParameter')}</Table.Th>
                  <Table.Th style={{ width: '40%' }}>{st('mapping.colAccount')}</Table.Th>
                  <Table.Th style={{ width: '10%', textAlign: 'center' }}>
                    {st('common.actions')}
                  </Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {filteredItems.map((item) => {
                  const known = GROUP_LABELS[item.group];
                  const grp = {
                    label: known ? st(known.labelKey) : item.group,
                    color: known?.color ?? 'gray',
                  };
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
                          placeholder={st('mapping.selectAccount')}
                          size="xs"
                          radius="md"
                        />
                      </Table.Td>
                      <Table.Td style={{ textAlign: 'center' }}>
                        <Tooltip label={st('mapping.changeAccount')}>
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
              {st('mapping.modalTitle')}
            </Text>
          </Group>
        }
        radius="md"
      >
        {editingItem && (
          <Stack gap="md">
            <Paper withBorder p="sm" radius="md" bg="gray.0">
              <Text size="xs" c="dimmed">
                {st('mapping.parameter')}
              </Text>
              <Text size="sm" fw={700} c="dark.8">
                {editingItem.label} ({editingItem.key})
              </Text>
            </Paper>

            <Select
              label={st('mapping.pickAccount')}
              description={st('mapping.pickAccountHint')}
              placeholder={st('mapping.pickAccountPlaceholder')}
              data={accounts}
              value={selectedAccountId}
              onChange={setSelectedAccountId}
              searchable
              required
            />

            <Divider />

            <Group justify="flex-end" gap="xs">
              <Button variant="default" onClick={closeEditModal}>
                {st('common.cancel')}
              </Button>
              <Button
                color="primary"
                onClick={handleSaveSingleEdit}
                loading={updateSingleMutation.isPending}
                disabled={!selectedAccountId}
              >
                {st('mapping.saveMapping')}
              </Button>
            </Group>
          </Stack>
        )}
      </Modal>
    </SettingsLayout>
  );
}
