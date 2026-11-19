import { Badge } from '@mantine/core';
import { useTranslation } from '@/i18n';
import type { QuoteDisplayStatus } from '@/module/sales/domain/saleQuote';

const TONES: Record<QuoteDisplayStatus, { color: string; variant: 'light' | 'outline' }> = {
  DRAFT: { color: 'gray', variant: 'light' },
  SENT: { color: 'primary', variant: 'light' },
  ACCEPTED: { color: 'green', variant: 'light' },
  REJECTED: { color: 'gray', variant: 'outline' },
  VOID: { color: 'gray', variant: 'outline' },
  // Red only for real lateness: a quote past its day without an answer.
  EXPIRED: { color: 'red', variant: 'light' },
};

/** The state of a quote as the server reports it, worded in the active language. */
export const QuoteStatusBadge = ({ status }: Readonly<{ status: QuoteDisplayStatus }>) => {
  const { t } = useTranslation('salesQuotes');
  const tone = TONES[status];
  return (
    <Badge
      color={tone.color}
      variant={tone.variant}
      radius="sm"
      size="md"
      style={{ width: 'max-content', maxWidth: 'none' }}
    >
      {t(`status.${status.toLowerCase()}`)}
    </Badge>
  );
};
