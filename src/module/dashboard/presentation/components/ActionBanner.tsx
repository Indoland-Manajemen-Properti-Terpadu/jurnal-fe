import { Box, Group, Text, ThemeIcon, UnstyledButton } from '@mantine/core';
import { IconAlertCircle, IconArrowRight, IconCircleCheck } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import { formatIDR } from './dashboardFormat';

/* ---------- Actionable Alert / Reassurance Banner ---------- */

export function ActionBanner({
  overdueCount,
  overdueAmount,
  draftCount,
  pendingCount,
  onViewOverdue,
  onViewDrafts,
  onViewPending,
}: Readonly<{
  overdueCount: number;
  overdueAmount: number;
  draftCount: number;
  pendingCount: number;
  onViewOverdue?: () => void;
  onViewDrafts?: () => void;
  onViewPending?: () => void;
}>) {
  const { t } = useTranslation('dashboard');
  const hasAlerts = overdueCount > 0 || draftCount > 0 || pendingCount > 0;

  if (!hasAlerts) {
    return (
      <Box
        px="md"
        py={10}
        style={{
          borderRadius: 12,
          background: '#f0fdfa',
          border: '1px solid #ccfbf1',
        }}
      >
        <Group gap="sm" wrap="nowrap">
          <ThemeIcon size={28} radius="md" color="teal" variant="filled">
            <IconCircleCheck size={17} />
          </ThemeIcon>
          <Group gap="xs" wrap="wrap">
            <Text fw={700} size="xs" c="teal.9">
              {t('healthyBannerTitle')}:
            </Text>
            <Text size="xs" c="dark.6">
              {t('healthyBannerDesc')}
            </Text>
          </Group>
        </Group>
      </Box>
    );
  }

  return (
    <Box
      p="sm"
      style={{
        borderRadius: 12,
        background: '#fffbeb',
        border: '1px solid #fde68a',
      }}
    >
      <Group justify="space-between" align="center" wrap="wrap" gap="sm">
        <Group gap="sm" wrap="nowrap">
          <ThemeIcon
            size={34}
            radius="md"
            color={overdueCount > 0 ? 'red' : 'orange'}
            variant="filled"
          >
            <IconAlertCircle size={20} />
          </ThemeIcon>
          <Box>
            <Text fw={700} size="sm" c="dark.9">
              {overdueCount > 0
                ? t('alertTitleOverdue', { count: overdueCount })
                : t('alertTitlePending')}
            </Text>
            <Text size="xs" c="dark.6">
              {overdueCount > 0 && (
                <Text span fw={700} c="red.8">
                  {t('alertOverdueAmount', { amount: formatIDR(overdueAmount) })}
                </Text>
              )}
              {overdueCount > 0 && draftCount > 0 && ' · '}
              {draftCount > 0 && t('alertDraftCount', { count: draftCount })}
              {(overdueCount > 0 || draftCount > 0) && pendingCount > 0 && ' · '}
              {pendingCount > 0 && t('alertPendingCount', { count: pendingCount })}
            </Text>
          </Box>
        </Group>

        <Group gap="xs">
          {overdueCount > 0 && (
            <UnstyledButton
              onClick={onViewOverdue}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                padding: '6px 12px',
                borderRadius: 8,
                backgroundColor: 'rgba(239, 68, 68, 0.16)',
                color: 'var(--mantine-color-red-9)',
                fontSize: 12,
                fontWeight: 700,
              }}
            >
              {t('alertBtnOverdue')} <IconArrowRight size={12} />
            </UnstyledButton>
          )}
          {draftCount > 0 && (
            <UnstyledButton
              onClick={onViewDrafts}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                padding: '6px 12px',
                borderRadius: 8,
                backgroundColor: 'rgba(14, 165, 233, 0.16)',
                color: 'var(--mantine-color-blue-9)',
                fontSize: 12,
                fontWeight: 700,
              }}
            >
              {t('alertBtnDraft')} <IconArrowRight size={12} />
            </UnstyledButton>
          )}
          {pendingCount > 0 && (
            <UnstyledButton
              onClick={onViewPending}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                padding: '6px 12px',
                borderRadius: 8,
                backgroundColor: 'rgba(245, 158, 11, 0.22)',
                color: 'var(--mantine-color-orange-9)',
                fontSize: 12,
                fontWeight: 700,
              }}
            >
              {t('alertBtnPending')} <IconArrowRight size={12} />
            </UnstyledButton>
          )}
        </Group>
      </Group>
    </Box>
  );
}
