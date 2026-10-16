import { useState } from 'react';
import {
  ActionIcon,
  Anchor,
  Badge,
  Box,
  Button,
  CopyButton,
  Divider,
  Grid,
  Group,
  Paper,
  SimpleGrid,
  Skeleton,
  Stack,
  Table,
  Text,
  ThemeIcon,
  Title,
  Tooltip,
} from '@mantine/core';
import {
  IconArrowLeft,
  IconArrowUpRight,
  IconCheck,
  IconCopy,
  IconDownload,
  IconExternalLink,
  IconFileText,
  IconLink,
  IconNotebook,
  IconPaperclip,
  IconReceipt2,
  IconTag,
  IconUser,
  IconX,
} from '@tabler/icons-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import AppShellLayout from '@/components/AppShellLayout';
import { ModuleHeader } from '@/components/ModuleHeader/ModuleHeader';
import { useTranslation } from '@/i18n';
import { routes } from '@/router/routes';
import { PaySaleModal } from '../components/PaySaleModal';
import {
  useCreateSalePayment,
  useDownloadInvoicePdf,
  useGenerateInvoiceLink,
  useSaleDetail,
} from '../hooks/useSaleQueries';
import type { CreateSalePaymentPayload, Sale, SaleItem } from '../types/sale';
import { getSaleStatusConfig } from '../utils/saleFormat';
import classes from './SaleDetailPage.module.css';

type Translate = (key: string, params?: Record<string, string | number>) => string;

function useSaleDisplay() {
  const { t, i18n } = useTranslation('saleDetail');
  const locale = i18n.language === 'en' ? 'en-US' : 'id-ID';
  const currency = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  });
  const date = new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short', year: 'numeric' });
  const dateTime = new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
  return {
    t,
    money: (value: number) => currency.format(value),
    date: (value: string | null) => (value ? date.format(new Date(value)) : '—'),
    dateTime: (value: string | null) => (value ? dateTime.format(new Date(value)) : '—'),
    number: (value: number) => new Intl.NumberFormat(locale).format(value),
  };
}

function DetailField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <Box className={classes.detailField}>
      <Text size="xs" c="dimmed" fw={600}>
        {label}
      </Text>
      <Text size="sm" fw={600} className={classes.fieldValue}>
        {children || '—'}
      </Text>
    </Box>
  );
}

function AmountRow({
  label,
  amount,
  emphasis = false,
}: {
  label: string;
  amount: string;
  emphasis?: boolean;
}) {
  return (
    <Group
      justify="space-between"
      align="baseline"
      wrap="nowrap"
      gap="md"
      className={classes.amountRow}
    >
      <Text size="sm" fw={emphasis ? 700 : 500} c={emphasis ? 'primary.9' : 'dimmed'}>
        {label}
      </Text>
      <Text
        size={emphasis ? 'lg' : 'sm'}
        fw={emphasis ? 800 : 600}
        c={emphasis ? 'primary.9' : undefined}
        className={classes.amount}
      >
        {amount}
      </Text>
    </Group>
  );
}

