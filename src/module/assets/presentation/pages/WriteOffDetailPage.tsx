import { useState } from 'react';
import { Badge, Box, Button, Grid, Group, Paper, Skeleton, Stack, Text } from '@mantine/core';
import { IconArrowLeft, IconDownload, IconFileCertificate, IconX } from '@tabler/icons-react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { ModuleHeader } from '@/components/ModuleHeader/ModuleHeader';
import { useTranslation } from '@/i18n';
import type { WriteOffReport } from '@/module/assets/domain/writeOff';
import { documentTitleKey } from '@/module/assets/domain/writeOffRules';
import { AssetIllustration } from '@/module/assets/presentation/components/AssetIllustration';
import { WriteOffDetailAside } from '@/module/assets/presentation/components/WriteOffDetailAside';
import {
  WriteOffSheet,
  type WriteOffSheetModel,
} from '@/module/assets/presentation/components/WriteOffSheet';
import { WriteOffStateCard } from '@/module/assets/presentation/components/WriteOffStateCard';
import {
  useDownloadWriteOffPdf,
  useWriteOff,
} from '@/module/assets/presentation/hooks/useWriteOffQueries';
import { WRITE_OFF_STATUS_COLOR } from '@/module/assets/presentation/components/writeOffStatusMeta';
import { routes } from '@/router/routes';

const sheetModel = (report: WriteOffReport): WriteOffSheetModel => {
  const figures = report.result
    ? {
        bookValue: report.result.bookValue,
        catchUp: 0,
        received: report.proceedsAmount,
        gainLoss: report.result.gainLoss,
        estimate: false,
      }
    : {
        bookValue: report.snapshot.bookValue,
        catchUp: 0,
        received: report.proceedsAmount,
        gainLoss: report.snapshot.estimatedGainLoss,
        // Only a waiting report will still be recalculated; a rejected one keeps its estimate.
        estimate: report.status === 'PENDING_APPROVAL',
      };
  return {
    titleKey: documentTitleKey(report.type),
    number: report.number,
    status: report.status,
    snapshot: report.snapshot,
    incidentDate: report.incidentDate,
    description: report.description,
    figures,
    attachments: report.attachments.map((file) => ({
      name: file.fileName,
      url: file.url || null,
      isImage: file.mimeType.startsWith('image/'),
    })),
    signatures: report.signatures,
  };
};

/** One write-off report, read like the printed document. The router wraps it in `AppShellLayout`. */
export function WriteOffDetailPage() {
  const { t } = useTranslation('assetWriteOffs');
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const report = useWriteOff(id);
  const download = useDownloadWriteOffPdf();
  const [welcome, setWelcome] = useState(
    Boolean((location.state as { justSubmitted?: boolean } | null)?.justSubmitted)
  );

  // A report opened from a shared link has no page to go back to; the hub is the natural home.
  const back = () => (location.key === 'default' ? navigate(routes.assets.needsYou) : navigate(-1));
  const { data } = report;

  const renderBody = () => {
    if (report.isLoading) {
      return (
        <Grid gutter="lg">
          <Grid.Col span={{ base: 12, lg: 8 }}>
            <Skeleton h={620} radius="md" />
          </Grid.Col>
          <Grid.Col span={{ base: 12, lg: 4 }}>
            <Skeleton h={220} radius="lg" />
          </Grid.Col>
        </Grid>
      );
    }
    if (!data) {
      return (
        <WriteOffStateCard
          illustration="lost"
          title={t('reportNotFoundTitle')}
          body={t('reportNotFoundBody')}
          action={
            <Button component={Link} to={routes.assets.needsYou} variant="default" radius="md">
              {t('needsYouTitle')}
            </Button>
          }
        />
      );
    }
    return (
      <Stack gap="lg">
        {welcome && data.status === 'PENDING_APPROVAL' && (
          <Paper withBorder radius="lg" p="md" bg="primary.0">
            <Group wrap="nowrap" gap="md">
              <Box w={88} visibleFrom="xs">
                <AssetIllustration name="submitted" maxWidth={88} />
              </Box>
              <Box flex={1}>
                <Text fw={700}>{t('submittedTitle')}</Text>
                <Text size="sm" c="dimmed">
                  {t('submittedBody', {
                    number: data.number,
                    roles: data.waitingOnRoles.join(', ') || t('roleApprover'),
                  })}
                </Text>
              </Box>
              <Button
                variant="subtle"
                color="gray"
                size="compact-sm"
                aria-label={t('cancel')}
                onClick={() => setWelcome(false)}
              >
                <IconX size={16} />
              </Button>
            </Group>
          </Paper>
        )}
        <Grid gutter="lg" align="flex-start">
          {/* On a phone the journey and the decision come first; the document follows. */}
          <Grid.Col span={{ base: 12, lg: 8 }} order={{ base: 2, lg: 1 }}>
            <Box maw={760} mx="auto">
              <WriteOffSheet model={sheetModel(data)} />
            </Box>
          </Grid.Col>
          <Grid.Col span={{ base: 12, lg: 4 }} order={{ base: 1, lg: 2 }}>
            <WriteOffDetailAside report={data} />
          </Grid.Col>
        </Grid>
      </Stack>
    );
  };

  return (
    <Box p={{ base: 'md', sm: 'xl' }}>
      <Stack gap="lg">
        <ModuleHeader
          icon={IconFileCertificate}
          title={
            data ? (
              <Group gap="sm" wrap="wrap">
                <span>{data.number}</span>
                <Badge color={WRITE_OFF_STATUS_COLOR[data.status]} variant="light" radius="sm">
                  {t(`status_${data.status}`)}
                </Badge>
              </Group>
            ) : (
              t('docTitleDraft')
            )
          }
          description={
            data
              ? `${t(documentTitleKey(data.type))} · ${t('detailSubtitle', {
                  code: data.snapshot.code,
                  name: data.snapshot.name,
                })}`
              : ''
          }
          actions={
            <Group gap="sm">
              <Button
                variant="default"
                size="md"
                radius="md"
                leftSection={<IconArrowLeft size={16} />}
                onClick={back}
              >
                {t('back')}
              </Button>
              {data && (
                <Button
                  variant="default"
                  size="md"
                  radius="md"
                  leftSection={<IconDownload size={16} />}
                  loading={download.isPending}
                  onClick={() => download.mutate(data.id)}
                >
                  {t('downloadPdf')}
                </Button>
              )}
            </Group>
          }
        />
        {renderBody()}
      </Stack>
    </Box>
  );
}

export default WriteOffDetailPage;
