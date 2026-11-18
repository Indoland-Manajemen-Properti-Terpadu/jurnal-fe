import { useRef, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Grid,
  Group,
  Paper,
  Skeleton,
  Stack,
  Switch,
  Text,
} from '@mantine/core';
import {
  IconArrowLeft,
  IconBuildingWarehouse,
  IconCoin,
  IconInfoCircle,
  IconMapPin,
  IconNotes,
  IconPhoto,
  IconListDetails,
  IconTag,
} from '@tabler/icons-react';
import { useNavigate, useParams } from 'react-router-dom';
import { ModuleHeader } from '@/components/ModuleHeader/ModuleHeader';
import { UnsavedChangesGuard } from '@/components/UnsavedChangesGuard/UnsavedChangesGuard';
import { useTranslation } from '@/i18n';
import type { AssetFormValues, AssetItem } from '@/module/assets/domain/asset';
import { getAssetEditRights } from '@/module/assets/domain/assetRules';
import { AssetActivationFields } from '@/module/assets/presentation/components/AssetActivationFields';
import {
  AssetIdentityFields,
  AssetNotesFields,
  AssetPlaceFields,
  AssetSpecFields,
} from '@/module/assets/presentation/components/AssetFormSections';
import { AssetPhotoPicker } from '@/module/assets/presentation/components/AssetPhotoPicker';
import classes from '@/module/assets/presentation/components/AssetPhotoPicker.module.css';
import { AssetCard } from '@/module/assets/presentation/components/AssetSection';
import { formatAssetMoney } from '@/module/assets/presentation/components/formatAssetMoney';
import { useActivationForm } from '@/module/assets/presentation/hooks/useActivationForm';
import { useAssetForm } from '@/module/assets/presentation/hooks/useAssetForm';
import {
  useAsset,
  useAssetAccounts,
  useAssetTags,
  useCreateAsset,
  useUpdateAsset,
} from '@/module/assets/presentation/hooks/useAssetQueries';
import { useDecimalPrecision } from '@/module/settings';
import { routes } from '@/router/routes';

const ALL_RIGHTS = { details: true, terms: true, tags: true } as const;

type FormBodyProps = { asset: AssetItem | null };

