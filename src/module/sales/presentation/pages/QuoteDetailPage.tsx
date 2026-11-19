import { Alert, Box, Button, Group, Loader, Menu, Stack, Text } from '@mantine/core';
import {
  IconArrowBackUp,
  IconArrowLeft,
  IconBan,
  IconCheck,
  IconCopy,
  IconDots,
  IconDownload,
  IconFileText,
  IconInfoCircle,
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
import { formatDate } from '../../domain/saleFormat';
import { allowedQuoteActions, quoteActions, type SaleQuote } from '../../domain/saleQuote';
import { QuoteOverviewCard } from '../components/quotes/QuoteOverviewCard';
import { QuoteLinesCard } from '../components/quotes/QuoteLinesCard';
import { useQuoteActions } from '../hooks/useQuoteActions';
import { useQuote } from '../hooks/useQuoteQueries';
import { useQuoteRights } from '../hooks/useQuoteRights';

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
  const primary = actions.send
    ? { label: t('actions.send'), icon: <IconSend size={16} />, run: () => handlers.onSend(quote) }
    : actions.accept
      ? {
          label: t('actions.accept'),
          icon: <IconCheck size={16} />,
          run: () => handlers.onAccept(quote),
        }
      : null;
  const more = [
    actions.reject && { key: 'reject', icon: <IconThumbDown size={16} />, run: handlers.onReject },
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
          <ModuleHeader
            icon={IconFileText}
            title={t('detail.title')}
            description={t('detail.description')}
            actions={
              <Button variant="default" leftSection={<IconArrowLeft size={16} />} onClick={back}>
                {t('detail.back')}
              </Button>
            }
          />
          <Alert color="gray" variant="light" radius="md" icon={<IconInfoCircle size={18} />}>
            {note}
          </Alert>
          <QuoteOverviewCard
            quote={quote}
            actions={
              <Group gap="xs">
                {primary && (
                  <Button color="primary" leftSection={primary.icon} onClick={primary.run}>
                    {primary.label}
                  </Button>
                )}
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
                {(more.length > 0 || actions.cancel || actions.remove) && (
                  <Menu position="bottom-end" shadow="md" width={220}>
                    <Menu.Target>
                      <Button variant="default" leftSection={<IconDots size={16} />}>
                        {t('actions.more')}
                      </Button>
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
          <QuoteLinesCard quote={quote} />
        </Stack>
      </Box>
      {dialogs}
    </AppShellLayout>
  );
}

export default QuoteDetailPage;
