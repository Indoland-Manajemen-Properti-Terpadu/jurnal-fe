import { Box, Button, Center, Loader } from '@mantine/core';
import { IconAlertCircle, IconFileOff, IconLock } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { AppShellLayout } from '@/components/AppShellLayout';
import { EmptyState } from '@/components/EmptyState';
import { useTranslation } from '@/i18n';
import { routes } from '@/router/routes';

type Kind = 'loading' | 'noAccess' | 'notFound' | 'error' | 'blocked';

interface StateFrameProps {
  kind: Kind;
  onRetry?: () => void;
  /** Used by `blocked`: why the document cannot be used here. */
  title?: string;
  description?: string;
  backTo?: string;
}

/** A full page state (loading, no access, missing document) shown inside the app shell. */
export const StateFrame = ({
  kind,
  onRetry,
  title,
  description,
  backTo,
}: Readonly<StateFrameProps>) => {
  const { t } = useTranslation('purchases');
  const navigate = useNavigate();
  const back = backTo ?? routes.purchases.main;

  const content = () => {
    switch (kind) {
      case 'loading':
        return (
          <Center py={96} role="status" aria-label={t('requests.gate.loading')}>
            <Loader size="md" />
          </Center>
        );
      case 'noAccess':
        return (
          <EmptyState
            icon={<IconLock size={32} stroke={1.6} />}
            title={t('requests.gate.noAccessTitle')}
            description={t('requests.gate.noAccessDescription')}
            actionLabel={t('common.back')}
            onAction={() => navigate(back)}
          />
        );
      case 'notFound':
        return (
          <EmptyState
            icon={<IconFileOff size={32} stroke={1.6} />}
            title={t('requests.gate.notFoundTitle')}
            description={t('requests.gate.notFoundDescription')}
            actionLabel={t('common.back')}
            onAction={() => navigate(back)}
          />
        );
      case 'blocked':
        return (
          <EmptyState
            icon={<IconFileOff size={32} stroke={1.6} />}
            title={title}
            description={description}
            actionLabel={t('common.back')}
            onAction={() => navigate(back)}
          />
        );
      default:
        return (
          <EmptyState
            icon={<IconAlertCircle size={32} stroke={1.6} />}
            color="red"
            title={t('list.errorTitle')}
            description={t('list.errorDescription')}
            actionLabel={t('common.retry')}
            onAction={onRetry}
          />
        );
    }
  };

  return (
    <AppShellLayout>
      <Box p={{ base: 'md', sm: 'xl' }}>
        {content()}
        {kind === 'error' && (
          <Center>
            <Button variant="subtle" onClick={() => navigate(back)}>
              {t('common.back')}
            </Button>
          </Center>
        )}
      </Box>
    </AppShellLayout>
  );
};
