import { Skeleton, Table } from '@mantine/core';
import { IconLock } from '@tabler/icons-react';
import type { ReactNode } from 'react';
import { EmptyState } from '@/components/EmptyState';
import { useTranslation } from '@/i18n';

type TableStateProps = {
  colSpan: number;
  isLoading: boolean;
  isError: boolean;
  /** The API refused the request: the person has no access, so a retry would not help. */
  isForbidden?: boolean;
  isEmpty: boolean;
  onRetry: () => void;
  empty: { title: string; description: string; actionLabel?: string; onAction?: () => void };
  children: ReactNode;
};

/** Keeps the table shell in place and swaps only the body: loading rows, error, empty or data. */
export function TableBody({
  colSpan,
  isLoading,
  isError,
  isForbidden = false,
  isEmpty,
  onRetry,
  empty,
  children,
}: Readonly<TableStateProps>) {
  const { t } = useTranslation('userManagement');

  if (isLoading) {
    return (
      <Table.Tbody aria-busy="true">
        {[0, 1, 2, 3].map((row) => (
          <Table.Tr key={row}>
            <Table.Td colSpan={colSpan}>
              <Skeleton height={20} radius="sm" />
            </Table.Td>
          </Table.Tr>
        ))}
      </Table.Tbody>
    );
  }

  if (isError && isForbidden) {
    return (
      <Table.Tbody>
        <Table.Tr>
          <Table.Td colSpan={colSpan}>
            <EmptyState
              title={t('common.noAccess')}
              description={t('common.noAccessHint')}
              icon={<IconLock size={32} stroke={1.6} />}
            />
          </Table.Td>
        </Table.Tr>
      </Table.Tbody>
    );
  }

  if (isError) {
    return (
      <Table.Tbody>
        <Table.Tr>
          <Table.Td colSpan={colSpan}>
            <EmptyState
              title={t('common.loadFailed')}
              description=""
              actionLabel={t('common.retry')}
              onAction={onRetry}
              color="red"
            />
          </Table.Td>
        </Table.Tr>
      </Table.Tbody>
    );
  }

  if (isEmpty) {
    return (
      <Table.Tbody>
        <Table.Tr>
          <Table.Td colSpan={colSpan}>
            <EmptyState
              title={empty.title}
              description={empty.description}
              actionLabel={empty.actionLabel}
              onAction={empty.onAction}
            />
          </Table.Td>
        </Table.Tr>
      </Table.Tbody>
    );
  }

  return <Table.Tbody>{children}</Table.Tbody>;
}
