import React from 'react';
import { Divider, Group, Paper, Stack, Text } from '@mantine/core';
import { isDebitNormal } from '@/lib/accounting/normalBalance';
import { useTranslation } from '@/i18n';
import { accountHasAccessChoice } from '../../domain/accountRules';

interface AccountPreviewCardProps {
  accountNumber: string;
  accountName: string;
  categoryName: string;
  isDebit?: boolean;
  isContra: boolean;
  isBankAndCash?: boolean;
  accountType: 'SingleAccount' | 'SubAccount' | 'HeaderAccount' | string;
  parentAccountLabel?: string;
  childAccountLabel?: string;
  taxType?: string;
  desc?: string;
  accessType: string;
  specialUsersCount: number;
  certainRolesCount: number;
}

const LABEL_WIDTH = 104;

interface PreviewRowProps {
  label: string;
  children: React.ReactNode;
}

/** One label and value line; the labels share a column so the values line up. */
const PreviewRow = ({ label, children }: PreviewRowProps) => (
  <Group gap="sm" wrap="nowrap" align="flex-start">
    <Text fz="var(--jurnal-text-xs)" c="dimmed" w={LABEL_WIDTH} style={{ flexShrink: 0 }} pt={2}>
      {label}
    </Text>
    <div style={{ minWidth: 0, flex: 1 }}>{children}</div>
  </Group>
);

const Value = ({ children, muted }: { children: React.ReactNode; muted?: boolean }) => (
  <Text
    fz="var(--jurnal-text-sm)"
    fw={500}
    c={muted ? 'dimmed' : 'dark.8'}
    style={{ wordBreak: 'break-word' }}
  >
    {children}
  </Text>
);

export const AccountPreviewCard: React.FC<AccountPreviewCardProps> = ({
  accountNumber,
  accountName,
  categoryName,
  isDebit = true,
  isContra,
  isBankAndCash = false,
  accountType,
  parentAccountLabel,
  childAccountLabel,
  taxType,
  desc,
  accessType,
  specialUsersCount,
  certainRolesCount,
}) => {
  const { t } = useTranslation('chartOfAccounts');

  const effectiveDebit = isDebitNormal({ isDebit, isContra });

  let typeLabel = t('form.typeSingleTitle');
  if (accountType === 'SubAccount') typeLabel = t('form.typeSubTitle');
  else if (accountType === 'HeaderAccount') typeLabel = t('form.typeHeaderTitle');

  let accessLabel = t('form.accessAllTitle');
  if (accountHasAccessChoice(accountType)) {
    if (accessType === 'SpecialUsers') {
      accessLabel = `${specialUsersCount} ${t('form.accessUsersTitle')}`;
    } else if (accessType === 'CertainRoles') {
      accessLabel = `${certainRolesCount} ${t('form.accessRolesTitle')}`;
    }
  }

  const impact = [
    {
      label: t('form.whenDebited'),
      text: effectiveDebit ? t('form.balanceIncreases') : t('form.balanceDecreases'),
      increases: effectiveDebit,
    },
    {
      label: t('form.whenCredited'),
      text: effectiveDebit ? t('form.balanceDecreases') : t('form.balanceIncreases'),
      increases: !effectiveDebit,
    },
  ];

  return (
    <Paper withBorder radius="md" p="md" bg="white" shadow="none">
      <Text fw={700} fz="var(--jurnal-text-sm)" c="dark.8">
        {t('form.previewTitle')}
      </Text>
      <Text fz="var(--jurnal-text-xs)" c="dimmed">
        {t('form.previewSubtitle')}
      </Text>

      <Divider my="sm" />

      <Stack gap="xs">
        <PreviewRow label={t('form.previewCode')}>
          <Text
            fz="var(--jurnal-text-sm)"
            fw={700}
            c={accountNumber ? 'primary.9' : 'dimmed'}
            style={{ fontVariantNumeric: 'tabular-nums' }}
          >
            {accountNumber || '—'}
          </Text>
        </PreviewRow>

        <PreviewRow label={t('form.previewName')}>
          <Value muted={!accountName}>{accountName || t('form.previewUnnamed')}</Value>
        </PreviewRow>

        <PreviewRow label={t('form.accountCategory')}>
          <Value muted={!categoryName}>{categoryName || t('form.previewUncategorized')}</Value>
        </PreviewRow>

        <PreviewRow label={t('form.previewType')}>
          <Value>
            {typeLabel}
            {isBankAndCash ? ` · ${t('form.previewCashBank')}` : ''}
          </Value>
        </PreviewRow>

        {accountType === 'SubAccount' && parentAccountLabel && (
          <PreviewRow label={t('form.parentAccount')}>
            <Value>{parentAccountLabel}</Value>
          </PreviewRow>
        )}

        {accountType === 'HeaderAccount' && childAccountLabel && (
          <PreviewRow label={t('form.subAccount')}>
            <Value>{childAccountLabel}</Value>
          </PreviewRow>
        )}

        <PreviewRow label={t('form.previewNormalBalance')}>
          <Group gap={6} wrap="nowrap">
            <Value>{effectiveDebit ? t('form.normalDebit') : t('form.normalCredit')}</Value>
            {isContra && (
              <Text fz="var(--jurnal-text-xs)" c="dimmed">
                ({t('form.previewContra')})
              </Text>
            )}
          </Group>
        </PreviewRow>

        <PreviewRow label={t('form.previewAccess')}>
          <Value>{accessLabel}</Value>
        </PreviewRow>

        {taxType && (
          <PreviewRow label={t('form.previewTax')}>
            <Value>{taxType}</Value>
          </PreviewRow>
        )}

        {desc && (
          <PreviewRow label={t('form.previewDesc')}>
            <Text fz="var(--jurnal-text-xs)" c="dimmed" lineClamp={3}>
              {desc}
            </Text>
          </PreviewRow>
        )}
      </Stack>

      <Divider my="sm" />

      <Text fz="var(--jurnal-text-xs)" fw={700} c="dimmed" tt="uppercase" lts={0.4} mb="xs">
        {t('form.behaviorSimulationTitle')}
      </Text>
      <Stack gap={6}>
        {impact.map((row) => (
          <Group key={row.label} justify="space-between" wrap="nowrap" gap="sm">
            <Text fz="var(--jurnal-text-sm)" c="dark.7">
              {row.label}
            </Text>
            <Text fz="var(--jurnal-text-sm)" fw={600} c={row.increases ? 'primary.7' : 'dimmed'}>
              {row.text}
            </Text>
          </Group>
        ))}
      </Stack>
    </Paper>
  );
};
