import {
  ActionIcon,
  Anchor,
  Box,
  Button,
  Grid,
  Group,
  Loader,
  Menu,
  Stack,
  Text,
} from '@mantine/core';
import {
  IconArrowBackUp,
  IconArrowLeft,
  IconBan,
  IconCheck,
  IconClipboardList,
  IconClipboardPlus,
  IconCopy,
  IconDotsVertical,
  IconDownload,
  IconFileText,
  IconMailForward,
  IconPencil,
  IconSend,
  IconThumbDown,
  IconTrash,
} from '@tabler/icons-react';
import { useNavigate, useParams } from 'react-router-dom';
import { AppShellLayout } from '@/components/AppShellLayout';
import { EmptyState } from '@/components/EmptyState';
import { ModuleHeader } from '@/components/ModuleHeader/ModuleHeader';
import { useTranslation } from '@/i18n';
import { routes } from '@/router/routes';
import { formatDate, formatDateTime } from '../../domain/saleFormat';
import { allowedQuoteActions, quoteActions, type SaleQuote } from '../../domain/saleQuote';
import { QuoteStatusBadge } from '../components/quotes/QuoteStatusBadge';
import type { NoteTone } from '../components/docs/DocNoteBanner';
import { DocLinesCard } from '../components/docs/DocLinesCard';
import { DocOverviewCard } from '../components/docs/DocOverviewCard';
import { DocSideCards } from '../components/docs/DocSideCards';
import { useQuoteActions } from '../hooks/useQuoteActions';
import { useQuote } from '../hooks/useQuoteQueries';
import { useQuoteRights } from '../hooks/useQuoteRights';

const noteTone = (quote: SaleQuote): NoteTone => {
  if (quote.displayStatus === 'ACCEPTED') return 'green';
  if (quote.displayStatus === 'SENT') return 'blue';
  return 'gray';
};

const noteKey = (quote: SaleQuote): string => {
  switch (quote.displayStatus) {
    case 'DRAFT':
      return 'detail.draftNote';
    case 'SENT':
      return 'detail.sentNote';
    case 'EXPIRED':
      return 'detail.expiredNote';
    case 'ACCEPTED':
      return quote.order ? 'detail.acceptedWithOrderNote' : 'detail.acceptedNote';
    case 'REJECTED':
      return 'detail.rejectedNote';
    default:
      return 'detail.voidNote';
  }
};

