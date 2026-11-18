import { Text } from '@mantine/core';
import { IconFileCertificate, IconSend } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import type { WriteOffReport } from '@/module/assets/domain/writeOff';
import { timeAgo } from '@/module/assets/presentation/components/formatAssetDate';
import classes from '@/module/assets/presentation/components/WorkList.module.css';
import { WorkRow } from '@/module/assets/presentation/components/WorkRow';
import { routes } from '@/router/routes';

/**
 * Reports as rows of the work list: number and asset first, then the type and who it waits on,
 * and how long ago it was filed. A row opens the report.
 */
export function NeedsYouReportList({
  reports,
  own,
}: Readonly<{ reports: WriteOffReport[]; own?: boolean }>) {
  const { t } = useTranslation('assetWriteOffs');
  const ago = (iso: string) => {
    const { key, count } = timeAgo(iso);
    return t(key, { count });
  };
  return (
    <div className={classes.list}>
      {reports.map((report) => (
        <WorkRow
          key={report.id}
          icon={own ? IconSend : IconFileCertificate}
          title={report.number}
          titleSuffix={report.snapshot.name}
          subtitle={
            own
              ? `${t(`type_${report.type}`)} · ${t('journeyWaiting', {
                  roles: report.waitingOnRoles.join(', ') || t('roleApprover'),
                })}`
              : `${t(`type_${report.type}`)} · ${t('submittedBy', {
                  name: report.createdBy.name || '—',
                })}`
          }
          side={
            <Text size="xs" c="dimmed" className={classes.amount}>
              {ago(report.submittedAt)}
            </Text>
          }
          to={routes.assets.writeOffDetail.replace(':id', report.id)}
        />
      ))}
    </div>
  );
}

export default NeedsYouReportList;
