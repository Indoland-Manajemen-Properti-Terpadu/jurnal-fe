import { Group, Paper, SimpleGrid, Text, ThemeIcon } from '@mantine/core';
import { IconCheck } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import {
  procurementSteps,
  quotesNeeded,
  type Procurement,
} from '@/module/purchases/domain/procurement';

/** Where the procurement stands: quotes, winner, notes and approval, each done or still ahead. */
export const ProcurementSteps = ({ procurement }: Readonly<{ procurement: Procurement }>) => {
  const { t } = useTranslation('purchases');
  const steps = procurementSteps(procurement);
  const complete = Object.values(procurement.totals).filter((totals) => totals.complete).length;
  const detail = (key: string): string => {
    if (key === 'quotes') {
      return t('procurement.steps.quotesCount', {
        count: complete,
        needed: quotesNeeded(procurement),
      });
    }
    if (key === 'approval') return t(`procurement.statusShort.${procurement.status}`);
    return '';
  };

  return (
    <Paper withBorder radius="md" bg="white" p={0} shadow="xs" style={{ overflow: 'hidden' }}>
      <SimpleGrid cols={{ base: 1, sm: 4 }} spacing={0}>
        {steps.map((step, index) => (
          <Group
            key={step.key}
            gap="sm"
            wrap="nowrap"
            p="md"
            style={{
              borderRight: index < steps.length - 1 ? '1px solid var(--mantine-color-gray-2)' : 0,
            }}
          >
            <ThemeIcon
              size={28}
              radius="xl"
              variant={step.done ? 'filled' : 'light'}
              color={step.done ? 'primary' : 'gray'}
            >
              {step.done ? <IconCheck size={14} /> : <Text fz="xs">{index + 1}</Text>}
            </ThemeIcon>
            <div>
              <Text size="sm" fw={600} lh={1.3}>
                {t(`procurement.steps.${step.key}`)}
              </Text>
              {detail(step.key) && (
                <Text size="xs" c="dimmed">
                  {detail(step.key)}
                </Text>
              )}
            </div>
          </Group>
        ))}
      </SimpleGrid>
    </Paper>
  );
};