export function QuoteDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation('salesQuotes');
  const rights = useQuoteRights();
  const { data: quote, isLoading, isError, refetch } = useQuote(id);
  const { handlers, dialogs } = useQuoteActions({
    onDeleted: () => navigate(routes.sales.quotations, { replace: true }),
  });
  const back = () => navigate(routes.sales.quotations);

  if (isLoading) {
    return (
      <AppShellLayout>
        <Stack align="center" gap="xs" py={80}>
          <Loader size="sm" />
          <Text size="sm" c="dimmed">
            {t('detail.loading')}
          </Text>
        </Stack>
      </AppShellLayout>
    );
  }
  if (isError || !quote) {
    return (
      <AppShellLayout>
        <Box p={{ base: 'md', sm: 'xl' }}>
          <EmptyState
            title={t('detail.errorTitle')}
            description={t('detail.errorDescription')}
            actionLabel={t('detail.retry')}
            onAction={() => refetch()}
          />
          <Group justify="center" mt="md">
            <Button variant="default" leftSection={<IconArrowLeft size={16} />} onClick={back}>
              {t('detail.back')}
            </Button>
          </Group>
        </Box>
      </AppShellLayout>
    );
  }

  const actions = allowedQuoteActions(quoteActions(quote), rights);
  const note = t(noteKey(quote), { date: formatDate(quote.validUntil) });

  // One filled button: what normally happens next to this quote.
  const primary = actions.createOrder
    ? {
        label: t('actions.createOrder'),
        icon: <IconClipboardPlus size={16} />,
        run: () => handlers.onCreateOrder(quote),
      }
    : actions.viewOrder
      ? {
          label: t('actions.viewOrder'),
          icon: <IconClipboardList size={16} />,
          run: () => handlers.onViewOrder(quote),
        }
      : actions.send
        ? {
            label: t('actions.send'),
            icon: <IconSend size={16} />,
            run: () => handlers.onSend(quote),
          }
        : actions.accept
          ? {
              label: t('actions.accept'),
              icon: <IconCheck size={16} />,
              run: () => handlers.onAccept(quote),
            }
          : null;
  const more = [
    actions.revise && {
      key: 'revise',
      icon: <IconArrowBackUp size={16} />,
      run: handlers.onRevise,
    },
    actions.resend && {
      key: 'resend',
      icon: <IconMailForward size={16} />,
      run: handlers.onResend,
    },
    actions.duplicate && {
      key: 'duplicate',
      icon: <IconCopy size={16} />,
      run: handlers.onDuplicate,
    },
  ].filter(Boolean) as { key: string; icon: JSX.Element; run: (quote: SaleQuote) => void }[];

  return (
    <AppShellLayout>
      <Box p={{ base: 'md', sm: 'xl' }}>
        <Stack gap="lg">
          <Anchor
            component="button"
            type="button"
            size="sm"
            c="dimmed"
            onClick={back}
            style={{ alignSelf: 'flex-start' }}
          >
            <Group gap={6} wrap="nowrap">
              <IconArrowLeft size={16} />
              {t('detail.backToList')}
            </Group>
          </Anchor>
          <ModuleHeader
            icon={IconFileText}
            title={t('detail.title')}
            description={t('detail.description')}
          />
          <DocOverviewCard
            ns="salesQuotes"
            number={quote.transactionNumber}
            badge={<QuoteStatusBadge status={quote.displayStatus} />}
            customerName={quote.customer?.displayName ?? ''}
            stats={[
              { label: t('detail.date'), value: formatDate(quote.transactionDate) },
              { label: t('detail.validUntil'), value: formatDate(quote.validUntil) },
              quote.acceptedAt
                ? { label: t('detail.acceptedAt'), value: formatDateTime(quote.acceptedAt) }
                : { label: t('detail.sentAt'), value: formatDateTime(quote.sentAt) },
            ]}
            valueAmount={quote.total}
            note={{ tone: noteTone(quote), text: note }}
            actions={
              <Group gap="xs">
                {actions.edit && (
                  <Button
                    variant="default"
                    leftSection={<IconPencil size={16} />}
                    onClick={() => handlers.onEdit(quote)}
                  >
                    {t('actions.edit')}
                  </Button>
                )}
                <Button
                  variant="default"
                  leftSection={<IconDownload size={16} />}
                  onClick={() => handlers.onPdf(quote)}
                >
                  {t('actions.pdf')}
                </Button>
                {actions.reject && (
                  <Button
                    variant="default"
                    leftSection={<IconThumbDown size={16} />}
                    onClick={() => handlers.onReject(quote)}
                  >
                    {t('actions.reject')}
                  </Button>
                )}
                {primary && (
                  <Button color="primary" leftSection={primary.icon} onClick={primary.run}>
                    {primary.label}
                  </Button>
                )}
                {(more.length > 0 || actions.cancel || actions.remove) && (
                  <Menu position="bottom-end" shadow="md" width={220}>
                    <Menu.Target>
                      <ActionIcon
                        variant="default"
                        size={36}
                        radius="md"
                        aria-label={t('actions.more')}
                      >
                        <IconDotsVertical size={18} />
                      </ActionIcon>
                    </Menu.Target>
                    <Menu.Dropdown>
                      {more.map((item) => (
                        <Menu.Item
                          key={item.key}
                          leftSection={item.icon}
                          onClick={() => item.run(quote)}
                        >
                          {t(`actions.${item.key}`)}
                        </Menu.Item>
                      ))}
                      {(actions.cancel || actions.remove) && more.length > 0 && <Menu.Divider />}
                      {actions.cancel && (
                        <Menu.Item
                          color="red"
                          leftSection={<IconBan size={16} />}
                          onClick={() => handlers.onCancel(quote)}
                        >
                          {t('actions.cancel')}
                        </Menu.Item>
                      )}
                      {actions.remove && (
                        <Menu.Item
                          color="red"
                          leftSection={<IconTrash size={16} />}
                          onClick={() => handlers.onDelete(quote)}
                        >
                          {t('actions.remove')}
                        </Menu.Item>
                      )}
                    </Menu.Dropdown>
                  </Menu>
                )}
              </Group>
            }
          />
          <Grid gutter="lg" align="flex-start">
            <Grid.Col span={{ base: 12, lg: 8 }}>
              <DocLinesCard ns="salesQuotes" doc={quote} />
            </Grid.Col>
            <Grid.Col span={{ base: 12, lg: 4 }}>
              <DocSideCards
                ns="salesQuotes"
                doc={quote}
                extra={[
                  { label: t('detail.reference'), value: quote.customerRefNumber },
                  { label: t('detail.unitTower'), value: quote.unitTower },
                ]}
              />
            </Grid.Col>
          </Grid>
        </Stack>
      </Box>
      {dialogs}
    </AppShellLayout>
  );
}

export default QuoteDetailPage;
