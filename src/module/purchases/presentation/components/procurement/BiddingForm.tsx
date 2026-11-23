import type { ReactNode } from 'react';
import { Badge, Divider, Stack, Text } from '@mantine/core';
import { IconScale } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import type { Procurement, Quote, ScoreKey } from '@/module/purchases/domain/procurement';
import type { PurchaseRequest } from '@/module/purchases/domain/purchaseRequest';
import { BiddingHeader } from '@/module/purchases/presentation/components/procurement/BiddingHeader';
import { BiddingScoring } from '@/module/purchases/presentation/components/procurement/BiddingScoring';
import { BiddingWinner } from '@/module/purchases/presentation/components/procurement/BiddingWinner';
import { SectionCard } from '@/module/purchases/presentation/components/shared/SectionCard';

interface BiddingFormProps {
  request: PurchaseRequest;
  procurement: Procurement;
  /** Scores and winner can still be changed (draft or rejected, and the person may fill). */
  editable: boolean;
  busy: boolean;
  onScore: (quote: Quote, key: ScoreKey, value: number) => void;
  onChoose: (quote: Quote) => void;
  /** Reasons, evidence, submit and approval: they belong to the same form, below the winner. */
  children?: ReactNode;
}

const STATUS_COLOR = {
  DRAFT: 'gray',
  SUBMITTED: 'orange',
  APPROVED: 'green',
  REJECTED: 'red',
} as const;

const step = (number: number, title: string, hint: string) => (
  <Text size="sm" fw={700} tt="uppercase">
    {number}. {title}{' '}
    <Text span size="xs" c="dimmed" fw={400} tt="none">
      · {hint}
    </Text>
  </Text>
);

/**
 * The bidding form, as in the reference: the bidding header, the vendors scored side by side, then
 * the winner chosen from the comparison cards. The reasons, evidence and submit follow below it.
 */
export const BiddingForm = ({
  request,
  procurement,
  editable,
  busy,
  onScore,
  onChoose,
  children,
}: Readonly<BiddingFormProps>) => {
  const { t } = useTranslation('purchases');
  const decided = procurement.winnerId !== null && !editable;

  return (
    <SectionCard
      icon={IconScale}
      title={t('procurement.bidding.title')}
      subtitle={t('procurement.bidding.subtitle')}
      action={
        <Badge variant="light" radius="sm" color={STATUS_COLOR[procurement.status]}>
          {t(`procurement.bidding.status.${procurement.status}`)}
        </Badge>
      }
    >
      <Stack gap="md">
        <BiddingHeader request={request} procurement={procurement} />
        {step(1, t('procurement.bidding.scoreStep'), t('procurement.bidding.scoreHint'))}
        <BiddingScoring
          procurement={procurement}
          editable={editable}
          busy={busy}
          onScore={onScore}
        />
        {step(
          2,
          decided ? t('procurement.bidding.chosenStep') : t('procurement.bidding.pickStep'),
          decided ? '' : t('procurement.bidding.pickHint')
        )}
        <BiddingWinner
          procurement={procurement}
          items={request.items}
          editable={editable}
          busy={busy}
          onChoose={onChoose}
        />
        {children && (
          <>
            <Divider />
            {children}
          </>
        )}
      </Stack>
    </SectionCard>
  );
};
