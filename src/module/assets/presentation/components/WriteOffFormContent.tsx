import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Collapse,
  Grid,
  Group,
  Paper,
  Stack,
  Switch,
  Text,
  Textarea,
  Tooltip,
  UnstyledButton,
} from '@mantine/core';
import { DateInput } from '@mantine/dates';
import {
  IconAlertCircle,
  IconCalendar,
  IconCash,
  IconChevronDown,
  IconListDetails,
  IconPaperclip,
  IconSignature,
  IconSend,
} from '@tabler/icons-react';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';
import { UnsavedChangesGuard } from '@/components/UnsavedChangesGuard/UnsavedChangesGuard';
import { useTranslation } from '@/i18n';
import type { AssetItem } from '@/module/assets/domain/asset';
import {
  WRITE_OFF_LIMITS,
  incidentDateBounds,
  proceedsAllowed,
  proceedsRequired,
} from '@/module/assets/domain/writeOffRules';
import { AccountSelect } from '@/module/assets/presentation/components/AccountSelect';
import { AssetHero } from '@/module/assets/presentation/components/AssetHero';
import { AssetCard } from '@/module/assets/presentation/components/AssetSection';
import { formatAssetDate } from '@/module/assets/presentation/components/formatAssetDate';
import { MoneyInput } from '@/module/assets/presentation/components/MoneyInput';
import { SignaturePad } from '@/module/assets/presentation/components/SignaturePad';
import { WriteOffChecklist } from '@/module/assets/presentation/components/WriteOffChecklist';
import { WriteOffEvidenceDropzone } from '@/module/assets/presentation/components/WriteOffEvidenceDropzone';
import classes from '@/module/assets/presentation/components/WriteOffForm.module.css';
import { WriteOffSheet } from '@/module/assets/presentation/components/WriteOffSheet';
import { WriteOffTypeCards } from '@/module/assets/presentation/components/WriteOffTypeCards';
import { useAssetAccounts } from '@/module/assets/presentation/hooks/useAssetQueries';
import { useWriteOffForm } from '@/module/assets/presentation/hooks/useWriteOffForm';
import {
  useCreateWriteOff,
  writeOffErrorMessage,
} from '@/module/assets/presentation/hooks/useWriteOffQueries';
import { routes } from '@/router/routes';
import { useAuthStore } from '@/store/useAuthentications';

const PROCEEDS_TYPES = ['Kas & Bank', 'Akun Piutang'];
const GAIN_LOSS_TYPES = ['Beban Lainnya', 'Pendapatan Lainnya'];

