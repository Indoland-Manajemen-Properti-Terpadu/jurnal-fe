import { useState } from 'react';
import {
  Alert,
  Anchor,
  Box,
  Button,
  Group,
  Paper,
  SimpleGrid,
  Skeleton,
  Stack,
  Text,
} from '@mantine/core';
import { IconAlertCircle, IconArrowLeft, IconPlugConnected } from '@tabler/icons-react';
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { AppShellLayout } from '@/components/AppShellLayout';
import { ModuleHeader } from '@/components/ModuleHeader/ModuleHeader';
import { routes } from '@/router/routes';
import { useTranslation } from '@/i18n';
import { useSimpleAccounts } from '@/module/chart-of-accounts';
import type { BankProvider } from '@/module/bank-connection/domain/connection';
import { blocksNewRequest } from '@/module/bank-connection/domain/connectionStatus';
import {
  Illustration,
  type IllustrationName,
} from '@/module/bank-connection/presentation/components/Illustration';
import { ConnectionProcess } from '@/module/bank-connection/presentation/components/ConnectionProcess';
import { MessagePanel } from '@/module/bank-connection/presentation/components/MessagePanel';
import { ProviderCard } from '@/module/bank-connection/presentation/components/ProviderCard';
import { useAccountConnections } from '@/module/bank-connection/presentation/hooks/useBankConnectionQueries';
import { useAvailableProviders } from '@/module/bank-connection/presentation/hooks/useAvailableProviders';
import { ProposeBankDialog } from '@/module/bank-connection/presentation/components/ProposeBankDialog';

const BENEFITS: Array<{ key: string; art: IllustrationName }> = [
  { key: 'reconcile', art: 'reconcile' },
  { key: 'feed', art: 'feed' },
  { key: 'control', art: 'control' },
  { key: 'secure', art: 'secure' },
];

/** Step 0: what the connection gives, then the banks to choose from. The banks come only from the backend. */
export default function BankConnectionPage() {
  const { t } = useTranslation('bankConnection');
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const accountId = params.get('accountId') ?? '';

  const providers = useAvailableProviders();
  const [proposing, setProposing] = useState(false);
  const connections = useAccountConnections(accountId);
  const accounts = useSimpleAccounts({ isBankAndCash: true });
  const account = accounts.accounts.find((item) => item.id === accountId);

  // An account has one connection at a time: send the user to the one it already has.
  const open = connections.data?.find((connection) => blocksNewRequest(connection.status));
  if (open) {
    return <Navigate to={routes.bankConnection.detail.replace(':connectionId', open.id)} replace />;
  }

  const connect = (provider: BankProvider) => {
    const query = new URLSearchParams({ providerId: provider.id });
    if (accountId) query.set('accountId', accountId);
    navigate(`${routes.bankConnection.add}?${query.toString()}`);
  };

  const failure = providers.error;

  return (
    <AppShellLayout withFooter>
      <Box p={{ base: 'md', sm: 'xl' }}>
        <Stack gap="lg">
          <ModuleHeader
            icon={IconPlugConnected}
            title={t('title')}
            description={
              account
                ? t('chooser.forAccount', { account: `${account.accountNumber} · ${account.name}` })
                : t('chooser.heroTitle')
            }
            actions={
              <Button
                variant="default"
                radius="md"
                leftSection={<IconArrowLeft size={16} />}
                onClick={() => navigate(routes.bankCash.main)}
              >
                {t('backToCashBank')}
              </Button>
            }
          />

          <Paper withBorder radius="md" p="xl" bg="white">
            <SimpleGrid cols={{ base: 1, md: 2 }} spacing="xl" style={{ alignItems: 'center' }}>
              <Stack gap="xs">
                <Text component="h2" fz={20} fw={700} c="dark.9" m={0}>
                  {t('chooser.heroTitle')}
                </Text>
                <Text c="dimmed" maw="46ch">
                  {t('chooser.heroBody')}
                </Text>
              </Stack>
              <Illustration name="hero" maxWidth={420} />
            </SimpleGrid>
          </Paper>

          <SimpleGrid cols={{ base: 1, xs: 2, md: 4 }}>
            {BENEFITS.map(({ key, art }) => (
              <Paper key={key} withBorder radius="md" p="lg" bg="white">
                <Stack gap="xs" align="center" ta="center">
                  <Illustration name={art} />
                  <Text fw={600}>{t(`chooser.benefits.${key}.title`)}</Text>
                  <Text fz="sm" c="dimmed">
                    {t(`chooser.benefits.${key}.body`)}
                  </Text>
                </Stack>
              </Paper>
            ))}
          </SimpleGrid>

          <Stack gap="md">
            <Group justify="space-between" gap="md">
              <Text component="h2" fz={18} fw={700} c="dark.9" m={0}>
                {t('chooser.chooseTitle')}
              </Text>
              <Anchor component="button" type="button" fz="sm" onClick={() => setProposing(true)}>
                {t('chooser.propose')}
              </Anchor>
            </Group>

            {providers.isLoading && (
              <SimpleGrid cols={{ base: 1, xs: 2, md: 4 }}>
                {[0, 1, 2, 3].map((item) => (
                  <Skeleton key={item} height={200} radius="md" />
                ))}
              </SimpleGrid>
            )}

            {failure && (
              <Alert icon={<IconAlertCircle size={16} />} color="red" radius="md">
                <Stack gap="xs" align="flex-start">
                  <span>
                    {failure.kind === 'forbidden' ? t('chooser.forbidden') : t('chooser.loadError')}
                  </span>
                  {failure.kind !== 'forbidden' && (
                    <Button
                      size="xs"
                      variant="light"
                      color="red"
                      onClick={() => providers.refetch()}
                    >
                      {t('retry')}
                    </Button>
                  )}
                </Stack>
              </Alert>
            )}

            {providers.providers && providers.providers.length === 0 && (
              <MessagePanel
                illustration="empty"
                title={t('chooser.noProvidersTitle')}
                body={t('chooser.noProvidersBody')}
              />
            )}

            {providers.providers && providers.providers.length > 0 && (
              <SimpleGrid cols={{ base: 1, xs: 2, md: 4 }}>
                {providers.providers.map((provider) => (
                  <ProviderCard key={provider.id} provider={provider} onConnect={connect} />
                ))}
              </SimpleGrid>
            )}
          </Stack>

          <ConnectionProcess />

          <ProposeBankDialog
            opened={proposing}
            onClose={() => setProposing(false)}
            shownCodes={(providers.providers ?? []).flatMap((item) =>
              item.bankCode ? [item.bankCode] : []
            )}
          />
        </Stack>
      </Box>
    </AppShellLayout>
  );
}
