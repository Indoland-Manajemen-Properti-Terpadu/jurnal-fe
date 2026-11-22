import { Alert, Checkbox, Paper, Select, Skeleton, Stack, Table, Text } from '@mantine/core';
import { IconBuildingStore, IconInfoCircle } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import {
  incompatibility,
  type BillSourceDoc,
  type PickedSource,
} from '@/module/purchases/domain/billSources';
import tableClasses from '@/module/purchases/presentation/components/shared/Table.module.css';
import { formatDay } from '@/module/purchases/presentation/components/shared/format';
import { useBillSources } from '@/module/purchases/presentation/hooks/usePurchaseQueries';

interface BillSourcePickerProps {
  source: PickedSource;
  picked: BillSourceDoc[];
  /** The vendor the list is narrowed to. */
  vendorId: string;
  onVendorChange: (vendorId: string) => void;
  onToggle: (doc: BillSourceDoc) => void;
}

/** The vendor that is shown: the chosen one, else the vendor of what is picked, else the first. */
export const effectiveVendor = (
  docs: BillSourceDoc[],
  picked: BillSourceDoc[],
  vendorId: string
): string => vendorId || picked[0]?.vendor.id || docs[0]?.vendor.id || '';

/** Vendor, then the receipts or orders of that vendor ready to be billed; picks must share vendor and term. */
export const BillSourcePicker = ({
  source,
  picked,
  vendorId,
  onVendorChange,
  onToggle,
}: Readonly<BillSourcePickerProps>) => {
  const { t, currentLanguage } = useTranslation('purchases');
  const query = useBillSources(source);
  const docs = query.data ?? [];

  if (query.isLoading) {
    return (
      <Stack gap="xs">
        <Skeleton height={64} radius="md" />
        <Skeleton height={64} radius="md" />
      </Stack>
    );
  }
  if (query.isError) {
    return (
      <Alert color="red" variant="light" radius="md">
        {t('bills.form.sourcesError')}
      </Alert>
    );
  }
  if (docs.length === 0) {
    return (
      <Alert color="blue" variant="light" radius="md" icon={<IconInfoCircle size={18} />}>
        {t(source === 'RECEIPT' ? 'bills.form.noReceipts' : 'bills.form.noOrders')}
      </Alert>
    );
  }

  const vendors = [...new Map(docs.map((doc) => [doc.vendor.id, doc.vendor.name]))].map(
    ([value, label]) => ({ value, label })
  );
  const current = effectiveVendor(docs, picked, vendorId);
  const rows = docs.filter((doc) => doc.vendor.id === current);
  const receipts = source === 'RECEIPT';

  return (
    <Stack gap="md">
      <Select
        withAsterisk
        allowDeselect={false}
        searchable
        label={t('bills.form.vendor')}
        description={t('bills.wizard.vendorHint')}
        leftSection={<IconBuildingStore size={16} />}
        data={vendors}
        value={current}
        onChange={(id) => id && onVendorChange(id)}
      />
      <Paper withBorder radius="md" style={{ overflow: 'hidden' }}>
        <Table.ScrollContainer type="native" minWidth={720}>
          <Table className={tableClasses.table} verticalSpacing="md" horizontalSpacing="lg">
            <Table.Thead bg="var(--jurnal-color-surface-muted)">
              <Table.Tr>
                <Table.Th w={44} />
                {[
                  receipts ? 'receipt' : 'order',
                  ...(receipts ? ['fromOrder'] : []),
                  'date',
                  'term',
                  'due',
                  'open',
                ].map((key) => (
                  <Table.Th key={key} ta={key === 'open' ? 'right' : undefined}>
                    <Text size="xs" fw={700} c="dark.7">
                      {t(`bills.wizard.col.${key}`)}
                    </Text>
                  </Table.Th>
                ))}
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {rows.map((doc) => {
                const isPicked = picked.some((item) => item.id === doc.id);
                const blocked = isPicked ? null : incompatibility(picked, doc);
                const openLines = doc.lines.filter((line) => line.openQty > 0).length;
                return (
                  <Table.Tr
                    key={doc.id}
                    bg={isPicked ? 'var(--mantine-color-primary-0)' : undefined}
                    style={{
                      cursor: blocked ? 'not-allowed' : 'pointer',
                      opacity: blocked ? 0.55 : 1,
                    }}
                    onClick={() => !blocked && onToggle(doc)}
                  >
                    <Table.Td>
                      <Checkbox
                        checked={isPicked}
                        disabled={blocked !== null}
                        aria-label={t('bills.form.pickAria', { number: doc.number })}
                        onChange={() => onToggle(doc)}
                        onClick={(event) => event.stopPropagation()}
                      />
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm" fw={700}>
                        {doc.number}
                      </Text>
                      {blocked && (
                        <Text size="xs" c="orange.8">
                          {t(`bills.form.blocked.${blocked}`)}
                        </Text>
                      )}
                    </Table.Td>
                    {receipts && (
                      <Table.Td>
                        <Text size="sm" c="dimmed">
                          {doc.orderNumber}
                        </Text>
                      </Table.Td>
                    )}
                    <Table.Td>
                      <Text size="sm">{formatDay(doc.date, currentLanguage)}</Text>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm" fw={500}>
                        {doc.term.name}
                      </Text>
                      {doc.term.description && (
                        <Text size="xs" c="dimmed">
                          {doc.term.description}
                        </Text>
                      )}
                    </Table.Td>
                    <Table.Td>
                      {doc.dueDate ? (
                        <Text size="sm" fw={500}>
                          {formatDay(doc.dueDate, currentLanguage)}
                        </Text>
                      ) : (
                        <Text size="sm" c="dimmed">
                          {doc.term.dueText || '-'}
                        </Text>
                      )}
                    </Table.Td>
                    <Table.Td ta="right">
                      <Text size="sm">{t('bills.wizard.lineCount', { count: openLines })}</Text>
                    </Table.Td>
                  </Table.Tr>
                );
              })}
            </Table.Tbody>
          </Table>
        </Table.ScrollContainer>
      </Paper>
      <Alert color="blue" variant="light" radius="md" icon={<IconInfoCircle size={18} />}>
        {t(`bills.wizard.mergeNote.${source}`)}
      </Alert>
    </Stack>
  );
};
