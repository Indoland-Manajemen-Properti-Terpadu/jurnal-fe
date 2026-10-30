import {
  ActionIcon,
  Badge,
  Box,
  Button,
  CopyButton,
  Divider,
  Group,
  Paper,
  SimpleGrid,
  Text,
  Title,
  Tooltip,
} from '@mantine/core';
import { IconCheck, IconCopy, IconDownload, IconLink, IconReceipt2 } from '@tabler/icons-react';
import type { Sale } from '@/module/sales/domain/sale';
import { getSaleStatusConfig } from '@/module/sales/domain/saleFormat';
import type { SaleDisplay } from '../../hooks/useSaleDisplay';
import { DetailField } from './DetailField';
import classes from './SaleDetail.module.css';

type SaleOverviewCardProps = {
  sale: Sale;
  display: SaleDisplay;
  isDownloading: boolean;
  isGeneratingLink: boolean;
  onDownloadPdf: () => void;
  onGenerateLink: () => void;
  onRecordPayment: () => void;
};

export function SaleOverviewCard({
  sale,
  display,
  isDownloading,
  isGeneratingLink,
  onDownloadPdf,
  onGenerateLink,
  onRecordPayment,
}: Readonly<SaleOverviewCardProps>) {
  const { t, money, date } = display;
  const status = getSaleStatusConfig(sale.status);
  const statusTranslation = t(`status.${sale.status}`);
  const statusLabel =
    statusTranslation && !statusTranslation.startsWith('status.')
      ? statusTranslation
      : status.label || sale.status;

  return (
    <Paper
      withBorder
      radius="lg"
      p={{ base: 'md', sm: 'xl' }}
      bg="white"
      className={classes.overview}
    >
      <Group justify="space-between" align="flex-start" gap="lg" wrap="wrap">
        <Box className={classes.identity}>
          <Text size="xs" fw={700} c="dimmed" tt="uppercase" lts={0.6}>
            {t('invoiceNumber')}
          </Text>
          <Group gap="xs" mt={4} wrap="wrap">
            <Title order={1} className={classes.invoiceNumber}>
              {sale.transactionNumber}
            </Title>
            <CopyButton value={sale.transactionNumber}>
              {({ copied, copy }) => (
                <Tooltip label={copied ? t('copied') : t('copyNumber')}>
                  <ActionIcon
                    onClick={copy}
                    aria-label={copied ? t('copied') : t('copyNumber')}
                    variant="subtle"
                    color="primary"
                    size="lg"
                  >
                    {copied ? <IconCheck size={17} /> : <IconCopy size={17} />}
                  </ActionIcon>
                </Tooltip>
              )}
            </CopyButton>
          </Group>
          <Group gap="xs" mt="sm">
            <Badge color={status.color} variant={status.variant || 'light'} size="lg">
              {statusLabel}
            </Badge>
          </Group>
          <Text size="sm" c="dimmed" mt="sm">
            {sale.customer?.displayName || t('unknownCustomer')}
          </Text>
        </Box>
        <Group gap="xs" className={classes.actions}>
          <Button
            variant="default"
            leftSection={<IconDownload size={17} />}
            loading={isDownloading}
            onClick={onDownloadPdf}
          >
            {t('downloadPdf')}
          </Button>
          <Button
            variant="outline"
            color="primary"
            leftSection={<IconLink size={17} />}
            loading={isGeneratingLink}
            onClick={onGenerateLink}
          >
            {sale.invoiceLink ? t('refreshLink') : t('generateLink')}
          </Button>
          {sale.remainingAmount > 0 && (
            <Button
              color="primary"
              leftSection={<IconReceipt2 size={17} />}
              onClick={onRecordPayment}
            >
              {t('recordPayment')}
            </Button>
          )}
        </Group>
      </Group>
      <Divider my="lg" />
      <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="md" className={classes.facts}>
        <DetailField label={t('transactionDate')}>{date(sale.transactionDate)}</DetailField>
        <DetailField label={t('dueDate')}>{date(sale.dueDate)}</DetailField>
        <DetailField label={t('invoiceTotal')}>{money(sale.finalAmount)}</DetailField>
        <Box className={classes.balanceFact}>
          <Text size="xs" fw={700}>
            {t('remaining')}
          </Text>
          <Text size="lg" fw={800} className={classes.amount}>
            {money(sale.remainingAmount)}
          </Text>
        </Box>
      </SimpleGrid>
    </Paper>
  );
}
