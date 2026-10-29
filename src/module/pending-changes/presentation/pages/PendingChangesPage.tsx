import { useState } from 'react';
import {
  ActionIcon,
  Alert,
  Box,
  Button,
  Group,
  Paper,
  Skeleton,
  Stack,
  Tabs,
  Text,
  Tooltip,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconCheck, IconInfoCircle, IconRefresh, IconShieldCheck } from '@tabler/icons-react';
import AppShellLayout from '@/components/AppShellLayout';
import ModuleHeader from '@/components/ModuleHeader/ModuleHeader';
import EmptyState from '@/components/EmptyState/EmptyState';
import { useTranslation } from '@/i18n';
import type { PendingChangeItem } from '../../domain/pendingChange';
import { countByType } from '../../domain/pendingChangeRules';
import {
  useApproveAllPendingChanges,
  useApprovePendingChange,
  usePendingChanges,
  usePendingChangesCount,
} from '../hooks/usePendingChangesQueries';
import ApproveAllModal from '../components/ApproveAllModal';
import ApproveChangeModal from '../components/ApproveChangeModal';
import PendingChangeFilters from '../components/PendingChangeFilters';
import PendingChangePagination from '../components/PendingChangePagination';
import PendingChangeStats from '../components/PendingChangeStats';
import PendingChangeTabList from '../components/PendingChangeTabList';
import PendingChangeTable from '../components/PendingChangeTable';

export default function PendingChangesPage() {
  const { t } = useTranslation('pendingChanges');

  const [activeTab, setActiveTab] = useState<string>('all');
  const [search, setSearch] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<string>('10');

  const { data: totalPending = 0, refetch: refetchCount } = usePendingChangesCount();

  const {
    data: changesData,
    isLoading,
    refetch: refetchList,
  } = usePendingChanges({
    page,
    limit: Number(pageSize),
    type: activeTab === 'all' ? undefined : activeTab,
    search: search.trim() || undefined,
  });

  const approveMutation = useApprovePendingChange();
  const approveAllMutation = useApproveAllPendingChanges();

  const [singleModalOpened, { open: openSingleModal, close: closeSingleModal }] =
    useDisclosure(false);
  const [selectedChange, setSelectedChange] = useState<PendingChangeItem | null>(null);

  const [allModalOpened, { open: openAllModal, close: closeAllModal }] = useDisclosure(false);
  const [targetTypeForApproveAll, setTargetTypeForApproveAll] = useState<string | undefined>(
    undefined
  );

  const handleRefresh = () => {
    refetchCount();
    refetchList();
  };

  const handleSelectApprove = (change: PendingChangeItem) => {
    setSelectedChange(change);
    openSingleModal();
  };

  const handleConfirmApproveSingle = async () => {
    if (!selectedChange) return;
    await approveMutation.mutateAsync(selectedChange.id);
    closeSingleModal();
    setSelectedChange(null);
  };

  const handleConfirmApproveAll = async () => {
    await approveAllMutation.mutateAsync(targetTypeForApproveAll);
    closeAllModal();
  };

  const items = changesData?.data || [];
  const pagination = changesData?.pagination || { total: 0, page: 1, limit: 10, totalPages: 1 };

  // Counts come from the items of the current page only.
  const { fine: fineCount, payment: paymentCount } = countByType(items);

  return (
    <AppShellLayout>
      <Box p={{ base: 'md', sm: 'xl' }}>
        <Stack gap="lg">
          <ModuleHeader
            icon={IconShieldCheck}
            title={t('title')}
            description={t('subtitle')}
            actions={
              <Group gap="xs" wrap="wrap">
                <Tooltip label={t('refreshTooltip')} withArrow position="top">
                  <ActionIcon
                    variant="default"
                    size="lg"
                    radius="md"
                    onClick={handleRefresh}
                    loading={isLoading}
                    aria-label={t('refreshTooltip')}
                  >
                    <IconRefresh size={18} />
                  </ActionIcon>
                </Tooltip>

                {items.length > 0 && (
                  <Button
                    color="primary"
                    leftSection={<IconCheck size={18} />}
                    onClick={() => {
                      setTargetTypeForApproveAll(activeTab === 'all' ? undefined : activeTab);
                      openAllModal();
                    }}
                    loading={approveAllMutation.isPending}
                  >
                    {activeTab === 'all'
                      ? t('approveAll')
                      : t('approveAllWithType', { type: activeTab })}
                  </Button>
                )}
              </Group>
            }
          />

          <PendingChangeStats
            totalPending={totalPending}
            fineCount={fineCount}
            paymentCount={paymentCount}
          />

          <Paper withBorder radius="lg" p="md" bg="white">
            <Tabs
              value={activeTab}
              onChange={(val) => {
                setActiveTab(val || 'all');
                setPage(1);
              }}
              color="primary"
              variant="pills"
              radius="md"
            >
              <PendingChangeTabList
                total={pagination.total}
                fineCount={fineCount}
                paymentCount={paymentCount}
              />

              <Stack gap="md">
                <PendingChangeFilters
                  search={search}
                  pageSize={pageSize}
                  onSearchChange={(value) => {
                    setSearch(value);
                    setPage(1);
                  }}
                  onPageSizeChange={(value) => {
                    setPageSize(value);
                    setPage(1);
                  }}
                />

                <Alert icon={<IconInfoCircle size={18} />} color="blue" radius="md" variant="light">
                  <Text size="xs" lh={1.5}>
                    <strong>{t('whyNoRejectTitle')}</strong> {t('whyNoRejectDesc')}
                  </Text>
                </Alert>

                {isLoading ? (
                  <Stack gap="md" py="xl">
                    <Skeleton height={44} radius="md" />
                    <Skeleton height={44} radius="md" />
                    <Skeleton height={44} radius="md" />
                  </Stack>
                ) : items.length === 0 ? (
                  <EmptyState
                    icon={<IconShieldCheck size={32} stroke={1.6} />}
                    title={t('emptyTitle')}
                    description={t('emptyDesc')}
                    color="teal"
                    py={48}
                  />
                ) : (
                  <PendingChangeTable
                    items={items}
                    approvingId={approveMutation.isPending ? (selectedChange?.id ?? null) : null}
                    onApprove={handleSelectApprove}
                  />
                )}

                {pagination.totalPages > 1 && (
                  <PendingChangePagination
                    pagination={pagination}
                    page={page}
                    pageSize={Number(pageSize)}
                    onChange={setPage}
                  />
                )}
              </Stack>
            </Tabs>
          </Paper>
        </Stack>
      </Box>

      <ApproveChangeModal
        opened={singleModalOpened}
        change={selectedChange}
        loading={approveMutation.isPending}
        onClose={closeSingleModal}
        onConfirm={handleConfirmApproveSingle}
      />

      <ApproveAllModal
        opened={allModalOpened}
        type={targetTypeForApproveAll}
        loading={approveAllMutation.isPending}
        onClose={closeAllModal}
        onConfirm={handleConfirmApproveAll}
      />
    </AppShellLayout>
  );
}
