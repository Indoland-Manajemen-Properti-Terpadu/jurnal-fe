import { List, Text } from '@mantine/core';
import { useTranslation } from '@/i18n';
import type { VarianceNotice } from '@/module/purchases/domain/billForm';
import { StatusNote } from '@/module/purchases/presentation/components/shared/StatusNote';
import { formatAmount } from '@/module/purchases/presentation/components/shared/format';

/** Heads-up before saving: the match against the order and the vendor's invoice will flag these. */
export const BillVarianceNotice = ({ notices }: Readonly<{ notices: VarianceNotice[] }>) => {
  const { t } = useTranslation('purchases');
  if (notices.length === 0) return null;
  return (
    <StatusNote tone="warning" title={t('bills.form.varianceTitle')}>
      <List size="sm" spacing={4}>
        {notices.map((notice) => (
          <List.Item key={`${notice.type}-${notice.itemName ?? 'total'}`}>
            {notice.type === 'PRICE'
              ? t('bills.form.variancePrice', {
                  item: notice.itemName ?? '-',
                  expected: formatAmount(notice.expected),
                  actual: formatAmount(notice.actual),
                })
              : t('bills.form.varianceTotal', {
                  expected: formatAmount(notice.expected),
                  actual: formatAmount(notice.actual),
                })}
          </List.Item>
        ))}
      </List>
      <Text size="xs" c="dimmed" mt={6}>
        {t('bills.form.varianceNote')}
      </Text>
    </StatusNote>
  );
};
