import { Anchor, Text } from '@mantine/core';
import { IconClipboardText } from '@tabler/icons-react';
import { Link } from 'react-router-dom';
import { useTranslation } from '@/i18n';
import type { PurchaseReturn } from '@/module/purchases/domain/purchaseDocuments';
import { InfoGrid } from '@/module/purchases/presentation/components/shared/InfoGrid';
import { SectionCard } from '@/module/purchases/presentation/components/shared/SectionCard';
import { formatDay } from '@/module/purchases/presentation/components/shared/format';
import { routes } from '@/router/routes';

interface ReturnInfoCardProps {
  doc: PurchaseReturn;
  billNumber: string | null;
}

/** Which bill the goods go back against, when, and why. */
export const ReturnInfoCard = ({ doc, billNumber }: Readonly<ReturnInfoCardProps>) => {
  const { t, currentLanguage } = useTranslation('purchases');
  return (
    <SectionCard icon={IconClipboardText} title={t('returns.detail.infoTitle')}>
      <InfoGrid
        items={[
          { label: t('returns.detail.vendor'), value: doc.vendor.name },
          {
            label: t('returns.detail.bill'),
            value: (
              <Anchor
                component={Link}
                to={routes.purchases.billDetail.replace(':id', doc.billId)}
                size="sm"
                fw={500}
              >
                {billNumber ?? t('journey.bill')}
              </Anchor>
            ),
          },
          { label: t('returns.detail.date'), value: formatDay(doc.date, currentLanguage) },
          { label: t('returns.detail.reason'), value: doc.reason },
          ...(doc.memo ? [{ label: t('common.memo'), value: doc.memo, span: 2 as const }] : []),
        ]}
      />
      {doc.journalId && (
        <Text size="xs" c="dimmed">
          {t('returns.detail.journal')}
        </Text>
      )}
    </SectionCard>
  );
};
