import { Accordion, Badge, Group, Select, Stack, Table, Text, Tooltip } from '@mantine/core';
import { IconInfoCircle } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import { highestScoreQuoteIds, weightedScore } from '@/module/purchases/domain/biddingScore';
import type { Procurement, Quote, ScoreKey } from '@/module/purchases/domain/procurement';
import { SCORE_KEYS } from '@/module/purchases/domain/quoteForm';
import { formatAmount } from '@/module/purchases/presentation/components/shared/format';

interface BiddingScoringProps {
  procurement: Procurement;
  editable: boolean;
  busy: boolean;
  onScore: (quote: Quote, key: ScoreKey, value: number) => void;
}

const LEVELS = [5, 4, 3, 2, 1];

/** Each vendor scored 1 to 5 on the criteria, side by side, with the weighted score and the top one. */
export const BiddingScoring = ({
  procurement,
  editable,
  busy,
  onScore,
}: Readonly<BiddingScoringProps>) => {
  const { t } = useTranslation('purchases');
  const weights = new Map(procurement.scoreCriteria.map((criterion) => [criterion.key, criterion]));
  const highest = highestScoreQuoteIds(procurement);
  const levelData = LEVELS.map((level) => ({
    value: String(level),
    label: `${level} · ${t(`procurement.bidding.level.${level}`)}`,
  }));

  return (
    <>
      <Accordion variant="contained" radius="md" chevronPosition="right">
        <Accordion.Item value="scale">
          <Accordion.Control icon={<IconInfoCircle size={18} />}>
            <Text size="sm" fw={700}>
              {t('procurement.bidding.scaleTitle')}
            </Text>
          </Accordion.Control>
          <Accordion.Panel>
            <Stack gap={4}>
              {LEVELS.map((level) => (
                <Group key={level} gap="xs" wrap="nowrap" align="baseline">
                  <Text size="sm" fw={700} w={18}>
                    {level}
                  </Text>
                  <Text size="sm">
                    <Text span fw={600}>
                      {t(`procurement.bidding.level.${level}`)}
                    </Text>{' '}
                    <Text span c="dimmed">
                      · {t(`procurement.bidding.levelHint.${level}`)}
                    </Text>
                  </Text>
                </Group>
              ))}
              <Text size="xs" c="dimmed" mt={4}>
                {t('procurement.bidding.scaleNote')}
              </Text>
            </Stack>
          </Accordion.Panel>
        </Accordion.Item>
      </Accordion>
      <Table.ScrollContainer type="native" minWidth={880}>
        <Table verticalSpacing="xs" withTableBorder>
          <Table.Thead bg="var(--jurnal-color-surface-hover)">
            <Table.Tr>
              <Table.Th miw={140}>{t('procurement.col.vendor')}</Table.Th>
              {SCORE_KEYS.map((key) => (
                <Table.Th key={key}>
                  <Tooltip label={t(`procurement.bidding.criterionHint.${key}`)} multiline w={240}>
                    <div>
                      <Text size="sm" fw={600}>
                        {t(`procurement.quote.score.${key}`)}
                      </Text>
                      {weights.has(key) && (
                        <Text size="xs" c="dimmed" fw={400}>
                          {t('procurement.bidding.weight', {
                            weight: weights.get(key)?.weight ?? 0,
                          })}
                        </Text>
                      )}
                    </div>
                  </Tooltip>
                </Table.Th>
              ))}
              <Table.Th ta="right" miw={96}>
                {t('procurement.col.score')}
              </Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {procurement.quotes.map((quote) => {
              const total = procurement.totals[quote.id];
              const score = total?.score ?? weightedScore(quote.scores, procurement.scoreCriteria);
              return (
                <Table.Tr key={quote.id}>
                  <Table.Td>
                    <Text size="sm" fw={600}>
                      {quote.vendor.name}
                    </Text>
                    <Text size="xs" c="dimmed">
                      {total ? formatAmount(total.total) : '-'}
                    </Text>
                  </Table.Td>
                  {SCORE_KEYS.map((key) => {
                    const value = quote.scores[key];
                    return (
                      <Table.Td key={key} miw={160}>
                        {editable ? (
                          <Select
                            size="xs"
                            radius="md"
                            allowDeselect={false}
                            placeholder={t('procurement.bidding.rate')}
                            data={levelData}
                            value={value === null ? null : String(value)}
                            disabled={busy}
                            aria-label={`${quote.vendor.name} · ${t(`procurement.quote.score.${key}`)}`}
                            onChange={(next) => next && onScore(quote, key, Number(next))}
                          />
                        ) : (
                          <Text size="sm">
                            {value === null
                              ? '-'
                              : `${value} · ${t(`procurement.bidding.level.${value}`)}`}
                          </Text>
                        )}
                      </Table.Td>
                    );
                  })}
                  <Table.Td ta="right">
                    <Stack gap={2} align="flex-end">
                      {' '}
                      <Text size="sm" fw={700}>
                        {score === null ? '-' : score.toFixed(2)}
                      </Text>
                      {highest.includes(quote.id) && (
                        <Badge
                          size="xs"
                          radius="sm"
                          color="green"
                          variant="light"
                          style={{ flexShrink: 0 }}
                        >
                          {t('procurement.bidding.highest')}
                        </Badge>
                      )}
                    </Stack>
                  </Table.Td>
                </Table.Tr>
              );
            })}
          </Table.Tbody>
        </Table>
      </Table.ScrollContainer>
    </>
  );
};
