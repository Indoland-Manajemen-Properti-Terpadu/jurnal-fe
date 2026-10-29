import type { Icon as TablerIcon } from '@tabler/icons-react';
import { Badge } from '@mantine/core';
import {
  IconArrowsExchange,
  IconBuildingBank,
  IconChartBar,
  IconLayersLinked,
  IconScale,
} from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import classes from '../pages/LandingPage.module.css';
import { PreviewBankReconciliationTab } from './PreviewBankReconciliationTab';
import { PreviewDashboardTab } from './PreviewDashboardTab';
import { PreviewSmartJournalTab } from './PreviewSmartJournalTab';
import { PreviewSyncTab } from './PreviewSyncTab';
import type { DecimalPrecision, PreviewTab } from './previewTypes';
import { SectionHead } from './SectionHead';

interface LivePreviewSectionProps {
  activeTab: PreviewTab;
  onTabChange: (tab: PreviewTab) => void;
  decimalPrecision: DecimalPrecision;
  onPrecisionChange: (precision: DecimalPrecision) => void;
  isDemoSynced: boolean;
  onToggleSync: () => void;
}

const PREVIEW_TABS: ReadonlyArray<{
  id: PreviewTab;
  icon: TablerIcon;
  badge?: string;
}> = [
  { id: 'dashboard', icon: IconChartBar },
  { id: 'sync', icon: IconLayersLinked, badge: '3' },
  { id: 'smartJournal', icon: IconScale },
  { id: 'bankReconciliation', icon: IconArrowsExchange },
];

export function LivePreviewSection({
  activeTab,
  onTabChange,
  decimalPrecision,
  onPrecisionChange,
  isDemoSynced,
  onToggleSync,
}: LivePreviewSectionProps) {
  const { t } = useTranslation('landing');

  return (
    <section id="preview" className={classes.previewSection}>
      <div className={classes.container}>
        <SectionHead
          kicker={t('preview.kicker')}
          title={t('preview.title')}
          subtitle={t('preview.subtitle')}
        />

        <div className={classes.previewShell}>
          <div className={classes.windowCard}>
            <div className={classes.windowHeaderBar}>
              <div className={classes.windowDots}>
                <span className={`${classes.windowDot} ${classes.windowDotRed}`} />
                <span className={`${classes.windowDot} ${classes.windowDotYellow}`} />
                <span className={`${classes.windowDot} ${classes.windowDotGreen}`} />
              </div>
              <div className={classes.windowTitle}>
                <span>app.jurnalproapps.com</span>
                <span style={{ color: '#cbd5e1' }}>/</span>
                <span className={classes.windowPill}>
                  <IconBuildingBank size={13} color="var(--lp-navy)" /> {t('preview.company')}
                </span>
              </div>
              <Badge size="sm" variant="light" color="teal">
                {t('preview.connectionStatus')}
              </Badge>
            </div>

            <div className={classes.previewTabsBar}>
              {PREVIEW_TABS.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    className={`${classes.previewTabBtn} ${activeTab === tab.id ? classes.previewTabBtnActive : ''}`}
                    onClick={() => onTabChange(tab.id)}
                  >
                    <Icon size={16} /> {t(`preview.tabs.${tab.id}`)}
                    {tab.badge && (
                      <Badge size="xs" color="blue" circle>
                        {tab.badge}
                      </Badge>
                    )}
                  </button>
                );
              })}
            </div>

            {activeTab === 'dashboard' && <PreviewDashboardTab />}
            {activeTab === 'sync' && (
              <PreviewSyncTab isSynced={isDemoSynced} onToggleSync={onToggleSync} />
            )}
            {activeTab === 'smartJournal' && (
              <PreviewSmartJournalTab
                precision={decimalPrecision}
                onPrecisionChange={onPrecisionChange}
              />
            )}
            {activeTab === 'bankReconciliation' && <PreviewBankReconciliationTab />}
          </div>
        </div>
      </div>
    </section>
  );
}
