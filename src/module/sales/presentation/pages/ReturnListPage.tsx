import { useEffect, useState } from 'react';
import {
  ActionIcon,
  Box,
  Button,
  Group,
  Paper,
  Stack,
  Tabs,
  TextInput,
  Tooltip,
} from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import {
  IconArchive,
  IconCircleCheck,
  IconReceiptRefund,
  IconFilterOff,
  IconPencil,
  IconPlayerPlay,
  IconPlus,
  IconRefresh,
  IconSearch,
} from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { AppShellLayout } from '@/components/AppShellLayout';
import { ModuleHeader } from '@/components/ModuleHeader/ModuleHeader';
import { useTranslation } from '@/i18n';
import { routes } from '@/router/routes';
import { formatCount } from '../../domain/saleFormat';
import { RETURN_TABS, type ReturnTab } from '../../domain/saleReturn';
import { ReturnSummaryStrip } from '../components/returns/ReturnSummaryStrip';
import { ReturnTable } from '../components/returns/ReturnTable';
import { InvoicePickerDialog } from '../components/returns/InvoicePickerDialog';
import { TAB_DIVIDER } from '../components/shared/tabDivider';
import { useReturnActions } from '../hooks/useReturnActions';
import { useReturns } from '../hooks/useReturnQueries';
import { useReturnRights } from '../hooks/useReturnRights';

const TAB_ICONS = {
  draft: IconPencil,
  issued: IconPlayerPlay,
  completed: IconCircleCheck,
  cancelled: IconArchive,
};

export function ReturnListPage() {
  const navigate = useNavigate();
  const { t } = useTranslation('salesReturns');
  const rights = useReturnRights();
  const { handlers, dialogs } = useReturnActions();

  const [tab, setTab] = useState<ReturnTab>('draft');
  const [searchInput, setSearchInput] = useState('');
  const [search] = useDebouncedValue(searchInput, 400);
  const [picking, setPicking] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  useEffect(() => setPage(1), [search, tab, limit]);

  const query = useReturns({ tab, search: search.trim() || undefined, page, limit });
  const summary = query.data?.summary;
  const isFiltered = Boolean(search.trim());
  const goCreate = () => setPicking(true);
  const pickInvoice = (saleId: string) => {
    setPicking(false);
    navigate(`${routes.sales.returnAdd}?sale=${saleId}`);
  };
  const tabLabel = (key: ReturnTab) =>
    summary ? t(`tabs.${key}Count`, { count: formatCount(summary.counts[key]) }) : t(`tabs.${key}`);

  return (
    <AppShellLayout>
      <Box p={{ base: 'md', sm: 'xl' }}>
        <Stack gap="lg">
          <ModuleHeader
            icon={IconReceiptRefund}
            title={t('page.title')}
            description={t('page.description')}
            actions={
              <Group gap="xs">
                <Tooltip label={t('page.refreshTooltip')} withArrow>
                  <ActionIcon
                    variant="default"
                    size="lg"
                    radius="md"
                    onClick={() => query.refetch()}
                    loading={query.isFetching}
                    aria-label={t('page.refreshAria')}
                  >
                    <IconRefresh size={18} />
                  </ActionIcon>
                </Tooltip>
                {rights.create && (
                  <Button color="primary" leftSection={<IconPlus size={18} />} onClick={goCreate}>
                    {t('page.create')}
                  </Button>
                )}
              </Group>
            }
          />

          <ReturnSummaryStrip summary={summary} isLoading={query.isLoading} />

          <Paper withBorder radius="lg" p="md" bg="white">
            <Tabs
              value={tab}
              onChange={(value) => setTab((value as ReturnTab) || 'draft')}
              color="primary"
              variant="pills"
              radius="md"
            >
              <Tabs.List mb="md" style={TAB_DIVIDER}>
                {RETURN_TABS.map((key) => {
                  const TabIcon = TAB_ICONS[key];
                  return (
                    <Tabs.Tab key={key} value={key} leftSection={<TabIcon size={16} />}>
                      {tabLabel(key)}
                    </Tabs.Tab>
                  );
                })}
              </Tabs.List>

              <Stack gap="md">
                <Group gap="sm" wrap="wrap" align="flex-end">
                  <TextInput
                    placeholder={t('filters.search')}
                    aria-label={t('filters.searchAria')}
                    leftSection={<IconSearch size={16} />}
                    value={searchInput}
                    onChange={(event) => setSearchInput(event.currentTarget.value)}
                    style={{ flex: '1 1 260px', maxWidth: 360 }}
                  />
                  {isFiltered && (
                    <Button
                      variant="subtle"
                      color="gray"
                      leftSection={<IconFilterOff size={16} />}
                      onClick={() => setSearchInput('')}
                    >
                      {t('filters.reset')}
                    </Button>
                  )}
                </Group>
                <ReturnTable
                  returns={query.data?.items ?? []}
                  tab={tab}
                  isLoading={query.isLoading}
                  isError={query.isError}
                  isFiltered={isFiltered}
                  page={page}
                  totalPages={query.data?.pagination.totalPages || 1}
                  total={query.data?.pagination.total || 0}
                  limit={limit}
                  handlers={handlers}
                  rights={rights}
                  onPageChange={setPage}
                  onLimitChange={setLimit}
                  onRetry={() => query.refetch()}
                  onCreateNew={goCreate}
                />
              </Stack>
            </Tabs>
          </Paper>
        </Stack>
      </Box>
      <InvoicePickerDialog
        opened={picking}
        onClose={() => setPicking(false)}
        onPick={pickInvoice}
      />
      {dialogs}
    </AppShellLayout>
  );
}

export default ReturnListPage;
