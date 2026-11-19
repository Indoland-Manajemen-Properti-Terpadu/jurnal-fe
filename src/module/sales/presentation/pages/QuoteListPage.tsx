import { useEffect, useState } from 'react';
import {
  ActionIcon,
  Box,
  Button,
  Group,
  Paper,
  Select,
  Stack,
  Tabs,
  TextInput,
  Tooltip,
} from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import {
  IconCircleCheck,
  IconFileText,
  IconFilterOff,
  IconPlayerPlay,
  IconPlus,
  IconRefresh,
  IconSearch,
  IconArchive,
} from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { AppShellLayout } from '@/components/AppShellLayout';
import { ModuleHeader } from '@/components/ModuleHeader/ModuleHeader';
import { useTranslation } from '@/i18n';
import { routes } from '@/router/routes';
import { formatCount } from '../../domain/saleFormat';
import {
  QUOTE_STATUS_FILTERS,
  QUOTE_TABS,
  type QuoteDisplayStatus,
  type QuoteTab,
} from '../../domain/saleQuote';
import { QuoteSummaryStrip } from '../components/quotes/QuoteSummaryStrip';
import { QuoteTable } from '../components/quotes/QuoteTable';
import { TAB_DIVIDER } from '../components/shared/tabDivider';
import { useQuoteActions } from '../hooks/useQuoteActions';
import { useQuotes } from '../hooks/useQuoteQueries';
import { useQuoteRights } from '../hooks/useQuoteRights';

const TAB_ICONS = { running: IconPlayerPlay, accepted: IconCircleCheck, finished: IconArchive };

export function QuoteListPage() {
  const navigate = useNavigate();
  const { t } = useTranslation('salesQuotes');
  const rights = useQuoteRights();
  const { handlers, dialogs } = useQuoteActions();

  const [tab, setTab] = useState<QuoteTab>('running');
  const [status, setStatus] = useState<QuoteDisplayStatus | 'all'>('all');
  const [searchInput, setSearchInput] = useState('');
  const [search] = useDebouncedValue(searchInput, 400);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  useEffect(() => setPage(1), [search, tab, status, limit]);

  const query = useQuotes({
    tab,
    status,
    search: search.trim() || undefined,
    page,
    limit,
  });
  const quotes = query.data?.items ?? [];
  const summary = query.data?.summary;
  const statusOptions = QUOTE_STATUS_FILTERS[tab];
  const isFiltered = Boolean(search.trim()) || status !== 'all';

  const changeTab = (value: string | null) => {
    setTab((value as QuoteTab) || 'running');
    setStatus('all');
  };
  const reset = () => {
    setSearchInput('');
    setStatus('all');
  };
  const goCreate = () => navigate(routes.sales.quotationAdd);
  const tabLabel = (key: QuoteTab) =>
    summary ? t(`tabs.${key}Count`, { count: formatCount(summary.counts[key]) }) : t(`tabs.${key}`);

  return (
    <AppShellLayout>
      <Box p={{ base: 'md', sm: 'xl' }}>
        <Stack gap="lg">
          <ModuleHeader
            icon={IconFileText}
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

          <QuoteSummaryStrip summary={summary} isLoading={query.isLoading} />

          <Paper withBorder radius="lg" p="md" bg="white">
            <Tabs value={tab} onChange={changeTab} color="primary" variant="pills" radius="md">
              <Tabs.List mb="md" style={TAB_DIVIDER}>
                {QUOTE_TABS.map((key) => {
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
                  {statusOptions.length > 0 && (
                    <Select
                      aria-label={t('filters.status')}
                      data={[
                        { value: 'all', label: t('filters.statusAll') },
                        ...statusOptions.map((value) => ({
                          value,
                          label: t(`status.${value.toLowerCase()}`),
                        })),
                      ]}
                      value={status}
                      onChange={(value) =>
                        setStatus((value as QuoteDisplayStatus | 'all') || 'all')
                      }
                      allowDeselect={false}
                      w={200}
                    />
                  )}
                  {isFiltered && (
                    <Button
                      variant="subtle"
                      color="gray"
                      leftSection={<IconFilterOff size={16} />}
                      onClick={reset}
                    >
                      {t('filters.reset')}
                    </Button>
                  )}
                </Group>
                <QuoteTable
                  quotes={quotes}
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
      {dialogs}
    </AppShellLayout>
  );
}

export default QuoteListPage;