function SaleItems({
  sale,
  t,
  money,
  number,
}: {
  sale: Sale;
  t: Translate;
  money: (value: number) => string;
  number: (value: number) => string;
}) {
  const itemContent = (item: SaleItem) => {
    const journalId =
      item.journalTransaction ||
      item.journalId ||
      item.transactionId ||
      sale.journalId ||
      sale.transactionId;
    return (
      <Stack gap={2}>
        {item.product?.id ? (
          <Anchor
            component={Link}
            to={routes.baseModules.productDetail.replace(':id', item.product.id)}
            size="sm"
            fw={700}
            c="primary.9"
            className={classes.inlineLink}
          >
            {item.product.name}
            <IconArrowUpRight size={14} aria-hidden="true" />
          </Anchor>
        ) : (
          <Text size="sm" fw={700}>
            {item.product?.name || item.description || '—'}
          </Text>
        )}
        {item.product?.productCode && (
          <Text size="xs" c="dimmed">
            {item.product.productCode}
          </Text>
        )}
        {item.description && item.product?.name && (
          <Text size="xs" c="dimmed">
            {item.description}
          </Text>
        )}
        {journalId && (
          <Anchor
            component={Link}
            to={routes.generalJournal.detailTransactionJournal.replace(':idTransaction', journalId)}
            size="xs"
            fw={600}
            className={classes.inlineLink}
          >
            <IconNotebook size={14} aria-hidden="true" />
            {t('viewJournal')}
          </Anchor>
        )}
      </Stack>
    );
  };

  const hasAdjustedAmount = sale.items.some(
    (item) => item.adjustedAmount !== undefined && item.adjustedAmount !== null
  );

  return (
    <Paper withBorder radius="lg" p={{ base: 'md', sm: 'lg' }} bg="white">
      <Group justify="space-between" mb="lg" align="center">
        <Box>
          <Title order={3} size="md">
            {t('itemsTitle')}
          </Title>
          <Text size="xs" c="dimmed" mt={3}>
            {t('itemsCount', { count: sale.items.length })}
          </Text>
        </Box>
        <ThemeIcon size={36} radius="md" color="primary" variant="light">
          <IconReceipt2 size={19} />
        </ThemeIcon>
      </Group>
      <div className={classes.desktopItems}>
        <Table.ScrollContainer minWidth={620}>
          <Table verticalSpacing="md" horizontalSpacing="sm">
            <Table.Thead className={classes.tableHead}>
              <Table.Tr>
                <Table.Th>{t('item')}</Table.Th>
                <Table.Th ta="right">{t('quantity')}</Table.Th>
                <Table.Th ta="right">{t('unitPrice')}</Table.Th>
                <Table.Th>{t('tax')}</Table.Th>
                {hasAdjustedAmount && <Table.Th ta="right">{t('adjustedAmount')}</Table.Th>}
                <Table.Th ta="right">{t('amount')}</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {sale.items.length ? (
                sale.items.map((item, index) => (
                  <Table.Tr key={item.id || item._id || index}>
                    <Table.Td>{itemContent(item)}</Table.Td>
                    <Table.Td ta="right" className={classes.amount}>
                      {number(item.quantity)}
                    </Table.Td>
                    <Table.Td ta="right" className={classes.amount}>
                      {money(item.unitPrice)}
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm">{item.tax?.name || '—'}</Text>
                    </Table.Td>
                    {hasAdjustedAmount && (
                      <Table.Td ta="right" className={classes.amount}>
                        {item.adjustedAmount !== undefined && item.adjustedAmount !== null
                          ? item.adjustedAmount === 0
                            ? '—'
                            : `${item.adjustedAmount > 0 ? '+' : ''}${money(item.adjustedAmount)}`
                          : '—'}
                      </Table.Td>
                    )}
                    <Table.Td ta="right" fw={700} className={classes.amount}>
                      {money(item.amount)}
                    </Table.Td>
                  </Table.Tr>
                ))
              ) : (
                <Table.Tr>
                  <Table.Td colSpan={hasAdjustedAmount ? 6 : 5}>
                    <Text ta="center" c="dimmed" py="xl">
                      {t('noItems')}
                    </Text>
                  </Table.Td>
                </Table.Tr>
              )}
            </Table.Tbody>
          </Table>
        </Table.ScrollContainer>
      </div>
      <Stack gap={0} className={classes.mobileItems}>
        {sale.items.length ? (
          sale.items.map((item, index) => (
            <Box key={item.id || item._id || index} className={classes.mobileItem}>
              {itemContent(item)}
              <Group justify="space-between" align="end" mt="sm" gap="xs">
                <Stack gap={2}>
                  <Text size="xs" c="dimmed">
                    {number(item.quantity)} × {money(item.unitPrice)}
                    {item.tax?.name ? ` · ${item.tax.name}` : ''}
                  </Text>
                  {item.adjustedAmount !== undefined && item.adjustedAmount !== 0 && (
                    <Text
                      size="xs"
                      c={item.adjustedAmount > 0 ? 'teal.7' : 'red.7'}
                      fw={600}
                    >
                      {t('adjustedAmount')}: {item.adjustedAmount > 0 ? '+' : ''}
                      {money(item.adjustedAmount)}
                    </Text>
                  )}
                </Stack>
                <Text size="sm" fw={700} className={classes.amount}>
                  {money(item.amount)}
                </Text>
              </Group>
            </Box>
          ))
        ) : (
          <Text ta="center" c="dimmed" py="xl">
            {t('noItems')}
          </Text>
        )}
      </Stack>
      <Divider my="lg" />
      <Box className={classes.totals}>
        <AmountRow label={t('subtotal')} amount={money(sale.subtotal)} />
        {!!sale.discountAmount && sale.discountAmount > 0 && (
          <AmountRow
            label={`${t('discount')}${sale.discountType === 'percentage' ? ` (${sale.discountValue}%)` : ''}`}
            amount={`−${money(sale.discountAmount)}`}
          />
        )}
        {!!sale.taxAmount && sale.taxAmount > 0 && (
          <AmountRow label={t('taxTotal')} amount={`+${money(sale.taxAmount)}`} />
        )}
        {sale.adjustedAmount !== undefined && sale.adjustedAmount !== 0 && (
          <AmountRow
            label={t('adjustedAmountTotal')}
            amount={`${sale.adjustedAmount > 0 ? '+' : ''}${money(sale.adjustedAmount)}`}
          />
        )}
        {!!sale.lateFeeAmount && sale.lateFeeAmount > 0 && (
          <AmountRow label={t('lateFee')} amount={`+${money(sale.lateFeeAmount)}`} />
        )}
        {!!sale.withholdingAmount && sale.withholdingAmount > 0 && (
          <AmountRow
            label={`${t('withholding')}${sale.withholdingAccount?.name ? ` · ${sale.withholdingAccount.name}` : ''}`}
            amount={`−${money(sale.withholdingAmount)}`}
          />
        )}
        <Divider my="xs" />
        <AmountRow label={t('invoiceTotal')} amount={money(sale.finalAmount)} emphasis />
        <AmountRow label={t('paid')} amount={money(sale.paidAmount)} />
        <AmountRow label={t('remaining')} amount={money(sale.remainingAmount)} emphasis />
      </Box>
    </Paper>
  );
}

