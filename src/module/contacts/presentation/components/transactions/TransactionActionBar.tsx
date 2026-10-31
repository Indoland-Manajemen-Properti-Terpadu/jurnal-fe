import { ActionIcon, Button, Group, Paper, Tooltip } from '@mantine/core';
import { IconArrowLeft, IconDownload, IconPlus, IconRefresh } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '@/i18n';
import { routes } from '@/router/routes';

type Props = {
  contactId: string | undefined;
  isRefreshing: boolean;
  isExporting: boolean;
  onRefresh: () => void;
  onExport: () => void;
};

export function TransactionActionBar({
  contactId,
  isRefreshing,
  isExporting,
  onRefresh,
  onExport,
}: Readonly<Props>) {
  const navigate = useNavigate();
  const { t } = useTranslation('contacts');

  return (
    <Paper
      withBorder
      radius="lg"
      p={{ base: 'md', sm: 'lg' }}
      style={{
        background:
          'linear-gradient(135deg, var(--mantine-color-white) 60%, var(--mantine-color-secondary-0) 100%)',
      }}
    >
      <Group justify="space-between" align="center" wrap="wrap" gap="sm">
        <Button
          variant="subtle"
          color="gray"
          leftSection={<IconArrowLeft size={18} />}
          onClick={() =>
            contactId
              ? navigate(routes.contacts.detail.replace(':idAccount', contactId))
              : navigate(routes.contacts.main)
          }
        >
          {t('transactions.back')}
        </Button>

        <Group gap="xs">
          <Tooltip label={t('transactions.refreshTooltip')} withArrow position="top">
            <ActionIcon
              variant="default"
              size="lg"
              radius="md"
              onClick={onRefresh}
              loading={isRefreshing}
              aria-label={t('transactions.refreshAria')}
            >
              <IconRefresh size={18} />
            </ActionIcon>
          </Tooltip>

          <Button
            variant="default"
            leftSection={<IconDownload size={16} />}
            onClick={onExport}
            loading={isExporting}
          >
            {t('transactions.export')}
          </Button>

          <Button
            color="primary"
            leftSection={<IconPlus size={16} />}
            onClick={() => navigate(routes.sales.main)}
          >
            {t('transactions.createInvoice')}
          </Button>
        </Group>
      </Group>
    </Paper>
  );
}
