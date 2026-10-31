import { Button } from '@mantine/core';
import { IconRefresh } from '@tabler/icons-react';
import ErrorAlert from '@/components/ErrorAlert/ErrorAlert';
import { useTranslation } from '@/i18n';
import { usePettyCashErrorMessage } from '@/module/petty-cash/presentation/hooks/pettyCashErrorMessage';

interface Props {
  title: string;
  error: unknown;
  onRetry?: () => void;
}

/** A failed query with a safe sentence (never a raw code or stack) and a way to try again. */
export function QueryErrorState({ title, error, onRetry }: Readonly<Props>) {
  const { t } = useTranslation('pettyCash');
  const describe = usePettyCashErrorMessage();

  return (
    <ErrorAlert
      title={title}
      radius="md"
      message={
        <>
          {describe(error)}
          {onRetry && (
            <Button
              mt="sm"
              size="xs"
              variant="light"
              color="red"
              leftSection={<IconRefresh size={14} />}
              onClick={onRetry}
              display="block"
            >
              {t('common.retry')}
            </Button>
          )}
        </>
      }
    />
  );
}
