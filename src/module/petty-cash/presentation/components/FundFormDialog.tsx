import { useState } from 'react';
import {
  Button,
  Group,
  Modal,
  NumberInput,
  Select,
  Stack,
  Text,
  TextInput,
  Textarea,
} from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import dayjs from 'dayjs';
import { useTranslation } from '@/i18n';
import {
  editDraftFromFund,
  emptyNewFund,
  toCreateFundInput,
  toFundPatch,
  validateFundEdit,
  validateNewFund,
  type EditFundDraft,
  type FundIssue,
  type NewFundDraft,
} from '@/module/petty-cash/domain/fundAdmin';
import type { PettyCashFund } from '@/module/petty-cash/domain/pettyCashEntities';
import { FundSettingsFields } from '@/module/petty-cash/presentation/components/FundSettingsFields';
import {
  useCreateFund,
  useUpdateFund,
} from '@/module/petty-cash/presentation/hooks/useFundMutations';
import { usePettyCashLookups } from '@/module/petty-cash/presentation/hooks/usePettyCashQueries';

interface Props {
  /** Present when editing; absent when a new fund is opened. */
  fund?: PettyCashFund;
  opened: boolean;
  onClose: () => void;
  onSaved?: (fundId: string) => void;
}

/** One form for opening a fund and for changing its rules; the ceiling moves only by adjustment. */
export function FundFormDialog({ fund, opened, onClose, onSaved }: Readonly<Props>) {
  const { t } = useTranslation('pettyCash');
  const today = dayjs().format('YYYY-MM-DD');
  const lookups = usePettyCashLookups();
  const create = useCreateFund();
  const update = useUpdateFund(fund?.id ?? '');
  const [created, setCreated] = useState<NewFundDraft>(() => emptyNewFund(today));
  const [edited, setEdited] = useState<EditFundDraft | null>(null);
  const [touched, setTouched] = useState(false);

  const edit = fund ? (edited ?? editDraftFromFund(fund)) : null;
  const issues: FundIssue[] =
    fund && edit ? validateFundEdit(fund, edit) : validateNewFund(created, today);
  const errorOf = (path: string) => {
    const issue = issues.find((item) => item.path === path);
    return touched && issue ? t(`fundAdmin.issue.${issue.code}`) : undefined;
  };
  const patch = fund && edit ? toFundPatch(fund, edit) : {};
  const nothingChanged = Boolean(fund) && Object.keys(patch).length === 0;
  const settings = edit ? edit.settings : created.settings;
  const setSettings = (next: typeof settings) =>
    edit ? setEdited({ ...edit, settings: next }) : setCreated({ ...created, settings: next });

  const accounts = (lookups.data?.bankAccounts ?? []).map((account) => ({
    value: account.id,
    label: `${account.accountNumber} · ${account.name}`,
  }));
  const users = (lookups.data?.users ?? []).map((user) => ({ value: user.id, label: user.name }));

  const close = () => {
    setTouched(false);
    setEdited(null);
    onClose();
  };
  const submit = () => {
    setTouched(true);
    if (issues.length > 0 || nothingChanged) return;
    if (fund) {
      update.mutate(patch, {
        onSuccess: (saved) => {
          close();
          onSaved?.(saved.id);
        },
      });
    } else {
      create.mutate(toCreateFundInput(created), {
        onSuccess: (saved) => {
          setCreated(emptyNewFund(today));
          close();
          onSaved?.(saved.id);
        },
      });
    }
  };
  const pending = create.isPending || update.isPending;

  return (
    <Modal
      opened={opened}
      onClose={close}
      size="xl"
      centered
      radius="md"
      title={
        <Text fw={700}>
          {fund ? t('fundAdmin.editTitle', { name: fund.name }) : t('fundAdmin.createTitle')}
        </Text>
      }
      closeButtonProps={{ 'aria-label': t('common.close') }}
    >
      <Stack gap="lg">
        <Stack gap="sm">
          <Text fw={650} size="sm">
            {t('fundAdmin.sectionBasics')}
          </Text>
          <Group align="flex-start" wrap="nowrap">
            {!fund && (
              <TextInput
                label={t('fundAdmin.code')}
                value={created.code}
                onChange={(event) => setCreated({ ...created, code: event.currentTarget.value })}
                error={errorOf('code')}
                w={160}
                required
              />
            )}
            <TextInput
              flex={1}
              label={t('fundAdmin.name')}
              value={edit ? edit.name : created.name}
              onChange={(event) => {
                const name = event.currentTarget.value;
                if (edit) setEdited({ ...edit, name });
                else setCreated({ ...created, name });
              }}
              error={errorOf('name')}
              required
            />
          </Group>
          <Group grow align="flex-start">
            {!fund && (
              <Select
                label={t('fundAdmin.account')}
                data={accounts}
                value={created.accountId}
                onChange={(accountId) => setCreated({ ...created, accountId })}
                error={errorOf('accountId')}
                searchable
                required
              />
            )}
            <Select
              label={t('fundAdmin.custodian')}
              data={users}
              value={edit ? edit.custodianId : created.custodianId}
              onChange={(custodianId) => {
                if (!custodianId) return;
                if (edit) setEdited({ ...edit, custodianId });
                else setCreated({ ...created, custodianId });
              }}
              error={errorOf('custodianId')}
              allowDeselect={false}
              searchable
              required
            />
          </Group>
          {!fund && (
            <>
              <NumberInput
                label={t('fundAdmin.pagu')}
                description={t('fundAdmin.paguHint')}
                value={created.pagu}
                onChange={(value) =>
                  setCreated({ ...created, pagu: value === '' ? '' : Number(value) })
                }
                error={errorOf('pagu')}
                thousandSeparator="."
                decimalSeparator=","
                allowNegative={false}
                decimalScale={0}
                leftSection={<Text size="sm">Rp</Text>}
                required
              />
              <Group grow align="flex-start">
                <Select
                  label={t('fundAdmin.fundingBank')}
                  description={t('fundAdmin.fundingBankHint')}
                  data={accounts}
                  value={created.fundingBankAccountId}
                  onChange={(fundingBankAccountId) =>
                    setCreated({ ...created, fundingBankAccountId })
                  }
                  clearable
                  searchable
                />
                {created.fundingBankAccountId && (
                  <DatePickerInput
                    label={t('fundAdmin.fundingDate')}
                    value={created.fundingDate || null}
                    onChange={(value) => setCreated({ ...created, fundingDate: value ?? '' })}
                    maxDate={today}
                    valueFormat="DD/MM/YYYY"
                    error={errorOf('fundingDate')}
                    required
                  />
                )}
              </Group>
            </>
          )}
          {edit && (
            <>
              <Select
                label={t('fundAdmin.status')}
                data={[
                  { value: 'ACTIVE', label: t('fundAdmin.statusActive') },
                  { value: 'INACTIVE', label: t('fundAdmin.statusInactive') },
                ]}
                value={edit.status}
                onChange={(status) =>
                  status && setEdited({ ...edit, status: status as EditFundDraft['status'] })
                }
                allowDeselect={false}
                maw={240}
              />
              <Textarea
                label={t('fundAdmin.reason')}
                description={t('fundAdmin.reasonHint')}
                value={edit.reason}
                onChange={(event) => setEdited({ ...edit, reason: event.currentTarget.value })}
                error={errorOf('reason')}
                minRows={2}
                autosize
              />
            </>
          )}
        </Stack>

        <FundSettingsFields value={settings} onChange={setSettings} errorOf={errorOf} />

        {touched && nothingChanged && (
          <Text size="sm" c="orange.8" role="alert">
            {t('fundAdmin.noChanges')}
          </Text>
        )}
        <Group justify="flex-end" gap="sm">
          <Button variant="default" onClick={close} disabled={pending}>
            {t('actions.keep')}
          </Button>
          <Button loading={pending} onClick={submit}>
            {fund ? t('fundAdmin.save') : t('fundAdmin.createSubmit')}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
