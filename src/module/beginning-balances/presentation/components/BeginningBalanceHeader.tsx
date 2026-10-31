import React from 'react';
import { Badge, Button, Group, Stack, Text } from '@mantine/core';
import {
  IconArrowLeft,
  IconCheck,
  IconDeviceFloppy,
  IconHistory,
  IconRotate,
  IconScale,
} from '@tabler/icons-react';
import { ModuleHeader } from '@/components/ModuleHeader/ModuleHeader';
import { routes } from '@/router/routes';
import { useTranslation } from '@/i18n';
import { formatCurrency } from '@/utils/formatCurrency';
import { dateFormatV1 } from '@/utils/formatDate';
import type { BalanceState } from '../../domain/beginningBalance';

type Props = {
  statusLabel: string;
  statusColor: string;
  isPublished: boolean;
  selectedDate: string | null;
  balanceState: BalanceState;
  difference: number;
  isSavingDraft: boolean;
  isPublishing: boolean;
  onBack: () => void;
  onOpenLogs: () => void;
  onOpenReset: () => void;
  onSaveDraft: () => void;
  onPublish: () => void;
};

const BADGE_COLOR: Record<BalanceState, string> = {
  balanced: 'teal',
  empty: 'gray',
  unbalanced: 'orange',
};

const BeginningBalanceHeader: React.FC<Props> = ({
  statusLabel,
  statusColor,
  isPublished,
  selectedDate,
  balanceState,
  difference,
  isSavingDraft,
  isPublishing,
  onBack,
  onOpenLogs,
  onOpenReset,
  onSaveDraft,
  onPublish,
}) => {
  const { t } = useTranslation('beginningBalances');

  const balanceLabel = {
    balanced: t('header.balanced'),
    empty: t('header.empty'),
    unbalanced: t('header.difference', { amount: formatCurrency(difference) }),
  }[balanceState];

  return (
    <ModuleHeader
      icon={IconScale}
      title={t('page.title')}
      description={
        <Stack gap={6}>
          <Group gap="xs" wrap="wrap" align="center">
            <Badge variant="filled" color={statusColor} radius="sm">
              {t('status.badge', { status: statusLabel })}
            </Badge>
            <Badge variant="light" color="indigo" radius="sm">
              {t('header.conversionDate', { date: dateFormatV1(selectedDate || new Date()) })}
            </Badge>
            <Badge variant="light" color={BADGE_COLOR[balanceState]} radius="sm">
              {balanceLabel}
            </Badge>
          </Group>
          <Text size="sm" c="dimmed" mt={2}>
            {t('page.subtitle')}
          </Text>
        </Stack>
      }
      breadcrumbs={[
        { label: t('page.generalLedger'), to: routes.generalJournal.main },
        { label: t('page.chartOfAccounts'), to: routes.generalJournal.main },
        { label: t('page.title') },
      ]}
      actions={
        <Group gap="xs" wrap="wrap">
          <Button
            variant="default"
            size="sm"
            leftSection={<IconArrowLeft size={16} />}
            onClick={onBack}
          >
            {t('page.back')}
          </Button>
          <Button
            variant="default"
            size="sm"
            leftSection={<IconHistory size={16} />}
            onClick={onOpenLogs}
          >
            {t('page.changeHistory')}
          </Button>
          <Button
            variant="subtle"
            color="gray"
            size="sm"
            leftSection={<IconRotate size={16} />}
            onClick={onOpenReset}
          >
            {t('page.resetBalance')}
          </Button>
          <Button
            variant="light"
            color="primary"
            size="sm"
            leftSection={<IconDeviceFloppy size={16} />}
            onClick={onSaveDraft}
            loading={isSavingDraft}
          >
            {t('page.saveDraft')}
          </Button>
          <Button
            variant="gradient"
            gradient={{ from: 'primary.6', to: 'secondary.6', deg: 135 }}
            size="sm"
            leftSection={<IconCheck size={16} />}
            onClick={onPublish}
            loading={isPublishing}
          >
            {isPublished ? t('page.updateAndPublish') : t('page.publish')}
          </Button>
        </Group>
      }
    />
  );
};

export default BeginningBalanceHeader;
