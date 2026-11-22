import { Box, Group, Paper, SimpleGrid, Text, ThemeIcon } from '@mantine/core';
import { IconCheck, IconChecklist } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import {
  procurementSteps,
  quotesNeeded,
  type Procurement,
} from '@/module/purchases/domain/procurement';
import { SectionCard } from '@/module/purchases/presentation/components/shared/SectionCard';

/**
 * "Langkah pengadaan": quotes, winner, notes and approval as four numbered cells, the one to do next
 * highlighted, with a line under them that says what comes next and where to do it.
 */
export const ProcurementSteps = ({ procurement }: Readonly<{ procurement: Procurement }>) => {
  const { t } = useTranslation('purchases');
  const single = procurement.route === 'SINGLE';
  // A single vendor has no comparison, so there is no winner to choose; its notes step is the final price.
  const steps = procurementSteps(procurement).filter((step) => !(single && step.key === 'winner'));
  const stepLabel = (key: string) =>
    t(`procurement.steps.${single && key === 'notes' ? 'finalPrice' : key}`);
  const complete = Object.values(procurement.totals).filter((totals) => totals.complete).length;
  const doneCount = steps.filter((step) => step.done).length;
  const next = steps.findIndex((step) => !step.done);
  const detail = (key: string, done: boolean): string => {
    if (key === 'quotes') {
      return t('procurement.steps.quotesCount', {
        count: complete,
        needed: quotesNeeded(procurement),
      });
    }
    if (key === 'winner') {
      return t(done ? 'procurement.steps.winnerDone' : 'procurement.steps.winnerTodo');
    }
    if (key === 'notes') {
      return t(done ? 'procurement.steps.notesDone' : 'procurement.steps.notesTodo');
    }
    return t(`procurement.statusShort.${procurement.status}`);
  };

  return (
    <SectionCard
      icon={IconChecklist}
      label
      flush
      title={t('procurement.steps.title')}
      subtitle={t(`procurement.route.${procurement.route ?? 'BIDDING'}`)}
      count={t('procurement.steps.progress', { done: doneCount, total: steps.length })}
    >
      <SimpleGrid cols={{ base: 1, sm: steps.length }} spacing={0}>
        {steps.map((step, index) => (
          <Group
            key={step.key}
            gap="sm"
            wrap="nowrap"
            p="md"
            bg={index === next ? 'primary.0' : undefined}
            style={{
              borderTop: '1px solid var(--jurnal-color-border-subtle)',
              borderRight:
                index < steps.length - 1 ? '1px solid var(--jurnal-color-border-subtle)' : 0,
            }}
          >
            <ThemeIcon
              size={28}
              radius="xl"
              variant={step.done ? 'filled' : index === next ? 'white' : 'default'}
              color="primary"
              bd={index === next ? '1px solid var(--mantine-color-primary-6)' : undefined}
            >
              {step.done ? (
                <IconCheck size={14} stroke={2.5} />
              ) : (
                <Text fz="xs" fw={600} component="span">
                  {index + 1}
                </Text>
              )}
            </ThemeIcon>
            <div>
              <Text size="sm" fw={700} lh={1.3}>
                {stepLabel(step.key)}
              </Text>
              <Text size="xs" c="dimmed">
                {detail(step.key, step.done)}
              </Text>
            </div>
          </Group>
        ))}
      </SimpleGrid>
      {next >= 0 && (
        <Paper
          radius={0}
          p={0}
          bg="transparent"
          style={{ borderTop: '1px solid var(--jurnal-color-border-subtle)' }}
        >
          <Group justify="space-between" wrap="wrap" px="lg" py="sm" gap="xs">
            <Text size="sm">
              {t('procurement.steps.next')} <b>{stepLabel(steps[next].key)}</b>
            </Text>
            <Text size="xs" c="dimmed">
              {t(`procurement.steps.hint.${steps[next].key}`)}
            </Text>
          </Group>
        </Paper>
      )}
      <Box />
    </SectionCard>
  );
};
