import { Paper, Stack, Text, ThemeIcon, Group } from '@mantine/core';
import { IconTag, IconUser } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import { formatDateTime } from '@/module/sales/domain/saleFormat';
import type { SaleDocHeader } from '@/module/sales/domain/saleDocument';

const Field = ({ label, value }: Readonly<{ label: string; value?: string }>) =>
  value ? (
    <Stack gap={2}>
      <Text size="xs" c="dimmed">
        {label}
      </Text>
      <Text size="sm" fw={600} style={{ overflowWrap: 'anywhere' }}>
        {value}
      </Text>
    </Stack>
  ) : null;

const CardTitle = ({ icon, title }: Readonly<{ icon: JSX.Element; title: string }>) => (
  <Group gap="sm" wrap="nowrap">
    <ThemeIcon size={36} radius="md" variant="light" color="gray">
      {icon}
    </ThemeIcon>
    <Text fw={700}>{title}</Text>
  </Group>
);

interface DocSideCardsProps {
  ns: 'salesQuotes' | 'salesOrders';
  doc: SaleDocHeader;
  /** Where an order is delivered; a quote has none. */
  deliveryAddress?: string;
  /** What else belongs under the customer: unit, reference. */
  extra?: { label: string; value: string }[];
}

/** Who the document is for, and when it was made and last changed. */
export function DocSideCards({
  ns,
  doc,
  deliveryAddress,
  extra = [],
}: Readonly<DocSideCardsProps>) {
  const { t } = useTranslation(ns);

  return (
    <Stack gap="lg">
      <Paper withBorder radius="lg" p="lg" bg="white">
        <Stack gap="md">
          <CardTitle icon={<IconUser size={18} />} title={t('detail.customerCard')} />
          <Field label={t('detail.customer')} value={doc.customer?.displayName} />
          <Field label={t('detail.email')} value={doc.customer?.emails[0]} />
          <Field label={t('detail.deliveryAddress')} value={deliveryAddress} />
          <Field label={t('detail.paymentTerm')} value={doc.paymentTerm?.name} />
          {extra.map((item) => (
            <Field key={item.label} label={item.label} value={item.value} />
          ))}
        </Stack>
      </Paper>
      <Paper withBorder radius="lg" p="lg" bg="white">
        <Stack gap="md">
          <CardTitle icon={<IconTag size={18} />} title={t('detail.otherInfo')} />
          <Field label={t('detail.createdAt')} value={formatDateTime(doc.createdAt)} />
          <Field label={t('detail.updatedAt')} value={formatDateTime(doc.updatedAt)} />
        </Stack>
      </Paper>
    </Stack>
  );
}
