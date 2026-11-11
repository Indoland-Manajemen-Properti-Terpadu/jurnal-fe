import {
  ActionIcon,
  Badge,
  Box,
  Button,
  CopyButton,
  Divider,
  Group,
  Paper,
  Stack,
  Text,
  Tooltip,
} from '@mantine/core';
import {
  IconCheck,
  IconCopy,
  IconExternalLink,
  IconLink,
  IconPaperclip,
  IconTag,
  IconUser,
} from '@tabler/icons-react';
import type { Sale } from '@/module/sales/domain/sale';
import { saleActions } from '@/module/sales/domain/saleActions';
import { buildInvoiceLink } from '@/module/sales/domain/saleFormat';
import type { SaleDisplay } from '../../hooks/useSaleDisplay';
import { useCopyInvoiceLink } from '../../hooks/useSaleMutations';
import { DetailCardHeader } from './DetailCardHeader';
import { DetailField } from './DetailField';
import classes from './SaleDetail.module.css';

export function SaleSidebar({ sale, display }: Readonly<{ sale: Sale; display: SaleDisplay }>) {
  const { t, dateTime } = display;
  // The backend stores only the link's token; the address is built from where the app runs.
  const invoiceUrl = sale.invoiceLink
    ? buildInvoiceLink(window.location.origin, sale.invoiceLink)
    : '';
  const canCreateLink = saleActions(sale).link;
  const createLink = useCopyInvoiceLink();
  return (
    <Stack gap="lg">
      <Paper withBorder radius="lg" p={{ base: 'md', sm: 'lg' }} bg="white">
        <DetailCardHeader
          icon={<IconUser size={19} />}
          title={t('customerTitle')}
          subtitle={t('customerSubtitle')}
        />
        <Stack gap="sm">
          <DetailField label={t('customer')}>{sale.customer?.displayName}</DetailField>
          <DetailField label={t('billingEmail')}>
            {sale.emails?.[0] || sale.customer?.emails?.[0]}
          </DetailField>
          <DetailField label={t('billingAddress')}>
            {sale.billingAddress || sale.customer?.billingAddress}
          </DetailField>
          <DetailField label={t('paymentTerm')}>{sale.paymentTerm?.name}</DetailField>
        </Stack>
      </Paper>
      <Paper withBorder radius="lg" p={{ base: 'md', sm: 'lg' }} bg="white">
        <DetailCardHeader
          icon={<IconLink size={19} />}
          title={t('documentsTitle')}
          subtitle={t('documentsSubtitle')}
        />
        <Stack gap="md">
          {invoiceUrl ? (
            <Box className={classes.linkPanel}>
              <Text size="xs" fw={700}>
                {t('invoiceLink')}
              </Text>
              <Text size="xs" c="dimmed" truncate mt={3}>
                {invoiceUrl}
              </Text>
              <Group gap="xs" mt="sm">
                <Button
                  component="a"
                  href={invoiceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  size="xs"
                  variant="light"
                  color="primary"
                  leftSection={<IconExternalLink size={15} />}
                >
                  {t('openLink')}
                </Button>
                <CopyButton value={invoiceUrl}>
                  {({ copied, copy }) => (
                    <Button
                      size="xs"
                      variant="subtle"
                      color="primary"
                      onClick={copy}
                      leftSection={copied ? <IconCheck size={15} /> : <IconCopy size={15} />}
                    >
                      {copied ? t('copied') : t('copyLink')}
                    </Button>
                  )}
                </CopyButton>
              </Group>
            </Box>
          ) : (
            <Group justify="space-between" align="center" gap="sm">
              <Text size="sm" c="dimmed">
                {t('noInvoiceLink')}
              </Text>
              {canCreateLink && (
                <Button
                  size="xs"
                  variant="light"
                  color="primary"
                  leftSection={<IconLink size={15} />}
                  loading={createLink.isPending}
                  onClick={() => createLink.mutate(sale.id)}
                >
                  {t('createLink')}
                </Button>
              )}
            </Group>
          )}
          {sale.attachments?.length > 0 && (
            <>
              <Divider />
              <Text size="xs" fw={700} c="dimmed">
                {t('attachments', { count: sale.attachments.length })}
              </Text>
              {sale.attachments.map((attachment, index) => {
                const fileUrl = attachment.filePath?.startsWith('http')
                  ? attachment.filePath
                  : `/${attachment.filePath?.replace(/^\//, '')}`;
                return (
                  <Group
                    key={attachment.id || index}
                    justify="space-between"
                    wrap="nowrap"
                    gap="xs"
                  >
                    <Group gap="xs" wrap="nowrap" className={classes.fileName}>
                      <IconPaperclip size={16} aria-hidden="true" />
                      <Text size="sm" truncate>
                        {attachment.fileName || t('attachment')}
                      </Text>
                    </Group>
                    {attachment.filePath && (
                      <Tooltip label={t('openAttachment')}>
                        <ActionIcon
                          component="a"
                          href={fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`${t('openAttachment')}: ${attachment.fileName || t('attachment')}`}
                          variant="subtle"
                          color="primary"
                          size="lg"
                        >
                          <IconExternalLink size={17} />
                        </ActionIcon>
                      </Tooltip>
                    )}
                  </Group>
                );
              })}
            </>
          )}
        </Stack>
      </Paper>
      {(sale.tags?.length > 0 || sale.customerRefNumber || sale.createdAt || sale.updatedAt) && (
        <Paper withBorder radius="lg" p={{ base: 'md', sm: 'lg' }} bg="white">
          <DetailCardHeader
            icon={<IconTag size={19} />}
            title={t('additionalTitle')}
            subtitle={t('additionalSubtitle')}
          />
          <Stack gap="md">
            {sale.customerRefNumber && (
              <DetailField label={t('customerReference')}>{sale.customerRefNumber}</DetailField>
            )}
            {sale.tags?.length > 0 && (
              <Box>
                <Text size="xs" c="dimmed" fw={600} mb="xs">
                  {t('tags')}
                </Text>
                <Group gap={6}>
                  {sale.tags.map((tag, index) => (
                    <Badge key={tag.id || index} color="primary" variant="light" tt="none">
                      {tag.name}
                    </Badge>
                  ))}
                </Group>
              </Box>
            )}
            {sale.createdAt && (
              <DetailField label={t('createdAt')}>{dateTime(sale.createdAt)}</DetailField>
            )}
            {sale.updatedAt && (
              <DetailField label={t('updatedAt')}>{dateTime(sale.updatedAt)}</DetailField>
            )}
          </Stack>
        </Paper>
      )}
    </Stack>
  );
}
