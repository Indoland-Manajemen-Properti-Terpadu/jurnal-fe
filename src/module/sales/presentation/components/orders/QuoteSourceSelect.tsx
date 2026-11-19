import { useMemo } from 'react';
import { Select } from '@mantine/core';
import { IconFileText } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import { formatCompactIDR } from '@/module/sales/domain/saleFormat';
import { useQuoteActions } from '../../hooks/useQuoteActions';
import { useQuotes } from '../../hooks/useQuoteQueries';

/**
 * "Ambil dari Penawaran": an accepted quote of the chosen customer that has no order yet. The API
 * links an order to its quote only through its own endpoint, so picking one opens the same
 * "create order" dialog the quote offers (target date, then the order is made from the quote and
 * opened) instead of filling this form.
 */
export function QuoteSourceSelect({ customerId }: Readonly<{ customerId: string }>) {
  const { t } = useTranslation('salesOrders');
  const { handlers, dialogs } = useQuoteActions();
  const query = useQuotes(
    { tab: 'accepted', customer: customerId || undefined, limit: 100 },
    { enabled: Boolean(customerId) }
  );
  const quotes = useMemo(
    () => (query.data?.items ?? []).filter((quote) => quote.status === 'ACCEPTED' && !quote.order),
    [query.data]
  );

  return (
    <>
      <Select
        label={t('form.general.quoteSource')}
        description={t('form.general.quoteSourceHint')}
        inputWrapperOrder={['label', 'input', 'description', 'error']}
        placeholder={
          customerId
            ? t('form.general.quoteSourcePlaceholder')
            : t('form.general.quoteSourceNeedsCustomer')
        }
        leftSection={<IconFileText size={16} />}
        disabled={!customerId}
        searchable
        nothingFoundMessage={t('form.general.quoteSourceEmpty')}
        data={quotes.map((quote) => ({
          value: quote.id,
          label: `${quote.transactionNumber} · ${formatCompactIDR(quote.total)}`,
        }))}
        value={null}
        onChange={(id) => {
          const quote = quotes.find((item) => item.id === id);
          if (quote) handlers.onCreateOrder(quote);
        }}
      />
      {dialogs}
    </>
  );
}
