import tableClasses from '@/module/purchases/presentation/components/shared/Table.module.css';
import { Checkbox, Table, Text } from '@mantine/core';
import { useTranslation } from '@/i18n';
import { compatibleRequest, type ReadyRequest } from '@/module/purchases/domain/paymentForm';
import { formatAmount } from '@/module/purchases/presentation/components/shared/format';

interface ReadyRequestsTableProps {
  requests: ReadyRequest[];
  picked: string[];
  onChange: (ids: string[]) => void;
}

/** Approved requests waiting for a voucher; once one is chosen, only the same vendor's stay open. */
export const ReadyRequestsTable = ({
  requests,
  picked,
  onChange,
}: Readonly<ReadyRequestsTableProps>) => {
  const { t } = useTranslation('purchases');
  const chosen = requests.filter((request) => picked.includes(request.id));

  return (
    <Table.ScrollContainer type="native" minWidth={640}>
      <Table className={tableClasses.table} verticalSpacing="xs" horizontalSpacing="sm">
        <Table.Thead bg="var(--jurnal-color-surface-hover)">
          <Table.Tr>
            <Table.Th w={40} />
            {(['request', 'vendor', 'target', 'amount'] as const).map((key) => (
              <Table.Th key={key} ta={key === 'amount' ? 'right' : undefined}>
                <Text size="xs" fw={700} c="dimmed" tt="uppercase">
                  {t(`payments.form.col.${key}`)}
                </Text>
              </Table.Th>
            ))}
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {requests.map((request) => {
            const isPicked = picked.includes(request.id);
            const blocked = !isPicked && !compatibleRequest(chosen, request);
            return (
              <Table.Tr key={request.id} style={blocked ? { opacity: 0.5 } : undefined}>
                <Table.Td>
                  <Checkbox
                    checked={isPicked}
                    disabled={blocked}
                    aria-label={t('payments.form.selectRequest', { number: request.number })}
                    onChange={(event) =>
                      onChange(
                        event.currentTarget.checked
                          ? [...picked, request.id]
                          : picked.filter((id) => id !== request.id)
                      )
                    }
                  />
                </Table.Td>
                <Table.Td>
                  <Text size="sm" fw={500} style={{ whiteSpace: 'nowrap' }}>
                    {request.number}
                  </Text>
                  <Text size="xs" c="dimmed">
                    {t(`paymentRequests.kinds.${request.kind}`)}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <Text size="sm">{request.vendorName}</Text>
                  {blocked && (
                    <Text size="xs" c="dimmed">
                      {t('payments.form.otherVendor')}
                    </Text>
                  )}
                </Table.Td>
                <Table.Td>
                  <Text size="sm" c="dimmed">
                    {request.target || '-'}
                  </Text>
                </Table.Td>
                <Table.Td ta="right">
                  <Text size="sm" fw={600}>
                    {formatAmount(request.amount)}
                  </Text>
                </Table.Td>
              </Table.Tr>
            );
          })}
        </Table.Tbody>
      </Table>
    </Table.ScrollContainer>
  );
};
