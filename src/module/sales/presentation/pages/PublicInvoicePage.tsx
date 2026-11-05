import {
  Box,
  Button,
  Container,
  Group,
  Skeleton,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from '@mantine/core';
import { IconAlertCircle, IconPrinter, IconReceiptOff } from '@tabler/icons-react';
import { useParams } from 'react-router-dom';
import { useTranslation } from '@/i18n';
import classes from '../components/public/PublicInvoice.module.css';
import { PublicInvoiceView } from '../components/public/PublicInvoiceView';
import { classifySaleError } from '../../infrastructure/saleErrors';
import { usePublicInvoice } from '../hooks/useSaleQueries';

const Notice = ({
  title,
  description,
  action,
  tone,
}: Readonly<{
  title: string;
  description: string;
  action?: { label: string; onClick: () => void };
  tone: 'missing' | 'error';
}>) => (
  <Stack align="center" gap="sm" py={64} ta="center">
    <ThemeIcon size={64} radius="xl" variant="light" color="primary">
      {tone === 'missing' ? <IconReceiptOff size={32} /> : <IconAlertCircle size={32} />}
    </ThemeIcon>
    <Title order={3}>{title}</Title>
    <Text c="dimmed" maw={420}>
      {description}
    </Text>
    {action && (
      <Button variant="default" onClick={action.onClick}>
        {action.label}
      </Button>
    )}
  </Stack>
);

/** The page behind the link in the invoice email. No sign-in, no app shell. */
export function PublicInvoicePage() {
  const { token } = useParams<{ token: string }>();
  const { t } = useTranslation('sales');
  const query = usePublicInvoice(token);

  let content;
  if (query.isLoading) {
    content = (
      <Stack gap="md" aria-busy="true" aria-label={t('public.loadingAria')}>
        <Skeleton height={80} radius="lg" />
        <Skeleton height={260} radius="lg" />
      </Stack>
    );
  } else if (query.isError || !query.data) {
    // A truncated or mangled token can come back as a refusal rather than a 404; to the reader
    // it is the same thing: this link does not lead to an invoice.
    const missing = ['notFound', 'domain', 'validation'].includes(
      classifySaleError(query.error).kind
    );
    content = missing ? (
      <Notice
        tone="missing"
        title={t('public.notFoundTitle')}
        description={t('public.notFoundDescription')}
      />
    ) : (
      <Notice
        tone="error"
        title={t('public.errorTitle')}
        description={t('public.errorDescription')}
        action={{ label: t('public.retry'), onClick: () => query.refetch() }}
      />
    );
  } else {
    content = (
      <Stack gap="md">
        <Group justify="flex-end" className={classes.noPrint}>
          <Button
            variant="default"
            leftSection={<IconPrinter size={16} />}
            onClick={() => window.print()}
          >
            {t('public.print')}
          </Button>
        </Group>
        <PublicInvoiceView sale={query.data} />
      </Stack>
    );
  }

  return (
    <Box bg="gray.0" mih="100vh" py={{ base: 'md', sm: 'xl' }}>
      <Container size="md">{content}</Container>
    </Box>
  );
}

export default PublicInvoicePage;