/** The report form beside its live document; the page around it handles the other states. */
export function WriteOffFormContent({ asset }: Readonly<{ asset: AssetItem }>) {
  const { t } = useTranslation('assetWriteOffs');
  const navigate = useNavigate();
  const userName = useAuthStore((state) => state.userName) ?? '';
  const form = useWriteOffForm(asset, userName);
  const accounts = useAssetAccounts(true);
  const create = useCreateWriteOff(asset.id);
  const [advanced, setAdvanced] = useState(false);
  const [failure, setFailure] = useState<string | null>(null);
  const failureRef = useRef<HTMLDivElement>(null);

  // The alert sits far above the submit button on a long form; bring it into view.
  useEffect(() => {
    if (!failure) {
      return;
    }
    failureRef.current?.scrollIntoView?.({ block: 'center' });
    failureRef.current?.focus();
  }, [failure]);
  const submitted = useRef(false);

  const { draft, set, errors } = form;
  const bounds = incidentDateBounds(asset.acquisitionDate, form.today);
  const sold = proceedsRequired(draft.type);
  const moneyOpen = sold || (draft.hasProceeds && proceedsAllowed(draft.type));
  const missing = form.checklist.filter((row) => !row.done).map((row) => t(`check_${row.key}`));

  const submit = async () => {
    form.revealErrors();
    if (!form.ready) return;
    setFailure(null);
    try {
      const report = await create.mutateAsync(draft);
      submitted.current = true;
      navigate(routes.assets.writeOffDetail.replace(':id', report.id), {
        state: { justSubmitted: true },
      });
    } catch (error) {
      setFailure(writeOffErrorMessage(error));
    }
  };

  return (
    <>
      <UnsavedChangesGuard
        when={() => form.isDirty() && !submitted.current}
        title={t('leaveTitle')}
        body={t('leaveBody')}
        leaveLabel={t('leaveConfirm')}
        stayLabel={t('leaveStay')}
      />

      <Stack gap="lg">
        <AssetHero
          title={t('formIntroTitle')}
          body={t('formIntroBody')}
          points={[t('formPoint1'), t('formPoint2'), t('formPoint3')]}
          illustration="hero"
        />
        <Grid gutter="lg" align="flex-start">
          <Grid.Col span={{ base: 12, lg: 7 }}>
            <Stack gap="lg">
              {failure && (
                <Alert
                  ref={failureRef}
                  tabIndex={-1}
                  color="red"
                  variant="light"
                  radius="md"
                  icon={<IconAlertCircle size={18} />}
                  title={t('submitFailedTitle')}
                >
                  {failure}
                </Alert>
              )}

              {!bounds && (
                <Alert color="orange" variant="light" radius="md" title={t('noValidDateTitle')}>
                  {t('noValidDateBody', { date: formatAssetDate(asset.acquisitionDate) })}
                </Alert>
              )}

              <AssetCard
                icon={IconListDetails}
                title={t('sectionType')}
                subtitle={t('sectionTypeSub')}
              >
                <WriteOffTypeCards
                  value={draft.type}
                  onChange={(type) => set('type', type)}
                  fullyDepreciatedAllowed={form.fullyDepreciatedAllowed}
                  error={errors.type && t(errors.type)}
                />
              </AssetCard>

              <AssetCard
                icon={IconCalendar}
                title={t('sectionWhen')}
                subtitle={t('sectionWhenSub')}
              >
                <Stack gap="md">
                  <DateInput
                    label={t('incidentDateLabel')}
                    placeholder={t('datePlaceholder')}
                    valueFormat="DD/MM/YYYY"
                    minDate={bounds ? new Date(bounds.min) : undefined}
                    maxDate={bounds ? new Date(bounds.max) : undefined}
                    disabled={!bounds}
                    withAsterisk
                    maw={240}
                    leftSection={<IconCalendar size={15} color="var(--mantine-color-dimmed)" />}
                    value={draft.incidentDate ? new Date(draft.incidentDate) : null}
                    onChange={(date) =>
                      set('incidentDate', date ? dayjs(date).format('YYYY-MM-DD') : '')
                    }
                    error={errors.incidentDate && t(errors.incidentDate)}
                  />
                  <Textarea
                    label={t('descriptionLabel')}
                    placeholder={t('descriptionPlaceholder')}
                    withAsterisk
                    autosize
                    minRows={4}
                    maxRows={10}
                    maxLength={WRITE_OFF_LIMITS.descriptionMax}
                    value={draft.description}
                    onChange={(event) => set('description', event.currentTarget.value)}
                    error={errors.description && t(errors.description)}
                    description={t('descriptionCount', {
                      count: draft.description.trim().length,
                      max: WRITE_OFF_LIMITS.descriptionMax,
                    })}
                    inputWrapperOrder={['label', 'input', 'description', 'error']}
                  />
                </Stack>
              </AssetCard>

              {draft.type !== 'fully_depreciated' && (
                <AssetCard
                  icon={IconCash}
                  title={t('sectionMoney')}
                  subtitle={sold ? t('sectionMoneySubSold') : t('sectionMoneySubOther')}
                >
                  <Stack gap="md">
                    {!sold && (
                      <Switch
                        label={t('proceedsToggle')}
                        checked={draft.hasProceeds}
                        onChange={(event) => set('hasProceeds', event.currentTarget.checked)}
                        disabled={!draft.type}
                      />
                    )}
                    <Collapse in={moneyOpen}>
                      <Grid gutter="md">
                        <Grid.Col span={{ base: 12, sm: 5 }}>
                          <MoneyInput
                            label={sold ? t('priceLabel') : t('amountLabel')}
                            withAsterisk={sold}
                            value={draft.proceedsAmount}
                            onChange={(value) => set('proceedsAmount', value)}
                            error={errors.proceedsAmount && t(errors.proceedsAmount)}
                          />
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, sm: 7 }}>
                          <AccountSelect
                            label={t('proceedsAccountLabel')}
                            description={t('proceedsAccountHint')}
                            placeholder={t('accountPlaceholder')}
                            value={draft.proceedsAccount}
                            onChange={(id) => set('proceedsAccount', id)}
                            options={accounts.data ?? []}
                            preferredTypes={PROCEEDS_TYPES}
                            error={errors.proceedsAccount && t(errors.proceedsAccount)}
                            required={draft.proceedsAmount > 0 || sold}
                            loading={accounts.isLoading}
                          />
                        </Grid.Col>
                      </Grid>
                    </Collapse>
                    <Box>
                      <UnstyledButton
                        onClick={() => setAdvanced((open) => !open)}
                        aria-expanded={advanced}
                      >
                        <Group gap={4}>
                          <IconChevronDown
                            size={14}
                            style={{ transform: advanced ? 'rotate(180deg)' : undefined }}
                          />
                          <Text size="sm" c="primary.7" fw={500}>
                            {t('advanced')}
                          </Text>
                        </Group>
                      </UnstyledButton>
                      <Collapse in={advanced}>
                        <Box mt="sm" maw={420}>
                          <AccountSelect
                            label={t('gainLossAccountLabel')}
                            description={t('gainLossAccountHint')}
                            placeholder={t('accountPlaceholder')}
                            value={draft.gainLossAccount}
                            onChange={(id) => set('gainLossAccount', id)}
                            options={accounts.data ?? []}
                            preferredTypes={GAIN_LOSS_TYPES}
                            loading={accounts.isLoading}
                          />
                        </Box>
                      </Collapse>
                    </Box>
                  </Stack>
                </AssetCard>
              )}

              <AssetCard
                icon={IconPaperclip}
                title={t('sectionEvidence')}
                subtitle={
                  draft.type === 'lost' ? t('sectionEvidenceSubLost') : t('sectionEvidenceSub')
                }
              >
                <WriteOffEvidenceDropzone
                  files={draft.evidence}
                  onChange={(files) => set('evidence', files)}
                  error={errors.evidence && t(errors.evidence)}
                />
              </AssetCard>

              <AssetCard
                icon={IconSignature}
                title={t('sectionSignature')}
                subtitle={t('sectionSignatureSub')}
              >
                <SignaturePad
                  value={draft.signature}
                  onChange={(signature) => set('signature', signature)}
                  label={t('signatureLabel')}
                  error={errors.signature && t(errors.signature)}
                />
              </AssetCard>
            </Stack>
          </Grid.Col>

          <Grid.Col span={{ base: 12, lg: 5 }}>
            <Stack gap="md" className={classes.aside}>
              <Text size="xs" fw={700} c="dimmed" tt="uppercase">
                {t('previewLabel')}
              </Text>
              <WriteOffSheet model={form.previewModel} />
              <Paper withBorder radius="lg" p="md" bg="white">
                <WriteOffChecklist rows={form.checklist} />
                <Tooltip
                  label={t('submitMissing', { items: missing.join(', ') })}
                  disabled={form.ready}
                  multiline
                  w={280}
                  withArrow
                >
                  <Box mt="md">
                    <Button
                      fullWidth
                      size="md"
                      radius="md"
                      leftSection={<IconSend size={18} />}
                      disabled={!form.ready}
                      loading={create.isPending}
                      onClick={submit}
                    >
                      {t('submit')}
                    </Button>
                  </Box>
                </Tooltip>
              </Paper>
            </Stack>
          </Grid.Col>
        </Grid>
      </Stack>
    </>
  );
}

export default WriteOffFormContent;
