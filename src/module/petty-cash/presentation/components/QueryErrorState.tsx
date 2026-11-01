import { Alert, Button } from '@mantine/core';
import { IconAlertCircle, IconRefresh } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import { usePettyCashErrorMessage } from '@/module/petty-cash/presentation/hooks/pettyCashErrorMessage';

interface Props {
  title: string;
  error: unknown;
  onRetry?: () => void;
}

/**
 * A failed load or action as a calm notice, not an alarm: a soft warning with an exclamation mark,
 * a plain sentence (never a raw code or stack) and a way to try again.
 */
export function QueryErrorState({ title, error, onRetry }: Readonly<Props>) {
  const { t } = useTranslation('pettyCash');
  const describe = usePettyCashErrorMessage();

  return (
    <Alert
      variant="light"
      color="orange"
      radius="md"
      title={title}
      icon={<IconAlertCircle size={18} />}
      role="alert"
    >
      {describe(error)}
      {onRetry && (
        <Button
          mt="sm"
          size="xs"
          variant="light"
          color="orange"
          leftSection={<IconRefresh size={14} />}
          onClick={onRetry}
          display="block"
        >
          {t('common.retry')}
        </Button>
      )}
    </Alert>
  );
}
