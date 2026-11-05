import { Anchor, Group, Text } from '@mantine/core';
import { IconRoute } from '@tabler/icons-react';
import { Link } from 'react-router-dom';
import { useTranslation } from '@/i18n';
import type { PurchaseStatus } from '@/module/purchases/domain/purchaseStatus';
import { SectionCard } from '@/module/purchases/presentation/components/shared/SectionCard';
import { StatusBadge } from '@/module/purchases/presentation/components/shared/StatusBadge';
import {
  Timeline,
  type TimelineItem,
} from '@/module/purchases/presentation/components/shared/Timeline';

export interface JourneyStep {
  /** i18n key suffix under `journey.`: request, order, receipt, bill, payment, return. */
  kind: 'request' | 'order' | 'receipt' | 'bill' | 'payment' | 'return';
  /** Documents already created for this step; empty means the step is still ahead. */
  documents: { id: string; number: string; status: PurchaseStatus; to: string }[];
  /** Highlights the document being viewed. */
  current?: boolean;
}

const DRAFT = new Set(['DRAFT']);
const DEAD = new Set(['VOID', 'CANCELLED', 'REJECTED']);

/**
 * A step is done once one of its documents is past draft and still alive. Documents that are only
 * drafts keep the step open (waiting); documents that are all cancelled leave it as not started.
 */
const stepState = (documents: JourneyStep['documents']): TimelineItem['state'] => {
  const live = documents.filter((doc) => !DEAD.has(doc.status));
  if (live.length === 0) return 'upcoming';
  return live.some((doc) => !DRAFT.has(doc.status)) ? 'done' : 'waiting';
};

/** The procure-to-pay chain of one purchase: what exists, what is next, one click to each document. */
export const DocumentJourney = ({ steps }: Readonly<{ steps: JourneyStep[] }>) => {
  const { t } = useTranslation('purchases');

  const items: TimelineItem[] = steps.map((step) => {
    const done = step.documents.length > 0;
    return {
      id: step.kind,
      state: stepState(step.documents),
      children: (
        <>
          <Text size="sm" fw={600} c={done ? 'dark.8' : 'dimmed'} lh={1.4}>
            {t(`journey.${step.kind}`)}
            {step.current && (
              <Text span size="xs" c="primary.7" fw={600} ml={8}>
                {t('journey.thisDocument')}
              </Text>
            )}
          </Text>
          {done ? (
            step.documents.map((doc) => (
              <Group key={doc.id} gap={8} mt={2}>
                <Anchor component={Link} to={doc.to} size="sm" fw={step.current ? 600 : 400}>
                  {doc.number}
                </Anchor>
                <StatusBadge status={doc.status} />
              </Group>
            ))
          ) : (
            <Text size="xs" c="dimmed">
              {t('journey.notCreated')}
            </Text>
          )}
        </>
      ),
    };
  });

  return (
    <SectionCard icon={IconRoute} title={t('journey.title')} subtitle={t('journey.subtitle')}>
      <Timeline items={items} />
    </SectionCard>
  );
};
