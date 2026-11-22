import {
  Alert,
  Anchor,
  Group,
  Paper,
  SimpleGrid,
  Skeleton,
  Stack,
  Table,
  Text,
  ThemeIcon,
} from '@mantine/core';
import {
  IconAlertTriangle,
  IconArrowDownRight,
  IconArrowUpRight,
  IconInfoCircle,
  IconScale,
} from '@tabler/icons-react';
import { Link } from 'react-router-dom';
import { useTranslation } from '@/i18n';
import type { JournalPreview, StockOpname } from '@/module/inventory/domain/stockOpname';
import { columnHeader } from '@/module/inventory/presentation/components/shared/columnHeader';
import { DataTableFrame } from '@/module/inventory/presentation/components/shared/DataTableFrame';
import { Dash } from '@/module/inventory/presentation/components/shared/DetailFrame';
import { routes } from '@/router/routes';
import { formatCurrency, numberFormat } from '@/utils/formatCurrency';

type Props = {
  opname: StockOpname;
  preview: JournalPreview | undefined;
  previewLoading: boolean;
};

type Tone = 'gain' | 'loss' | 'net';

const Figure = ({
  tone,
  label,
  value,
  hint,
}: Readonly<{ tone: Tone; label: string; value: number; hint: string }>) => {
  const color = tone === 'gain' ? 'green' : tone === 'loss' ? 'red' : 'primary';
  const FigureIcon =
    tone === 'gain' ? IconArrowUpRight : tone === 'loss' ? IconArrowDownRight : IconScale;
  let valueColor = 'dark.9';
  if (value > 0 && tone !== 'loss') valueColor = 'green.8';
  if ((tone === 'loss' && value > 0) || (tone === 'net' && value < 0)) valueColor = 'red.7';
  return (
    <Paper withBorder radius="md" p="md" bg="white">
      <Group gap="sm" wrap="nowrap" align="flex-start">
        <ThemeIcon size={36} radius="md" variant="light" color={color}>
          <FigureIcon size={18} />
        </ThemeIcon>
        <div>
          <Text size="xs" c="dimmed" fw={500}>
            {label}
          </Text>
          <Text fz="lg" fw={700} c={valueColor} style={{ fontVariantNumeric: 'tabular-nums' }}>
            {formatCurrency(value)}
          </Text>
          <Text size="xs" c="dimmed">
            {hint}
          </Text>
        </div>
      </Group>
    </Paper>
  );
};

