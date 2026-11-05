import { Group, Text, ThemeIcon } from '@mantine/core';
import { IconCheck } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import type { SaleDisplayCode } from '@/module/sales/domain/sale';
import { saleTimeline } from '@/module/sales/domain/saleStatus';

/** Draft, sent, paid: where the invoice is now. Void ends the path in its own step. */
export function SaleTimeline({ code }: Readonly<{ code: SaleDisplayCode }>) {
  const { t } = useTranslation('sales');
  const steps = saleTimeline(code);

  return (
    <Group gap="xs" wrap="wrap" role="list" aria-label={t('view.timelineTitle')}>
      {steps.map((step, index) => (
        <Group key={step.key} gap="xs" wrap="nowrap" role="listitem">
          <ThemeIcon
            size={22}
            radius="xl"
            variant={step.state === 'todo' ? 'default' : 'filled'}
            color={step.state === 'todo' ? 'gray' : 'primary'}
          >
            {step.state === 'done' ? (
              <IconCheck size={13} />
            ) : (
              <Text fz="var(--jurnal-text-xs)" fw={700} lh={1}>
                {index + 1}
              </Text>
            )}
          </ThemeIcon>
          <Text
            size="sm"
            fw={step.state === 'current' ? 700 : 500}
            c={step.state === 'todo' ? 'dimmed' : 'dark.8'}
          >
            {t(`view.step${step.key.charAt(0).toUpperCase()}${step.key.slice(1)}`)}
          </Text>
          {index < steps.length - 1 && (
            <Text c="dimmed" aria-hidden>
              ›
            </Text>
          )}
        </Group>
      ))}
    </Group>
  );
}
