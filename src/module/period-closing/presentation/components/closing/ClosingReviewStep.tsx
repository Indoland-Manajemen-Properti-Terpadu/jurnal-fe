import { useState } from 'react';
import {
  Alert,
  Button,
  Checkbox,
  Paper,
  SimpleGrid,
  Skeleton,
  Stack,
  Table,
  Text,
} from '@mantine/core';
import { IconInfoCircle } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import { textStyles } from '@/theme';
import type { CloseBooksWizard } from '@/module/period-closing/presentation/hooks/useCloseBooksWizard';
import {
  formatDay,
  formatMinor,
  formatMinorAmount,
} from '@/module/period-closing/presentation/periodFormat';
import { StepCard } from './StepCard';

const VISIBLE_LINES = 8;

interface FigureProps {
  label: string;
  value: string;
  tone?: string;
}

function Figure({ label, value, tone }: Readonly<FigureProps>) {
  return (
    <Paper withBorder radius="md" p="md">
      <Text size="xs" c="dimmed" fw={600}>
        {label}
      </Text>
      <Text fw={700} fz="lg" c={tone} style={textStyles.numeric}>
        {value}
      </Text>
    </Paper>
  );
}

/** Step 4: the closing journal as it will be posted, then the user's explicit go-ahead. */
export function ClosingReviewStep({ wizard }: Readonly<{ wizard: CloseBooksWizard }>) {
  const { t, currentLanguage } = useTranslation('periodClosing');
  const [showAll, setShowAll] = useState(false);
  const { preview, retainedEarnings, trialBalance } = wizard;
  const end = formatDay(wizard.range.endDate, currentLanguage);
  const isLoss = preview.netProfit < 0;
  const lines = showAll ? preview.lines : preview.lines.slice(0, VISIBLE_LINES);
  const totalSide = preview.totalRevenue + Math.max(-preview.netProfit, 0);
  const retainedLabel = retainedEarnings
    ? [retainedEarnings.accountNumber, retainedEarnings.name].filter(Boolean).join(' ')
    : '';

  return (
    <StepCard
      step={4}
      title={t('wizard.review.title')}
      description={t('wizard.review.subtitle', { end })}
    >
      {trialBalance.isLoading ? (
        <Skeleton height={160} radius="md" />
      ) : (
        <Stack gap="lg">
          <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="sm">
            <Figure label={t('wizard.review.revenue')} value={formatMinor(preview.totalRevenue)} />
            <Figure label={t('wizard.review.expense')} value={formatMinor(preview.totalExpense)} />
            <Figure
              label={isLoss ? t('wizard.review.loss') : t('wizard.review.profit')}
              value={formatMinor(Math.abs(preview.netProfit))}
              tone={isLoss ? 'red.8' : 'teal.8'}
            />
          </SimpleGrid>

          {preview.lines.length === 0 ? (
            <Alert variant="light" color="gray" radius="md" icon={<IconInfoCircle size={18} />}>
              {t('wizard.review.noLines')}
            </Alert>
          ) : (
            <Stack gap="xs">
              <Text size="sm" fw={600}>
                {t('wizard.review.journalTitle')}
              </Text>
              <Paper withBorder radius="md" style={{ overflow: 'hidden' }}>
                <Table.ScrollContainer minWidth={520}>
                  <Table verticalSpacing={6} horizontalSpacing="md" style={textStyles.numeric}>
                    <Table.Thead bg="gray.0">
                      <Table.Tr>
                        <Table.Th>{t('wizard.review.account')}</Table.Th>
                        <Table.Th ta="right" w={160}>
                          {t('wizard.review.debit')}
                        </Table.Th>
                        <Table.Th ta="right" w={160}>
                          {t('wizard.review.credit')}
                        </Table.Th>
                      </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                      {lines.map((line) => (
                        <Table.Tr key={line.accountId}>
                          <Table.Td>
                            <Text size="sm" span c="dimmed" mr={6}>
                              {line.accountNumber}
                            </Text>
                            <Text size="sm" span pl={line.credit ? 'lg' : 0}>
                              {line.name}
                            </Text>
                          </Table.Td>
                          <Table.Td ta="right">
                            {line.debit ? formatMinorAmount(line.debit) : ''}
                          </Table.Td>
                          <Table.Td ta="right">
                            {line.credit ? formatMinorAmount(line.credit) : ''}
                          </Table.Td>
                        </Table.Tr>
                      ))}
                      {preview.netProfit !== 0 && (
                        <Table.Tr bg="primary.0">
                          <Table.Td>
                            <Text size="sm" fw={600} pl={isLoss ? 0 : 'lg'}>
                              {retainedLabel}
                            </Text>
                          </Table.Td>
                          <Table.Td ta="right" fw={600}>
                            {isLoss ? formatMinorAmount(-preview.netProfit) : ''}
                          </Table.Td>
                          <Table.Td ta="right" fw={600}>
                            {isLoss ? '' : formatMinorAmount(preview.netProfit)}
                          </Table.Td>
                        </Table.Tr>
                      )}
                      <Table.Tr bg="gray.0">
                        <Table.Td fw={700}>{t('wizard.review.total')}</Table.Td>
                        <Table.Td ta="right" fw={700}>
                          {formatMinorAmount(totalSide)}
                        </Table.Td>
                        <Table.Td ta="right" fw={700}>
                          {formatMinorAmount(totalSide)}
                        </Table.Td>
                      </Table.Tr>
                    </Table.Tbody>
                  </Table>
                </Table.ScrollContainer>
              </Paper>
              {preview.lines.length > VISIBLE_LINES && (
                <Button
                  variant="subtle"
                  size="xs"
                  w="fit-content"
                  onClick={() => setShowAll((value) => !value)}
                >
                  {showAll
                    ? t('wizard.review.showLess')
                    : t('wizard.review.showAll', { count: preview.lines.length })}
                </Button>
              )}
              <Text size="xs" c="dimmed">
                {t('wizard.review.estimate')}
              </Text>
            </Stack>
          )}

          <Paper withBorder radius="md" p="md" bg="primary.0">
            <Stack gap="xs">
              <Text size="sm" fw={700}>
                {t('wizard.review.confirmTitle')}
              </Text>
              <Checkbox
                checked={wizard.acknowledged}
                onChange={(event) => wizard.setAcknowledged(event.currentTarget.checked)}
                label={t('wizard.review.acknowledge', { end })}
              />
            </Stack>
          </Paper>
        </Stack>
      )}
    </StepCard>
  );
}