/** What the count changes: surplus, shortage and net, the journal that books it, and the lines behind it. */
export function OpnameSummaryTab({ opname, preview, previewLoading }: Readonly<Props>) {
  const { t } = useTranslation('stockTake');
  const { summary } = opname;

  if (!opname.canSeeValues) {
    return (
      <Alert color="blue" variant="light" icon={<IconInfoCircle size={18} />}>
        {t('summary.hidden')}
      </Alert>
    );
  }

  const withDiff = opname.lines.filter((line) => (line.diffQty ?? 0) !== 0);
  const gainProducts = withDiff.filter((line) => (line.diffQty ?? 0) > 0).length;
  const lossProducts = withDiff.length - gainProducts;
  const entries = preview?.entries ?? [];
  const debit = entries.reduce((total, entry) => total + entry.debit, 0);
  const credit = entries.reduce((total, entry) => total + entry.credit, 0);

  return (
    <Stack gap="lg">
      <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md">
        <Figure
          tone="gain"
          label={t('summary.gain')}
          value={summary.gainValue ?? 0}
          hint={t('summary.gainHint', { count: gainProducts })}
        />
        <Figure
          tone="loss"
          label={t('summary.loss')}
          value={summary.lossValue ?? 0}
          hint={t('summary.lossHint', { count: lossProducts })}
        />
        <Figure
          tone="net"
          label={t('summary.net')}
          value={summary.netValue ?? 0}
          hint={t('summary.netHint')}
        />
      </SimpleGrid>

      {preview && preview.missing.length > 0 && (
        <Alert
          color="yellow"
          variant="light"
          icon={<IconAlertTriangle size={18} />}
          title={t('summary.missingTitle')}
        >
          <Group justify="space-between" wrap="wrap" gap="sm">
            <Text size="sm">
              {t('summary.missingBody', {
                reasons: preview.missing.map((reason) => t(`reason.${reason}`)).join(', '),
              })}
            </Text>
            <Anchor component={Link} to={routes.settings.opnameAccounts} size="sm" fw={600}>
              {t('summary.missingLink')}
            </Anchor>
          </Group>
        </Alert>
      )}

      <Stack gap="xs">
        <div>
          <Text fw={700} fz="md">
            {t('summary.journalTitle')}
          </Text>
          <Text fz="xs" c="dimmed">
            {t('summary.journalSubtitle')}
          </Text>
        </div>
        {previewLoading ? (
          <Skeleton height={80} radius="md" />
        ) : (
          <DataTableFrame minWidth={640} hover={false}>
            <Table.Thead bg="gray.0">
              <Table.Tr>
                {columnHeader(t('summary.account'))}
                {columnHeader(t('summary.reasons'))}
                {columnHeader(t('summary.products'), 'right')}
                {columnHeader(t('summary.debit'), 'right')}
                {columnHeader(t('summary.credit'), 'right')}
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {entries.length === 0 ? (
                <Table.Tr>
                  <Table.Td colSpan={5}>
                    <Stack gap={4} align="center" py="lg">
                      <ThemeIcon size={44} radius="xl" variant="light" color="gray">
                        <IconScale size={22} />
                      </ThemeIcon>
                      <Text size="sm" fw={600}>
                        {t('summary.noDiff')}
                      </Text>
                      <Text size="xs" c="dimmed">
                        {t('summary.noDiffBody')}
                      </Text>
                    </Stack>
                  </Table.Td>
                </Table.Tr>
              ) : (
                entries.map((entry, index) => (
                  <Table.Tr key={`${entry.accountNumber}-${index}`}>
                    <Table.Td>
                      <Text size="sm" fw={600}>
                        {entry.accountNumber} · {entry.accountName}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      {entry.reasons.length > 0 ? (
                        <Text size="sm">
                          {entry.reasons.map((reason) => t(`reason.${reason}`)).join(', ')}
                        </Text>
                      ) : (
                        <Dash />
                      )}
                    </Table.Td>
                    <Table.Td ta="right">
                      <Text size="sm">{entry.count}</Text>
                    </Table.Td>
                    <Table.Td ta="right" style={{ whiteSpace: 'nowrap' }}>
                      {entry.debit > 0 ? (
                        <Text size="sm">{formatCurrency(entry.debit)}</Text>
                      ) : (
                        <Dash />
                      )}
                    </Table.Td>
                    <Table.Td ta="right" style={{ whiteSpace: 'nowrap' }}>
                      {entry.credit > 0 ? (
                        <Text size="sm">{formatCurrency(entry.credit)}</Text>
                      ) : (
                        <Dash />
                      )}
                    </Table.Td>
                  </Table.Tr>
                ))
              )}
            </Table.Tbody>
            {entries.length > 0 && (
              <Table.Tfoot>
                <Table.Tr>
                  <Table.Td colSpan={3}>
                    <Text size="sm" fw={700}>
                      {t('summary.total')}
                    </Text>
                  </Table.Td>
                  <Table.Td ta="right" style={{ whiteSpace: 'nowrap' }}>
                    <Text size="sm" fw={700}>
                      {formatCurrency(debit)}
                    </Text>
                  </Table.Td>
                  <Table.Td ta="right" style={{ whiteSpace: 'nowrap' }}>
                    <Text size="sm" fw={700}>
                      {formatCurrency(credit)}
                    </Text>
                  </Table.Td>
                </Table.Tr>
              </Table.Tfoot>
            )}
          </DataTableFrame>
        )}
      </Stack>

      {withDiff.length > 0 && (
        <Stack gap="xs">
          <div>
            <Text fw={700} fz="md">
              {t('summary.rowsTitle')}
            </Text>
            <Text fz="xs" c="dimmed">
              {t('summary.rowsSubtitle')}
            </Text>
          </div>
          <DataTableFrame minWidth={720} hover={false}>
            <Table.Thead bg="gray.0">
              <Table.Tr>
                {columnHeader(t('count.product'))}
                {columnHeader(t('count.book'), 'right')}
                {columnHeader(t('count.counted'), 'right')}
                {columnHeader(t('count.diff'), 'right')}
                {columnHeader(t('count.value'), 'right')}
                {columnHeader(t('count.reason'))}
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {withDiff.map((line) => {
                const diff = line.diffQty ?? 0;
                return (
                  <Table.Tr key={line.id}>
                    <Table.Td>
                      <Text size="sm" fw={600}>
                        {line.name}
                      </Text>
                      <Text size="xs" c="dimmed">
                        {line.unit}
                      </Text>
                    </Table.Td>
                    <Table.Td ta="right">
                      <Text size="sm">{numberFormat(line.bookQty ?? 0)}</Text>
                    </Table.Td>
                    <Table.Td ta="right">
                      <Text size="sm">{numberFormat(line.countedQty ?? 0)}</Text>
                    </Table.Td>
                    <Table.Td ta="right">
                      <Text size="sm" fw={700} c={diff < 0 ? 'red.7' : 'green.8'}>
                        {diff > 0 ? '+' : ''}
                        {numberFormat(diff)}
                      </Text>
                    </Table.Td>
                    <Table.Td ta="right" style={{ whiteSpace: 'nowrap' }}>
                      <Text size="sm" fw={600}>
                        {line.diffValue === null ? '-' : formatCurrency(line.diffValue)}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      {line.reason ? (
                        <Text size="sm">{t(`reason.${line.reason}`)}</Text>
                      ) : (
                        <Text size="sm" c="orange.8">
                          {t('count.status.reasonRequired')}
                        </Text>
                      )}
                    </Table.Td>
                  </Table.Tr>
                );
              })}
            </Table.Tbody>
          </DataTableFrame>
        </Stack>
      )}
    </Stack>
  );
}
