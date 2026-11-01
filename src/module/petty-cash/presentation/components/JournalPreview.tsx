import { Accordion, Alert, Badge, Divider, Group, Paper, Stack, Table, Text } from '@mantine/core';
import { IconAlertTriangle, IconCircleCheck } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import { formatCurrency } from '@/utils/formatCurrency';
import type { ReplenishmentPreview } from '@/module/petty-cash/domain/pettyCashEntities';

const money = (amount: number) => formatCurrency(amount, false);

function Row({
  label,
  value,
  strong,
}: Readonly<{ label: string; value: string; strong?: boolean }>) {
  return (
    <Group justify="space-between" wrap="nowrap" gap="md">
      <Text size="sm" c={strong ? 'dark.9' : 'dimmed'} fw={strong ? 700 : 400}>
        {label}
      </Text>
      <Text size="sm" fw={strong ? 700 : 600} ta="right">
        {value}
      </Text>
    </Group>
  );
}

/**
 * What the replenishment would pay, as the backend works it out: the amount, how it is made up and
 * the balance of the journal. The journal lines themselves are in `JournalDisclosure`.
 */
export function PayoutSummary({ preview }: Readonly<{ preview: ReplenishmentPreview }>) {
  const { t, currentLanguage } = useTranslation('pettyCash');
  const hasVariance = preview.varianceAmount !== 0;
  const shortage = preview.varianceAmount < 0;

  return (
    <Paper withBorder radius="md" p="lg" bg="white" shadow="xs">
      <Stack gap="sm">
        <Text fw={700}>{t('replenishForm.previewTitle')}</Text>

        <Stack gap={2}>
          <Text size="sm" c="dimmed">
            {t('replenishForm.payout')}
          </Text>
          <Text fz={28} fw={700} lh={1.1} c="dark.9">
            {money(preview.totalAmount)}
          </Text>
        </Stack>

        <Divider />
        <Row label={t('replenishForm.voucherTotal')} value={money(preview.voucherTotal)} />
        {hasVariance && (
          <>
            <Row
              label={t(shortage ? 'replenishForm.shortage' : 'replenishForm.surplus')}
              value={money(Math.abs(preview.varianceAmount))}
            />
            <Text size="xs" c="dimmed">
              {t(shortage ? 'replenishForm.shortageNote' : 'replenishForm.surplusNote')}
            </Text>
          </>
        )}
        <Row label={t('replenishForm.cashAfter')} value={money(preview.cashAfterDisbursement)} />

        <Divider />
        <Text size="xs" c="dimmed" fw={700} tt="uppercase" lts={0.4}>
          {t('replenishForm.expenseBreakdown')}
        </Text>
        {preview.expenseBreakdown.map((line) => (
          <Row key={line.accountId} label={line.account} value={money(line.amount)} />
        ))}
        {preview.taxBreakdown.length > 0 && (
          <>
            <Text size="xs" c="dimmed" fw={700} tt="uppercase" lts={0.4} mt="xs">
              {t('replenishForm.taxBreakdown')}
            </Text>
            {preview.taxBreakdown.map((line) => (
              <Row key={line.accountId} label={line.account} value={money(line.amount)} />
            ))}
          </>
        )}

        <Badge
          variant="light"
          color={preview.isBalanced ? 'teal' : 'orange'}
          radius="sm"
          tt="none"
          leftSection={
            preview.isBalanced ? <IconCircleCheck size={13} /> : <IconAlertTriangle size={13} />
          }
          style={{ alignSelf: 'flex-start' }}
        >
          {preview.isBalanced ? t('replenishForm.balanced') : t('replenishForm.unbalanced')}
        </Badge>

        {preview.warnings.map((warning) => (
          <Alert
            key={`${warning.code}-${warning.message}`}
            variant="light"
            color="orange"
            radius="md"
            icon={<IconAlertTriangle size={16} />}
          >
            {currentLanguage === 'id' && warning.message
              ? warning.message
              : t('replenishForm.warningGeneric')}
          </Alert>
        ))}
      </Stack>
    </Paper>
  );
}

/**
 * The journal that would be posted, behind a disclosure. It needs the width of the main column:
 * long account names and two amount columns do not fit beside the summary.
 */
export function JournalDisclosure({ preview }: Readonly<{ preview: ReplenishmentPreview }>) {
  const { t } = useTranslation('pettyCash');

  return (
    <Accordion variant="contained" radius="md">
      <Accordion.Item value="journal">
        <Accordion.Control>{t('replenishForm.journalToggle')}</Accordion.Control>
        <Accordion.Panel>
          <Table.ScrollContainer minWidth={320}>
            <Table verticalSpacing="xs">
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>{t('replenishForm.account')}</Table.Th>
                  <Table.Th ta="right">{t('replenishForm.debit')}</Table.Th>
                  <Table.Th ta="right">{t('replenishForm.credit')}</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {preview.journalPreview.map((line) => (
                  <Table.Tr key={`${line.account}-${line.debit}-${line.credit}`}>
                    <Table.Td>{line.account}</Table.Td>
                    <Table.Td ta="right">{line.debit > 0 ? money(line.debit) : ''}</Table.Td>
                    <Table.Td ta="right">{line.credit > 0 ? money(line.credit) : ''}</Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Table.ScrollContainer>
        </Accordion.Panel>
      </Accordion.Item>
    </Accordion>
  );
}
