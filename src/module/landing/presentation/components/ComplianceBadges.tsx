import type { Icon as TablerIcon } from '@tabler/icons-react';
import { Group, Text, ThemeIcon } from '@mantine/core';
import { IconClock, IconFileCertificate, IconScale, IconShieldCheck } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';

const COMPLIANCE_BADGES: ReadonlyArray<{
  id: string;
  color: string;
  icon: TablerIcon;
}> = [
  { id: 'iso', color: 'blue', icon: IconFileCertificate },
  { id: 'encryption', color: 'teal', icon: IconShieldCheck },
  { id: 'compliance', color: 'indigo', icon: IconScale },
  { id: 'uptime', color: 'orange', icon: IconClock },
];

export function ComplianceBadges() {
  const { t } = useTranslation('landing');

  return (
    <div
      style={{
        marginTop: 48,
        padding: '24px 32px',
        borderRadius: 16,
        border: '1px solid var(--lp-line)',
        background: '#f8fafc',
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 20,
      }}
    >
      {COMPLIANCE_BADGES.map((badge) => {
        const Icon = badge.icon;
        return (
          <Group key={badge.id} gap="xs">
            <ThemeIcon size="md" color={badge.color} radius="xl" variant="light">
              <Icon size={18} />
            </ThemeIcon>
            <div>
              <Text fw={750} fz="xs">
                {t(`testimonials.badges.${badge.id}.title`)}
              </Text>
              <Text fz={11} c="dimmed">
                {t(`testimonials.badges.${badge.id}.desc`)}
              </Text>
            </div>
          </Group>
        );
      })}
    </div>
  );
}
