import { Badge, Box, Button, Divider, Image, Paper, Stack, Text } from '@mantine/core';
import { IconBuildingBank } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import { formatCurrency } from '@/utils/formatCurrency';
import type { BankProvider } from '@/module/bank-connection/domain/connection';
import { bankLogo } from '@/module/bank-connection/presentation/components/bankLogos';

/**
 * A bank to choose. Top part, centered: the logo with the kind of account it takes underneath (the
 * logo is the name, so no name is repeated). Divider. Bottom part: the fee when the backend states
 * one, a badge only when the bank is not available, and the button.
 */
export function ProviderCard({
  provider,
  onConnect,
}: Readonly<{ provider: BankProvider; onConnect: (provider: BankProvider) => void }>) {
  const { t } = useTranslation('bankConnection');
  const available = provider.status === 'AVAILABLE';
  const logo = provider.logoUrl ?? bankLogo(provider.bankCode);
  const statusLabel = {
    AVAILABLE: t('chooser.providerAvailable'),
    COMING_SOON: t('chooser.providerSoon'),
    MAINTENANCE: t('chooser.providerMaintenance'),
  }[provider.status];

  const individual = provider.accountTypes.includes('INDIVIDUAL');
  const corporate = provider.accountTypes.includes('CORPORATE');
  let typeLabel: string | null = null;
  if (individual && corporate) typeLabel = t('chooser.typeBoth');
  else if (corporate) typeLabel = t('chooser.typeCorporate');
  else if (individual) typeLabel = t('chooser.typeIndividual');

  return (
    <Paper withBorder radius="md" bg="white" h="100%" p={0} style={{ overflow: 'hidden' }}>
      <Stack gap={0} h="100%">
        <Stack
          data-part="identity"
          align="center"
          justify="center"
          gap={8}
          px="lg"
          pt="xl"
          pb="lg"
          ta="center"
          style={{ flex: '1 1 auto' }}
        >
          <Box h={44} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {logo ? (
              <Image src={logo} alt={provider.bankName} h={36} w="auto" maw={150} fit="contain" />
            ) : (
              <Box
                w={44}
                h={44}
                bg="primary.0"
                style={{ borderRadius: 10, display: 'grid', placeItems: 'center' }}
              >
                <IconBuildingBank
                  size={22}
                  color="var(--mantine-color-primary-9)"
                  aria-hidden="true"
                />
              </Box>
            )}
          </Box>
          {!logo && <Text fw={600}>{provider.bankName}</Text>}
          {typeLabel && (
            <Text fz={12} c="dimmed">
              {typeLabel}
            </Text>
          )}
        </Stack>

        <Divider />

        <Stack gap="xs" p="lg" align="stretch">
          {provider.monthlyFee !== undefined && (
            <Text fz={12} c="dimmed" ta="center">
              {provider.monthlyFee > 0
                ? t('chooser.feeMonthly', { amount: formatCurrency(provider.monthlyFee) })
                : t('chooser.noFee')}
            </Text>
          )}
          {!available && (
            <Badge variant="light" color="orange" radius="xl" mx="auto">
              {statusLabel}
            </Badge>
          )}
          <Button disabled={!available} onClick={() => onConnect(provider)} fullWidth>
            {t('chooser.connect')}
          </Button>
        </Stack>
      </Stack>
    </Paper>
  );
}
