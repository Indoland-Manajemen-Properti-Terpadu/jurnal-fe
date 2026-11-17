import { Badge, Box, Group, Stack, Text } from '@mantine/core';
import { IconChevronRight } from '@tabler/icons-react';
import { Link } from 'react-router-dom';
import { useTranslation } from '@/i18n';
import type { WriteOffReport } from '@/module/assets/domain/writeOff';
import { AssetIllustration } from '@/module/assets/presentation/components/AssetIllustration';
import { formatAssetDate } from '@/module/assets/presentation/components/formatAssetDate';
import classes from '@/module/assets/presentation/components/NeedsYou.module.css';
import { WRITE_OFF_STATUS_COLOR } from '@/module/assets/presentation/components/writeOffStatusMeta';
import { routes } from '@/router/routes';

/** Reports as rows that open the document: type drawing, number, asset, who and when. */
export function NeedsYouReportList({
  reports,
  showStatus,
}: Readonly<{ reports: WriteOffReport[]; showStatus?: boolean }>) {
  const { t } = useTranslation('assetWriteOffs');
  return (
    <Stack gap="xs">
      {reports.map((report) => (
        <Box
          key={report.id}
          component={Link}
          to={routes.assets.writeOffDetail.replace(':id', report.id)}
          className={classes.row}
          td="none"
          c="inherit"
        >
          <Box className={classes.rowArt}>
            <AssetIllustration name={report.type} maxWidth={48} />
          </Box>
          <Box className={classes.rowMain}>
            <Group gap={8} wrap="wrap">
              <Text fw={700} size="sm">
                {report.number}
              </Text>
              <Badge size="sm" radius="sm" variant="light" color="gray">
                {t(`type_${report.type}`)}
              </Badge>
              {showStatus && (
                <Badge
                  size="sm"
                  radius="sm"
                  variant="light"
                  color={WRITE_OFF_STATUS_COLOR[report.status]}
                >
                  {t(`status_${report.status}`)}
                </Badge>
              )}
            </Group>
            <Text size="sm" c="dark.7" truncate>
              {report.snapshot.code} · {report.snapshot.name}
            </Text>
            <Text size="xs" c="dimmed">
              {report.createdBy.name ? `${report.createdBy.name} · ` : ''}
              {t('submittedOn', { date: formatAssetDate(report.submittedAt) })}
            </Text>
          </Box>
          <IconChevronRight size={18} color="var(--mantine-color-gray-5)" />
        </Box>
      ))}
    </Stack>
  );
}

export default NeedsYouReportList;
