import { Badge, Button, Group, Stack, Text } from '@mantine/core';
import {
  IconArchive,
  IconArrowLeft,
  IconBuildingBank,
  IconLock,
  IconNotebook,
  IconPencil,
} from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '@/i18n';
import { routes } from '@/router/routes';
import { ModuleHeader } from '@/components/ModuleHeader/ModuleHeader';
import { canEditAccount, type DetailAccountModel } from '@/module/chart-of-accounts';
import type { LedgerVariant } from '../../domain/ledgerVariant';
import type { NormalSide } from '../../domain/normalBalance';
import { LedgerAccountMenu } from './LedgerAccountMenu';
import { LedgerCreateActions } from './LedgerCreateActions';

const GENERIC_CATEGORY = 'Kas & Bank';

interface LedgerHeaderProps {
  variant: LedgerVariant;
  idAccount: string;
  account: DetailAccountModel;
  normalBalance: NormalSide;
  isArchiving: boolean;
  onArchive: () => void;
  onDelete: () => void;
}

export const LedgerHeader: React.FC<LedgerHeaderProps> = ({
  variant,
  idAccount,
  account,
  normalBalance,
  isArchiving,
  onArchive,
  onDelete,
}) => {
  const { t } = useTranslation('accountLedger');
  const navigate = useNavigate();
  const isCashBank = variant === 'cashBank';
  const categoryName = account.category?.name;

  const statusBadges = (
    <>
      {account.isLocked && (
        <Badge variant="light" color="gray" radius="sm" leftSection={<IconLock size={12} />}>
          {t(`${variant}.lockedBadge`)}
        </Badge>
      )}
      {account.isArchived && (
        <Badge variant="light" color="gray" radius="sm" leftSection={<IconArchive size={12} />}>
          {t('common.archivedBadge')}
        </Badge>
      )}
    </>
  );

  const metaParts = isCashBank
    ? [
        t('cashBank.typeBadge'),
        categoryName && categoryName !== GENERIC_CATEGORY ? categoryName : null,
      ].filter((part): part is string => Boolean(part))
    : [
        categoryName || t('nonCashBank.categoryFallback'),
        t('nonCashBank.sideLine', { side: t(`common.side.${normalBalance}`) }),
        account.headerAccount
          ? t('nonCashBank.parentLine', {
              parent:
                `${account.headerAccount.accountNumber ?? ''} ${account.headerAccount.name ?? ''}`.trim(),
            })
          : null,
      ].filter((part): part is string => Boolean(part));

  const description = (
    <Stack gap={6}>
      <Group gap="xs" wrap="wrap" align="center">
        <Text
          fz="var(--jurnal-text-sm)"
          fw={700}
          c="dark.8"
          style={{ fontVariantNumeric: 'tabular-nums' }}
        >
          {account.accountNumber}
        </Text>
        {metaParts.map((part) => (
          <Group key={part} gap={6} wrap="nowrap">
            <Text fz="var(--jurnal-text-sm)" c="dimmed" aria-hidden>
              ·
            </Text>
            <Text fz="var(--jurnal-text-sm)" c="dimmed">
              {part}
            </Text>
          </Group>
        ))}
        {statusBadges}
      </Group>
      <Text size="sm" c="dimmed">
        {account.description || t(`${variant}.defaultDescription`)}
      </Text>
    </Stack>
  );

  const breadcrumbSection = isCashBank
    ? t('cashBank.breadcrumbSection')
    : categoryName || t('nonCashBank.breadcrumbFallback');

  return (
    <ModuleHeader
      icon={isCashBank ? IconBuildingBank : IconNotebook}
      title={account.name || t(`${variant}.headerFallbackTitle`)}
      description={description}
      breadcrumbs={[
        { label: t('common.breadcrumbRoot'), to: routes.chartOfAccounts.main },
        { label: breadcrumbSection, to: routes.chartOfAccounts.main },
        { label: `${account.name} (${account.accountNumber})` },
      ]}
      actions={
        <Group gap="xs" wrap="wrap">
          <Button
            variant="default"
            size="md"
            leftSection={<IconArrowLeft size={16} />}
            onClick={() => navigate(routes.chartOfAccounts.main)}
          >
            {t('common.back')}
          </Button>

          {canEditAccount(account) && (
            <Button
              variant="default"
              size="md"
              leftSection={<IconPencil size={16} />}
              onClick={() => navigate(routes.chartOfAccounts.edit.replace(':idAccount', idAccount))}
            >
              {t('common.editAccount')}
            </Button>
          )}

          <LedgerAccountMenu
            account={account}
            isArchiving={isArchiving}
            onArchive={onArchive}
            onDelete={onDelete}
          />
          <LedgerCreateActions variant={variant} />
        </Group>
      }
    />
  );
};
