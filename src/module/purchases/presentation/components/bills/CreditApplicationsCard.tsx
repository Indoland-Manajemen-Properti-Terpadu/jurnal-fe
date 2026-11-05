import { useState } from 'react';
import { Anchor, Badge, Button, Group, Stack, Text } from '@mantine/core';
import { IconReceiptRefund } from '@tabler/icons-react';
import { Link } from 'react-router-dom';
import { useTranslation } from '@/i18n';
import type { BillCreditAllocation } from '@/module/purchases/presentation/components/bills/billExtras';
import { ReasonModal } from '@/module/purchases/presentation/components/shared/ReasonModal';
import { SectionCard } from '@/module/purchases/presentation/components/shared/SectionCard';
import { formatAmount, formatDay } from '@/module/purchases/presentation/components/shared/format';
import { useVoidCreditApplication } from '@/module/purchases/presentation/hooks/usePurchaseMutations';
import { usePayment, useReturn } from '@/module/purchases/presentation/hooks/usePurchaseQueries';
import { routes } from '@/router/routes';

/** The credit's own number, looked up from the return or the advance it came from. */
const CreditSource = ({ allocation }: Readonly<{ allocation: BillCreditAllocation }>) => {
  const { t } = useTranslation('purchases');
  const isReturn = allocation.source === 'RETURN';
  const returnDoc = useReturn(isReturn ? allocation.sourceId : undefined);
  const advance = usePayment(isReturn ? undefined : allocation.sourceId);
  const number = isReturn ? returnDoc.data?.number : advance.data?.number;
  const to = (isReturn ? routes.purchases.returnDetail : routes.purchases.paymentDetail).replace(
    ':id',
    allocation.sourceId
  );
  return (
    <Group gap={6}>
      <Text size="sm" fw={500}>
        {isReturn ? t('bills.credits.sourceReturn') : t('bills.credits.sourceAdvance')}
      </Text>
      {number && (
        <Anchor component={Link} to={to} size="sm">
          {number}
        </Anchor>
      )}
    </Group>
  );
};

interface CreditApplicationsCardProps {
  billId: string;
  allocations: BillCreditAllocation[];
  /** The user may cancel an allocation and the bill is still open to it. */
  canVoid: boolean;
}

export const CreditApplicationsCard = ({
  billId,
  allocations,
  canVoid,
}: Readonly<CreditApplicationsCardProps>) => {
  const { t, currentLanguage } = useTranslation('purchases');
  const voidCredit = useVoidCreditApplication();
  const [target, setTarget] = useState<BillCreditAllocation | null>(null);
  if (allocations.length === 0) return null;

  return (
    <SectionCard
      icon={IconReceiptRefund}
      title={t('bills.credits.title')}
      subtitle={t('bills.credits.subtitle')}
    >
      <Stack gap="sm">
        {allocations.map((allocation) => (
          <Group
            key={allocation.id}
            justify="space-between"
            wrap="nowrap"
            gap="md"
            style={{ opacity: allocation.voided ? 0.6 : 1 }}
          >
            <div>
              <CreditSource allocation={allocation} />
              <Text size="xs" c="dimmed">
                {formatDay(allocation.date, currentLanguage)}
              </Text>
            </div>
            <Group gap="sm" wrap="nowrap">
              <Text
                size="sm"
                td={allocation.voided ? 'line-through' : undefined}
                style={{ whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums' }}
              >
                {formatAmount(allocation.amount)}
              </Text>
              {allocation.voided ? (
                <Badge color="gray" variant="light" radius="sm">
                  {t('bills.credits.cancelled')}
                </Badge>
              ) : (
                canVoid && (
                  <Button
                    variant="subtle"
                    color="red"
                    size="compact-xs"
                    onClick={() => setTarget(allocation)}
                  >
                    {t('bills.credits.cancel')}
                  </Button>
                )
              )}
            </Group>
          </Group>
        ))}
      </Stack>
      <ReasonModal
        opened={target !== null}
        title={t('bills.credits.cancelTitle')}
        description={t('bills.credits.cancelDescription')}
        confirmLabel={t('bills.credits.cancel')}
        loading={voidCredit.isPending}
        onClose={() => setTarget(null)}
        onConfirm={(reason) =>
          target &&
          voidCredit.mutate(
            { billId, applicationId: target.id, reason },
            { onSuccess: () => setTarget(null) }
          )
        }
      />
    </SectionCard>
  );
};
