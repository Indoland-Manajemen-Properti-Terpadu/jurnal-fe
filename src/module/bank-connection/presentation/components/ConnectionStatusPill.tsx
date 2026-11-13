import { Badge } from '@mantine/core';
import { useTranslation } from '@/i18n';
import type {
  ConnectionStatus,
  StatusTone,
} from '@/module/bank-connection/domain/connectionStatus';
import { statusTone } from '@/module/bank-connection/domain/connectionStatus';

const COLOR: Record<StatusTone, string> = {
  neutral: 'gray',
  info: 'primary',
  ok: 'teal',
  warn: 'orange',
  bad: 'red',
};

/** The status of a connection in words, colored by what it asks of the user. */
export function ConnectionStatusPill({ status }: Readonly<{ status: ConnectionStatus }>) {
  const { t } = useTranslation('bankConnection');
  return (
    <Badge variant="light" color={COLOR[statusTone(status)]} radius="xl" size="md">
      {t(`status.${status}`)}
    </Badge>
  );
}
