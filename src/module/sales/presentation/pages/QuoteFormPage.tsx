import { useMemo } from 'react';
import { Box, Button, Loader, Stack, Text } from '@mantine/core';
import { IconArrowLeft, IconFileText } from '@tabler/icons-react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { AppShellLayout } from '@/components/AppShellLayout';
import { ModuleHeader } from '@/components/ModuleHeader/ModuleHeader';
import { useTranslation } from '@/i18n';
import { routes } from '@/router/routes';
import { quoteActions } from '../../domain/saleQuote';
import { quoteToFormValues } from '../../domain/saleQuoteForm';
import { QuoteFormBody } from '../components/quotes/QuoteFormBody';
import { useQuote } from '../hooks/useQuoteQueries';

const detailPath = (id: string) => routes.sales.quotationDetail.replace(':id', id);

/** Create a quote, or edit a draft when the route carries an id. */
export function QuoteFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation('salesQuotes');
  const { data: quote, isLoading, isError } = useQuote(id);
  const initial = useMemo(() => (quote ? quoteToFormValues(quote) : undefined), [quote]);
  const isEdit = Boolean(id);
  const back = () => navigate(id ? detailPath(id) : routes.sales.quotations);

  // Only a draft can be changed; any other quote opens on its detail instead.
  if (isEdit && quote && !quoteActions(quote).edit) {
    return <Navigate to={detailPath(quote.id)} replace />;
  }
  if (isEdit && isError) return <Navigate to={routes.sales.quotations} replace />;

  return (
    <AppShellLayout>
      <Box p={{ base: 'md', sm: 'xl' }}>
        <Stack gap="lg">
          <ModuleHeader
            icon={IconFileText}
            title={isEdit ? t('form.titleEdit') : t('form.titleNew')}
            description={isEdit ? t('form.descriptionEdit') : t('form.descriptionNew')}
            actions={
              <Button variant="default" leftSection={<IconArrowLeft size={16} />} onClick={back}>
                {t('detail.back')}
              </Button>
            }
          />
          {isEdit && isLoading && (
            <Stack align="center" gap="xs" py="xl">
              <Loader size="sm" />
              <Text size="sm" c="dimmed">
                {t('form.loading')}
              </Text>
            </Stack>
          )}
          {(!isEdit || initial) && (
            <QuoteFormBody key={id ?? 'new'} quoteId={id} initial={initial} />
          )}
        </Stack>
      </Box>
    </AppShellLayout>
  );
}

export default QuoteFormPage;
