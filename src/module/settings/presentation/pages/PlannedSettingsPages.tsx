import { PlannedModuleBody } from '@/components/PlannedModule';
import { useTranslation } from '@/i18n';
import SettingsLayout from '../components/SettingsLayout';

interface PlannedSettingsPageProps {
  /** Key of the page under `item` and `description` in the settings translations. */
  itemKey: string;
  /** Key under `plannedModules.modules`. */
  moduleKey: string;
}

/** A settings page whose menu exists but whose features are not open yet. */
function PlannedSettingsPage({ itemKey, moduleKey }: Readonly<PlannedSettingsPageProps>) {
  const { t } = useTranslation('settings');

  return (
    <SettingsLayout title={t(`item.${itemKey}`)} description={t(`description.${itemKey}`)}>
      <PlannedModuleBody moduleKey={moduleKey} />
    </SettingsLayout>
  );
}

export const SitesPage = () => <PlannedSettingsPage itemKey="sites" moduleKey="sites" />;

export const ApprovalFlowPage = () => (
  <PlannedSettingsPage itemKey="approvalFlow" moduleKey="approvalFlow" />
);