/** The form itself; it mounts once the asset (when editing) is known, so values start right. */
function AssetFormBody({ asset }: Readonly<FormBodyProps>) {
  const { t } = useTranslation('assets');
  const navigate = useNavigate();
  const editing = Boolean(asset);
  const rights = asset ? getAssetEditRights(asset) : ALL_RIGHTS;
  const fromProapps = asset?.source === 'proapps';
  const saved = useRef(false);
  const precision = useDecimalPrecision();

  const [activateNow, setActivateNow] = useState(false);
  const tags = useAssetTags();
  const accounts = useAssetAccounts(activateNow);
  const create = useCreateAsset();
  const update = useUpdateAsset(asset?.id ?? '', rights);
  const pending = create.isPending || update.isPending;

  const form = useAssetForm(asset);
  const activationForm = useActivationForm(null, () => Number(form.values.acquisitionCost) || 0);

  const back = () =>
    navigate(asset ? routes.assets.detail.replace(':id', asset.id) : routes.assets.main);

  const handleSubmit = async (values: AssetFormValues) => {
    try {
      if (asset) {
        await update.mutateAsync(values);
        saved.current = true;
        navigate(routes.assets.detail.replace(':id', asset.id));
        return;
      }
      if (activateNow && activationForm.validate().hasErrors) return;
      const created = await create.mutateAsync({
        values,
        activation: activateNow ? activationForm.values : undefined,
      });
      saved.current = true;
      navigate(routes.assets.detail.replace(':id', created.id));
    } catch {
      // The mutation already shows the failure; the page keeps what was entered.
    }
  };

  const submitLabel = editing
    ? t('updateAsset')
    : activateNow
      ? t('saveAndActivate')
      : t('saveAsset');

  return (
    <form onSubmit={form.onSubmit(handleSubmit)} noValidate>
      <UnsavedChangesGuard
        when={() => form.isDirty() && !saved.current}
        title={t('leaveTitle')}
        body={t('leaveBody')}
        leaveLabel={t('leaveConfirm')}
        stayLabel={t('leaveStay')}
      />

      <Grid gutter="lg" align="flex-start">
        <Grid.Col span={{ base: 12, lg: 8 }}>
          <Stack gap="lg">
            {fromProapps && (
              <Alert
                variant="light"
                color="primary"
                radius="md"
                icon={<IconInfoCircle size={18} />}
              >
                {t('proappsDataNotice')}
              </Alert>
            )}

            <AssetCard
              icon={IconListDetails}
              title={t('sectionIdentity')}
              subtitle={t('sectionIdentitySub')}
            >
              <AssetIdentityFields form={form} rights={rights} />
            </AssetCard>

            <AssetCard
              icon={IconBuildingWarehouse}
              title={t('sectionSpecs')}
              subtitle={t('sectionSpecsSub')}
            >
              <AssetSpecFields form={form} editable={rights.details} />
            </AssetCard>

            <AssetCard icon={IconMapPin} title={t('sectionPlace')} subtitle={t('sectionPlaceSub')}>
              <AssetPlaceFields form={form} editable={rights.details} asset={asset} />
            </AssetCard>

            <AssetCard icon={IconPhoto} title={t('sectionPhotos')} subtitle={t('sectionPhotosSub')}>
              <AssetPhotoPicker
                saved={form.values.photos}
                onSavedChange={(photos) => form.setFieldValue('photos', photos)}
                files={form.values.photoFiles ?? []}
                onFilesChange={(files) => form.setFieldValue('photoFiles', files)}
                error={form.errors.photos as string | undefined}
                disabled={!rights.details}
              />
            </AssetCard>

            <AssetCard icon={IconNotes} title={t('sectionNotes')} subtitle={t('sectionNotesSub')}>
              <AssetNotesFields form={form} rights={rights} tags={tags.data ?? []} />
            </AssetCard>

            {!editing && activateNow && (
              <AssetCard
                icon={IconCoin}
                title={t('sectionActivation')}
                subtitle={t('sectionActivationSub')}
              >
                <AssetActivationFields
                  form={activationForm}
                  accounts={accounts.data ?? []}
                  loadingAccounts={accounts.isLoading}
                  acquisitionCost={Number(form.values.acquisitionCost) || 0}
                />
              </AssetCard>
            )}
          </Stack>
        </Grid.Col>

        <Grid.Col span={{ base: 12, lg: 4 }}>
          <Stack gap="md" className={classes.aside}>
            <Paper withBorder radius="lg" p="lg" shadow="none" bg="white">
              <Stack gap="md">
                <Text size="xs" fw={700} c="dimmed" tt="uppercase">
                  {t('summaryTitle')}
                </Text>
                <Box>
                  <Text fw={700} lh={1.3}>
                    {form.values.name.trim() || t('summaryEmpty')}
                  </Text>
                  <Text size="sm" c="dimmed">
                    {form.values.code.trim() || t('summaryEmpty')}
                  </Text>
                </Box>
                <Group justify="space-between" gap="xs">
                  <Text size="sm" c="dimmed">
                    {t('summaryCost')}
                  </Text>
                  <Text size="sm" fw={600}>
                    {formatAssetMoney(Number(form.values.acquisitionCost) || 0, precision)}
                  </Text>
                </Group>

                {!editing && (
                  <Switch
                    checked={activateNow}
                    onChange={(event) => setActivateNow(event.currentTarget.checked)}
                    label={t('activateNowLabel')}
                    description={t('activateNowHint')}
                  />
                )}
                {!editing && (
                  <Group gap="xs" wrap="nowrap" align="flex-start">
                    <IconTag size={16} color="var(--mantine-color-dimmed)" />
                    <Text size="xs" c="dimmed">
                      {activateNow ? t('summaryStatusActive') : t('summaryStatusPending')}
                    </Text>
                  </Group>
                )}

                <Stack gap="xs">
                  <Button type="submit" size="md" radius="md" fullWidth loading={pending}>
                    {submitLabel}
                  </Button>
                  <Button
                    variant="default"
                    size="md"
                    radius="md"
                    fullWidth
                    onClick={back}
                    disabled={pending}
                  >
                    {t('cancel')}
                  </Button>
                </Stack>
              </Stack>
            </Paper>
          </Stack>
        </Grid.Col>
      </Grid>
    </form>
  );
}

/** Add (`/assets/new`) or edit (`/assets/:id/edit`) an asset on its own page. */
export function AssetFormPage() {
  const { t } = useTranslation('assets');
  const navigate = useNavigate();
  const { id } = useParams();
  const asset = useAsset(id);
  const editing = Boolean(id);

  const goBack = () => navigate(id ? routes.assets.detail.replace(':id', id) : routes.assets.main);

  const renderBody = () => {
    if (!editing) return <AssetFormBody asset={null} />;
    if (asset.isLoading) {
      return (
        <Stack gap="lg">
          <Skeleton h={220} radius="lg" />
          <Skeleton h={220} radius="lg" />
        </Stack>
      );
    }
    if (!asset.data) {
      return (
        <Alert color="red" variant="light" radius="md" title={t('notFoundTitle')}>
          {t('notFoundDesc')}
        </Alert>
      );
    }
    return <AssetFormBody asset={asset.data} />;
  };

  return (
    <Box p={{ base: 'md', sm: 'xl' }}>
      <Stack gap="lg">
        <ModuleHeader
          icon={IconBuildingWarehouse}
          title={editing ? t('formTitleEdit') : t('formTitleCreate')}
          description={t('formSubtitle')}
          actions={
            <Button
              variant="default"
              size="md"
              radius="md"
              leftSection={<IconArrowLeft size={16} />}
              onClick={goBack}
            >
              {t('back')}
            </Button>
          }
        />
        {renderBody()}
      </Stack>
    </Box>
  );
}

export default AssetFormPage;
