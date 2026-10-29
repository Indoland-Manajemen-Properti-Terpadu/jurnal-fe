import { Group, ThemeIcon } from '@mantine/core';
import { IconCheck, IconReceipt, IconX } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import classes from '../pages/LandingPage.module.css';
import { SectionHead } from './SectionHead';

const COMPARISON_ROW_IDS = [
  'integration',
  'approvalQueue',
  'inputErrors',
  'decimals',
  'language',
  'closing',
] as const;

export function ComparisonSection() {
  const { t } = useTranslation('landing');

  return (
    <section id="comparison" className={classes.section}>
      <div className={classes.container}>
        <SectionHead
          kicker={t('comparison.kicker')}
          title={t('comparison.title')}
          subtitle={t('comparison.subtitle')}
        />

        <div className={classes.comparisonTableWrapper}>
          <table className={classes.comparisonTable}>
            <thead>
              <tr>
                <th style={{ width: '32%' }}>{t('comparison.colFeature')}</th>
                <th className={classes.comparisonColHighlightHead} style={{ width: '38%' }}>
                  <Group gap="xs">
                    <span
                      className={classes.brandMark}
                      style={{ width: 28, height: 28, borderRadius: 6 }}
                    >
                      <IconReceipt size={16} stroke={2} />
                    </span>
                    <div>
                      <div style={{ color: 'var(--lp-navy)', fontWeight: 800 }}>
                        {t('comparison.brandTitle')}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--lp-sky)', fontWeight: 600 }}>
                        {t('comparison.brandTagline')}
                      </div>
                    </div>
                  </Group>
                </th>
                <th style={{ width: '30%', color: '#64748b' }}>{t('comparison.colCompetitors')}</th>
              </tr>
            </thead>
            <tbody>
              {COMPARISON_ROW_IDS.map((id) => (
                <tr key={id}>
                  <td>
                    <div className={classes.comparisonFeatureTitle}>
                      {t(`comparison.rows.${id}.feature`)}
                    </div>
                    <div className={classes.comparisonFeatureDesc}>
                      {t(`comparison.rows.${id}.desc`)}
                    </div>
                  </td>
                  <td className={classes.comparisonColHighlight}>
                    <div className={classes.comparisonStatusPro}>
                      <ThemeIcon
                        color="teal"
                        size="sm"
                        radius="xl"
                        variant="filled"
                        style={{ flexShrink: 0, marginTop: 2 }}
                      >
                        <IconCheck size={14} stroke={3} />
                      </ThemeIcon>
                      <span>{t(`comparison.rows.${id}.proApps`)}</span>
                    </div>
                  </td>
                  <td>
                    <div className={classes.comparisonStatusGeneric}>
                      <ThemeIcon
                        color="gray"
                        size="sm"
                        radius="xl"
                        variant="light"
                        style={{ flexShrink: 0, marginTop: 2 }}
                      >
                        <IconX size={14} stroke={2.5} />
                      </ThemeIcon>
                      <span>{t(`comparison.rows.${id}.competitors`)}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
