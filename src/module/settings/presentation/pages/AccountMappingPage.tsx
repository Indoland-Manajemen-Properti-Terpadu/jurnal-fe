import { Fragment, useMemo, useState } from 'react';
import {
  Alert,
  Button,
  Group,
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
} from '@mantine/core';
import {
  IconAlertCircle,
  IconDeviceFloppy,
  IconRefresh,
  IconSearch,
  IconSitemap,
  IconSparkles,
} from '@tabler/icons-react';
import SettingsLayout from '@/module/settings/presentation/components/SettingsLayout';
import {
  useAccountMappings,
  useSeedAccountMappings,
  useUpdateAccountMappingBatch,
} from '@/module/settings/presentation/hooks/useAccountMappings';
import type { AccountMappingItem } from '@/module/settings/domain/settingTypes';
import { useTranslation } from '@/i18n';
import { useAccountOptions } from '@/module/settings/presentation/hooks/useAccountOptions';

const PRIMARY_GROUPS = new Set(['ar_ap', 'sales', 'purchase', 'inventory']);

const GROUP_LABELS: Record<string, string> = {
  ar_ap: 'mapping.groupArAp',
  sales: 'mapping.groupSales',
  purchase: 'mapping.groupPurchase',
  inventory: 'mapping.groupInventory',
  other: 'mapping.groupOther',
};

const COLUMNS = 2;

export default function AccountMappingPage() {
  const { t: st } = useTranslation('settings');
  const { data: mappingsData, isLoading, refetch } = useAccountMappings();
  const seedMutation = useSeedAccountMappings();
  const updateBatchMutation = useUpdateAccountMappingBatch();

  const [activeTab, setActiveTab] = useState<string>('all');
  const [search, setSearch] = useState<string>('');
  const [draftChanges, setDraftChanges] = useState<Record<string, string>>({});

  const { accounts, isAccountsLoading } = useAccountOptions(
    (account) => ` (${account.type || account.category?.name || st('mapping.account')})`
  );

  const allItems: AccountMappingItem[] = useMemo(
    () =>
      Object.entries(mappingsData || {}).flatMap(([group, items]) =>
        Array.isArray(items) ? items.map((it) => ({ ...it, group })) : []
      ),
    [mappingsData]
  );

  const accountOptions = useMemo(() => {
    const map = new Map(accounts.map((opt) => [opt.value, opt]));
    for (const item of allItems) {
      const acc = item.account;
      if (acc?.id && !map.has(acc.id)) {
        map.set(acc.id, {
          value: acc.id,
          label: `${acc.accountNumber ? `${acc.accountNumber} - ` : ''}${acc.name}`,
        });
      }
    }
    return Array.from(map.values());
  }, [accounts, allItems]);

  const groupedItems = useMemo(() => {
    const query = search.toLowerCase();
    const groups = new Map<string, AccountMappingItem[]>();
    for (const item of allItems) {
      const matchesTab =
        activeTab === 'all' ||
        item.group === activeTab ||
        (activeTab === 'other' && !PRIMARY_GROUPS.has(item.group));
      const matchesSearch =
        item.label.toLowerCase().includes(query) ||
        item.key.toLowerCase().includes(query) ||
        (item.account?.name || '').toLowerCase().includes(query) ||
        (item.account?.accountNumber || '').toLowerCase().includes(query);
      if (matchesTab && matchesSearch) {
        const existing = groups.get(item.group);
        if (existing) existing.push(item);
        else groups.set(item.group, [item]);
      }
    }
    return Array.from(groups.entries());
  }, [allItems, activeTab, search]);

  const draftCount = Object.keys(draftChanges).length;
  const hasDraftChanges = draftCount > 0;

  const handleAccountChange = (mappingId: string, newAccountId: string) => {
    setDraftChanges((prev) => ({ ...prev, [mappingId]: newAccountId }));
  };

  const handleSaveBatch = async () => {
    const payload = Object.entries(draftChanges).map(([id, account]) => ({ id, account }));
    if (payload.length === 0) return;
    await updateBatchMutation.mutateAsync(payload);
    setDraftChanges({});
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
              {st('mapping.savePrefix')} {draftCount} {st('mapping.saveSuffix')}
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
                {st('mapping.pendingPrefix')} <strong>{draftCount}</strong>{' '}
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

        <Paper withBorder p="md" radius="lg" bg="white">
          <Stack gap="md">
            <Group
              justify="space-between"
              wrap="wrap"
              gap="md"
              pb={12}
              style={{ borderBottom: '1px solid var(--mantine-color-gray-2)' }}
            >
              <Tabs
                value={activeTab}
                onChange={(val) => setActiveTab(val || 'all')}
                color="primary"
                variant="pills"
                radius="md"
              >
                <Tabs.List style={{ gap: 4 }}>
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

            {isLoading ? (
              <Stack gap="md" py="md">
                <Skeleton height={40} radius="md" />
                <Skeleton height={40} radius="md" />
                <Skeleton height={40} radius="md" />
              </Stack>
            ) : groupedItems.length === 0 ? (
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
              <Paper withBorder radius="md" bg="white" p={0} style={{ overflow: 'hidden' }}>
                <Table.ScrollContainer minWidth={600}>
                  <Table highlightOnHover verticalSpacing="sm" horizontalSpacing="md">
                    <Table.Thead bg="gray.0">
                      <Table.Tr>
                        <Table.Th style={{ width: '45%' }}>{st('mapping.colParameter')}</Table.Th>
                        <Table.Th style={{ width: '55%' }}>{st('mapping.colAccount')}</Table.Th>
                      </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                      {groupedItems.map(([groupKey, items]) => {
                        const labelKey = GROUP_LABELS[groupKey];
                        const groupTitle = labelKey
                          ? st(labelKey)
                          : groupKey.replace(/_/g, ' ');

                        return (
                          <Fragment key={groupKey}>
                            <Table.Tr bg="var(--mantine-color-gray-0)">
                              <Table.Td
                                colSpan={COLUMNS}
                                py="sm"
                                px="md"
                                style={{
                                  borderTop: '1px solid var(--mantine-color-gray-2)',
                                  borderBottom: '1px solid var(--mantine-color-gray-2)',
                                }}
                              >
                                <Text fz="md" fw={700} tt="uppercase" lts="0.03em" c="dark.8">
                                  {groupTitle} ({items.length})
                                </Text>
                              </Table.Td>
                            </Table.Tr>

                            {items.map((item) => {
                              const currentAccountId =
                                draftChanges[item.id] ?? item.account?.id ?? '';
                              const isModified = Boolean(draftChanges[item.id]);

                              return (
                                <Table.Tr key={item.id} bg={isModified ? 'orange.0' : undefined}>
                                  <Table.Td pl="xl">
                                    <Text fz="sm" fw={500} c="dark.7">
                                      {item.label}
                                    </Text>
                                    <Text fz="xs" c="dimmed" ff="monospace">
                                      {item.key}
                                    </Text>
                                  </Table.Td>
                                  <Table.Td>
                                    <Select
                                      data={accountOptions}
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
                                </Table.Tr>
                              );
                            })}
                          </Fragment>
                        );
                      })}
                    </Table.Tbody>
                  </Table>
                </Table.ScrollContainer>
              </Paper>
            )}
          </Stack>
        </Paper>
      </Stack>
    </SettingsLayout>
  );
}