function SaleSidebar({
  sale,
  t,
  dateTime,
}: {
  sale: Sale;
  t: Translate;
  dateTime: (value: string | null) => string;
}) {
  return (
    <Stack gap="lg">
      <Paper withBorder radius="lg" p={{ base: 'md', sm: 'lg' }} bg="white">
        <Group gap="sm" mb="md">
          <ThemeIcon size={36} radius="md" color="primary" variant="light">
            <IconUser size={19} />
          </ThemeIcon>
          <Title order={3} size="md">
            {t('customerTitle')}
          </Title>
        </Group>
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
        <Group gap="sm" mb="md">
          <ThemeIcon size={36} radius="md" color="primary" variant="light">
            <IconFileText size={19} />
          </ThemeIcon>
          <Title order={3} size="md">
            {t('documentsTitle')}
          </Title>
        </Group>
        <Stack gap="md">
          {sale.invoiceLink ? (
            <Box className={classes.linkPanel}>
              <Text size="xs" fw={700}>
                {t('invoiceLink')}
              </Text>
              <Text size="xs" c="dimmed" truncate mt={3}>
                {sale.invoiceLink}
              </Text>
              <Group gap="xs" mt="sm">
                <Button
                  component="a"
                  href={sale.invoiceLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  size="xs"
                  variant="light"
                  color="primary"
                  leftSection={<IconExternalLink size={15} />}
                >
                  {t('openLink')}
                </Button>
                <CopyButton value={sale.invoiceLink}>
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
            <Text size="sm" c="dimmed">
              {t('noInvoiceLink')}
            </Text>
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
          <Group gap="sm" mb="md">
            <ThemeIcon size={36} radius="md" color="primary" variant="light">
              <IconTag size={19} />
            </ThemeIcon>
            <Title order={3} size="md">
              {t('additionalTitle')}
            </Title>
          </Group>
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

export function SaleDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t, money, date, dateTime, number } = useSaleDisplay();
  const [payModalOpened, setPayModalOpened] = useState(false);
  const { data: sale, isLoading, isError, refetch } = useSaleDetail(id);
  const payMutation = useCreateSalePayment(id);
  const generateLinkMutation = useGenerateInvoiceLink();
  const downloadPdfMutation = useDownloadInvoicePdf();

  const handlePaySubmit = async (payload: CreateSalePaymentPayload) => {
    await payMutation.mutateAsync(payload);
    setPayModalOpened(false);
    refetch();
  };
  const handleGenerateLink = async () => {
    if (!sale) return;
    await generateLinkMutation.mutateAsync(sale.id);
    refetch();
  };
  const handleDownloadPdf = async () => {
    if (!sale) return;
    await downloadPdfMutation.mutateAsync({
      id: sale.id,
      filename: `Faktur-${sale.transactionNumber.replace(/[/\\?%*:|"<>]/g, '_')}.pdf`,
    });
  };

  if (isLoading) {
    return (
      <AppShellLayout>
        <Box p={{ base: 'md', sm: 'xl' }}>
          <Stack gap="lg">
            <Skeleton height={110} radius="lg" />
            <Skeleton height={170} radius="lg" />
            <Grid gutter="lg">
              <Grid.Col span={{ base: 12, lg: 8 }}>
                <Skeleton height={440} radius="lg" />
              </Grid.Col>
              <Grid.Col span={{ base: 12, lg: 4 }}>
                <Skeleton height={300} radius="lg" />
              </Grid.Col>
            </Grid>
          </Stack>
        </Box>
      </AppShellLayout>
    );
  }
  if (isError || !sale) {
    return (
      <AppShellLayout>
        <Box p={{ base: 'md', sm: 'xl' }}>
          <Paper withBorder radius="lg" p="xl" ta="center">
            <ThemeIcon size={56} radius="xl" color="red" variant="light" mx="auto" mb="md">
              <IconX size={26} />
            </ThemeIcon>
            <Title order={2} size="lg">
              {t('notFoundTitle')}
            </Title>
            <Text size="sm" c="dimmed" mt="xs" mb="lg">
              {t('notFoundDescription')}
            </Text>
            <Group justify="center">
              <Button
                variant="default"
                leftSection={<IconArrowLeft size={16} />}
                onClick={() => navigate(routes.sales.main)}
              >
                {t('back')}
              </Button>
              <Button variant="light" onClick={() => refetch()}>
                {t('retry')}
              </Button>
            </Group>
          </Paper>
        </Box>
      </AppShellLayout>
    );
  }

  const status = getSaleStatusConfig(sale.status);
  return (
    <AppShellLayout>
      <Box p={{ base: 'md', sm: 'xl' }}>
        <Stack gap="lg">
          <ModuleHeader
            icon={IconReceipt2}
            title={t('title')}
            description={t('description')}
            breadcrumbs={[
              { label: t('sales'), to: routes.sales.main },
              { label: sale.transactionNumber },
            ]}
            actions={
              <Button
                variant="default"
                leftSection={<IconArrowLeft size={16} />}
                onClick={() => navigate(routes.sales.main)}
              >
                {t('back')}
              </Button>
            }
          />
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
                    {t(`status.${sale.status}`)}
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
                  loading={downloadPdfMutation.isPending}
                  onClick={handleDownloadPdf}
                >
                  {t('downloadPdf')}
                </Button>
                <Button
                  variant="outline"
                  color="primary"
                  leftSection={<IconLink size={17} />}
                  loading={generateLinkMutation.isPending}
                  onClick={handleGenerateLink}
                >
                  {sale.invoiceLink ? t('refreshLink') : t('generateLink')}
                </Button>
                {sale.remainingAmount > 0 && (
                  <Button
                    color="primary"
                    leftSection={<IconReceipt2 size={17} />}
                    onClick={() => setPayModalOpened(true)}
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
          <Grid gutter="lg" align="flex-start">
            <Grid.Col span={{ base: 12, lg: 8 }}>
              <Stack gap="lg">
                <SaleItems sale={sale} t={t} money={money} number={number} />
                {(sale.message || sale.memo) && (
                  <Paper withBorder radius="lg" p={{ base: 'md', sm: 'lg' }} bg="white">
                    <Title order={3} size="md" mb="md">
                      {t('notesTitle')}
                    </Title>
                    <SimpleGrid
                      cols={{ base: 1, sm: sale.message && sale.memo ? 2 : 1 }}
                      spacing="lg"
                    >
                      {sale.message && (
                        <DetailField label={t('customerMessage')}>{sale.message}</DetailField>
                      )}
                      {sale.memo && (
                        <DetailField label={t('internalMemo')}>{sale.memo}</DetailField>
                      )}
                    </SimpleGrid>
                  </Paper>
                )}
              </Stack>
            </Grid.Col>
            <Grid.Col span={{ base: 12, lg: 4 }}>
              <SaleSidebar sale={sale} t={t} dateTime={dateTime} />
            </Grid.Col>
          </Grid>
        </Stack>
      </Box>
      <PaySaleModal
        opened={payModalOpened}
        sale={sale}
        isSubmitting={payMutation.isPending}
        onClose={() => setPayModalOpened(false)}
        onSubmit={handlePaySubmit}
      />
    </AppShellLayout>
  );
}

export default SaleDetailPage;
