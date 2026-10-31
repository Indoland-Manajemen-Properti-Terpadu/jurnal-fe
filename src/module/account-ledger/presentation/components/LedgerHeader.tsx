import { Badge, Button, Group, Stack, Text } from '@mantine/core';
import {
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
import type { DetailAccountModel } from '@/module/chart-of-accounts';
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
      {account.isArchived && (
        <Badge variant="filled" color="gray" size={isCashBank ? undefined : 'sm'} radius="sm">
          {t('common.archivedBadge')}
        </Badge>
      )}
      {account.isLocked && (
        <Badge
          variant="light"
          color={isCashBank ? 'blue' : 'orange'}
          size={isCashBank ? undefined : 'sm'}
          radius="sm"
          leftSection={<IconLock size={12} />}
        >
          {t(`${variant}.lockedBadge`)}
        </Badge>
      )}
    </>
  );

  const description = (
    <Stack gap={6}>
      <Group gap="xs" wrap="wrap" align="center">
        <Badge variant="outline" color="primary" radius="sm" ff="monospace" fw={700}>
          {account.accountNumber}
        </Badge>
        {isCashBank ? (
          <>
            <Badge variant="light" color="teal" radius="sm">
              {t('cashBank.typeBadge')}
            </Badge>
            {categoryName && categoryName !== GENERIC_CATEGORY && (
              <Badge variant="light" color="gray" radius="sm">
                {categoryName}
              </Badge>
            )}
          </>
        ) : (
          <Text size="xs" c="dimmed">
            {t('nonCashBank.categoryLine', {
              category: categoryName || t('nonCashBank.categoryFallback'),
              side: t(`common.side.${normalBalance}`),
            })}
          </Text>
        )}
        {statusBadges}
      </Group>
      <Text size="sm" c="dimmed" mt={2}>
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
            size="sm"
            leftSection={<IconArrowLeft size={16} />}
            onClick={() => navigate(routes.chartOfAccounts.main)}
          >
            {t('common.back')}
          </Button>

          <Button
            variant="light"
            size="sm"
            color="primary"
            leftSection={<IconPencil size={16} />}
            onClick={() =>
              navigate(routes.chartOfAccounts.edit.replace(':idAccount', idAccount))
            }
          >
            {t('common.editAccount')}
          </Button>

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
