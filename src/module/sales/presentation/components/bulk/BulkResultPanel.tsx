import { Anchor, Badge, Group, Stack, Table, Text } from '@mantine/core';
import { useTranslation } from '@/i18n';
import type { BulkOutcome, BulkRowStatus } from '@/module/sales/domain/saleBulk';
import { DocNoteBanner } from '../docs/DocNoteBanner';

const COLORS: Record<BulkRowStatus, string> = { created: 'green', skipped: 'gray', failed: 'red' };

interface BulkResultPanelProps {
  outcome: BulkOutcome;
  onOpenInvoice: (saleId: string) => void;
}

const Stat = ({ label, value, color }: { label: string; value: number; color?: string }) => (
  <Stack gap={2} style={{ flex: '1 1 140px' }}>
    <Text size="xs" fw={700} c="dimmed">
      {label}
    </Text>
    <Text fw={700} fz={24} c={color} style={{ fontVariantNumeric: 'tabular-nums' }}>
      {value}
    </Text>
  </Stack>
);

/** What happened to each customer, with the draft invoice that was made. */
export function BulkResultPanel({ outcome, onOpenInvoice }: Readonly<BulkResultPanelProps>) {
  const { t } = useTranslation('salesBulk');
  const note =
    outcome.created > 0 && outcome.skipped + outcome.failed === 0
      ? { tone: 'green' as const, text: t('result.allDone') }
      : outcome.created > 0
        ? { tone: 'blue' as const, text: t('result.someDone') }
        : { tone: 'gray' as const, text: t('result.noneDone') };

  return (
    <Stack gap="md">
      <Group gap="xl" wrap="wrap">
        <Stat label={t('result.created')} value={outcome.created} color="green.8" />
        <Stat label={t('result.skipped')} value={outcome.skipped} />
        <Stat
          label={t('result.failed')}
          value={outcome.failed}
          color={outcome.failed > 0 ? 'red.7' : undefined}
        />
      </Group>
      <DocNoteBanner tone={note.tone} text={note.text} />
      <Table.ScrollContainer minWidth={520}>
        <Table verticalSpacing="xs" horizontalSpacing="sm">
          <Table.Thead bg="gray.0">
            <Table.Tr>
              <Table.Th>{t('result.colCustomer')}</Table.Th>
              <Table.Th w={160}>{t('result.colStatus')}</Table.Th>
              <Table.Th>{t('result.colInvoice')}</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {outcome.rows.map((row) => (
              <Table.Tr key={row.customer}>
                <Table.Td>
                  <Text size="sm" fw={600}>
                    {row.name || row.customer}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <Badge color={COLORS[row.status]} variant="light" radius="sm">
                    {t(`result.status${row.status[0].toUpperCase()}${row.status.slice(1)}`)}
                  </Badge>
                </Table.Td>
                <Table.Td>
                  {row.saleId ? (
                    <Anchor
                      component="button"
                      type="button"
                      size="sm"
                      onClick={() => onOpenInvoice(row.saleId as string)}
                    >
                      {row.transactionNumber}
                    </Anchor>
                  ) : (
                    <Text size="sm" c="dimmed">
                      {row.message || '–'}
                    </Text>
                  )}
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Table.ScrollContainer>
    </Stack>
  );
}
