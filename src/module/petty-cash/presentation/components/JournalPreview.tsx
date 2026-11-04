import type { ReactNode } from 'react';
import { Accordion, Stack, Table, Text } from '@mantine/core';
import { useTranslation } from '@/i18n';
import { formatCurrency } from '@/utils/formatCurrency';
import type { ReplenishmentPreview } from '@/module/petty-cash/domain/pettyCashEntities';
import { AmountRows, type AmountRow } from '@/module/petty-cash/presentation/components/DetailKit';
import { FormSummaryCard } from '@/module/petty-cash/presentation/components/FormSummaryCard';

const money = (amount: number) => formatCurrency(amount, false);

function Breakdown({
  title,
  lines,
}: Readonly<{ title: string; lines: { accountId: string; account: string; amount: number }[] }>) {
  return (
    <Stack gap={6}>
      <Text size="xs" c="dimmed" fw={700} tt="uppercase" lts={0.4}>
        {title}
      </Text>
      <AmountRows
        rows={lines.map((line) => ({ label: line.account, value: money(line.amount) }))}
      />
    </Stack>
  );
}

/**
 * What the replenishment would pay, as the backend works it out: the amount, how it is made up and
 * the balance of the journal. The journal lines themselves are in `JournalDisclosure`. The
 * actions of the page go in as children.
 */
export function PayoutSummary({
  preview,
  children,
}: Readonly<{ preview: ReplenishmentPreview; children?: ReactNode }>) {
  const { t, currentLanguage } = useTranslation('pettyCash');
  const hasVariance = preview.varianceAmount !== 0;
  const shortage = preview.varianceAmount < 0;

  const rows: AmountRow[] = [
    { label: t('replenishForm.voucherTotal'), value: money(preview.voucherTotal) },
    ...(hasVariance
      ? [
          {
            label: t(shortage ? 'replenishForm.shortage' : 'replenishForm.surplus'),
            value: money(Math.abs(preview.varianceAmount)),
          },
        ]
      : []),
    { label: t('replenishForm.payout'), value: money(preview.totalAmount), total: true },
    { label: t('replenishForm.cashAfter'), value: money(preview.cashAfterDisbursement) },
  ];
  const notes = [
    ...(hasVariance
      ? [t(shortage ? 'replenishForm.shortageNote' : 'replenishForm.surplusNote')]
      : []),
    t('replenishForm.previewIndicative'),
  ];

  return (
    <FormSummaryCard
      title={t('replenishForm.previewTitle')}
      rows={rows}
      notes={notes}
      details={
        <>
          <Breakdown title={t('replenishForm.expenseBreakdown')} lines={preview.expenseBreakdown} />
          {preview.taxBreakdown.length > 0 && (
            <Breakdown title={t('replenishForm.taxBreakdown')} lines={preview.taxBreakdown} />
          )}
          {preview.warnings.map((warning) => (
            <Text key={`${warning.code}-${warning.message}`} size="xs" c="orange.8" fw={600}>
              {currentLanguage === 'id' && warning.message
                ? warning.message
                : t('replenishForm.warningGeneric')}
            </Text>
          ))}
        </>
      }
      status={{
        tone: preview.isBalanced ? 'ok' : 'warning',
        text: preview.isBalanced ? t('replenishForm.balanced') : t('replenishForm.unbalanced'),
      }}
    >
      {children}
    </FormSummaryCard>
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
