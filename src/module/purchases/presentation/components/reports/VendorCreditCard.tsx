import { Group, Skeleton, Stack, Text } from '@mantine/core';
import { IconTransferIn } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import { SectionCard } from '@/module/purchases/presentation/components/shared/SectionCard';
import { formatAmount, formatDay } from '@/module/purchases/presentation/components/shared/format';
import { useVendorCredits } from '@/module/purchases/presentation/hooks/usePurchaseQueries';

/** Advances and return value of the filtered vendor that are still waiting to be used. */
export const VendorCreditCard = ({ vendorId }: Readonly<{ vendorId: string }>) => {
  const { t, currentLanguage } = useTranslation('purchases');
  const credits = useVendorCredits(vendorId);
  const lines = (credits.data?.lines ?? []).filter((line) => line.available > 0);

  return (
    <SectionCard
      icon={IconTransferIn}
      title={t('reports.credit.title')}
      subtitle={t('reports.credit.subtitle')}
    >
      {credits.isLoading && <Skeleton height={16} radius="sm" />}
      {credits.isError && (
        <Text size="sm" c="dimmed">
          {t('list.errorDescription')}
        </Text>
      )}
      {credits.data && lines.length === 0 && (
        <Text size="sm" c="dimmed">
          {t('reports.credit.none')}
        </Text>
      )}
      {lines.length > 0 && (
        <Stack gap="xs">
          {lines.map((line) => (
            <Group key={`${line.source}:${line.id}`} justify="space-between" wrap="nowrap" gap="md">
              <div>
                <Text size="sm" fw={500}>
                  {line.source === 'RETURN'
                    ? t('reports.credit.return')
                    : t('reports.credit.advance')}{' '}
                  {line.number}
                </Text>
                <Text size="xs" c="dimmed">
                  {formatDay(line.date, currentLanguage)}
                </Text>
              </div>
              <Text size="sm" style={{ whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums' }}>
                {t('reports.credit.available', { amount: formatAmount(line.available) })}
              </Text>
            </Group>
          ))}
          <Group justify="space-between" wrap="nowrap" gap="md" mt={4}>
            <Text fw={700}>{t('reports.credit.total')}</Text>
            <Text
              fw={700}
              c="primary.8"
              style={{ whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums' }}
            >
              {formatAmount(credits.data?.total ?? 0)}
            </Text>
          </Group>
        </Stack>
      )}
    </SectionCard>
  );
};
