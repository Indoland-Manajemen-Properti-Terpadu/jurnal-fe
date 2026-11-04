import { useState } from 'react';
import { Button, Group, Select, Stack, Switch, Text, TextInput, Textarea } from '@mantine/core';
import { DialogFrame } from '@/module/petty-cash/presentation/components/DialogFrame';
import { useTranslation } from '@/i18n';
import type { FundPocket } from '@/module/petty-cash/domain/pettyCashEntities';
import {
  canDeactivatePocket,
  editDraftFromPocket,
  emptyPocketDraft,
  toAddPocketInput,
  toPocketPatch,
  validateAddPocket,
  validatePocketEdit,
  type AddablePocketType,
  type PocketDraft,
  type PocketEditDraft,
  type PocketIssue,
} from '@/module/petty-cash/domain/pockets';
import {
  useAddPocket,
  useUpdatePocket,
} from '@/module/petty-cash/presentation/hooks/usePocketMutations';
import { usePettyCashLookups } from '@/module/petty-cash/presentation/hooks/usePettyCashQueries';

interface Props {
  fundId: string;
  pockets: FundPocket[];
  /** Present when editing; absent when a pocket is added. */
  pocket?: FundPocket;
  opened: boolean;
  onClose: () => void;
}

/** Adds a non-cash pocket to a fund, or edits one: names, account details, and switching it off. */
export function PocketFormDialog({ fundId, pockets, pocket, opened, onClose }: Readonly<Props>) {
  const { t } = useTranslation('pettyCash');
  const lookups = usePettyCashLookups();
  const add = useAddPocket(fundId);
  const update = useUpdatePocket(fundId, pocket?.code ?? '', pocket?.name ?? '');
  const [created, setCreated] = useState<PocketDraft>(emptyPocketDraft);
  const [edited, setEdited] = useState<PocketEditDraft | null>(null);
  const [touched, setTouched] = useState(false);

  const edit = pocket ? (edited ?? editDraftFromPocket(pocket)) : null;
  const issues: PocketIssue[] =
    pocket && edit ? validatePocketEdit(pocket, edit) : validateAddPocket(created, pockets);
  const errorOf = (path: string) => {
    const issue = issues.find((item) => item.path === path);
    return touched && issue ? t(`pocketAdmin.issue.${issue.code}`) : undefined;
  };
  const patch = pocket && edit ? toPocketPatch(pocket, edit) : {};
  const nothingChanged = Boolean(pocket) && Object.keys(patch).length === 0;
  const pending = add.isPending || update.isPending;

  const typeOptions = (lookups.data?.pocketTypes ?? []).map((type) => ({
    value: type.value,
    label: ['BANK', 'EWALLET'].includes(type.value) ? t(`pockets.types.${type.value}`) : type.label,
  }));

  const close = () => {
    setTouched(false);
    setEdited(null);
    onClose();
  };
  const submit = () => {
    setTouched(true);
    if (issues.length > 0 || nothingChanged) return;
    if (pocket) update.mutate(patch, { onSuccess: close });
    else {
      add.mutate(toAddPocketInput(created), {
        onSuccess: () => {
          setCreated(emptyPocketDraft());
          close();
        },
      });
    }
  };

  const field = (key: 'name' | 'provider' | 'accountNumber' | 'accountHolder', label: string) => (
    <TextInput
      label={label}
      value={edit ? edit[key] : created[key]}
      onChange={(event) => {
        const { value } = event.currentTarget;
        if (edit) setEdited({ ...edit, [key]: value });
        else setCreated({ ...created, [key]: value });
      }}
      error={key === 'name' ? errorOf('name') : undefined}
      required={key === 'name'}
    />
  );

  return (
    <DialogFrame
      opened={opened}
      onClose={close}
      title={pocket ? t('pocketAdmin.editTitle', { name: pocket.name }) : t('pocketAdmin.addTitle')}
      footer={
        <>
          <Button variant="default" onClick={close} disabled={pending}>
            {t('actions.keep')}
          </Button>
          <Button loading={pending} onClick={submit}>
            {pocket ? t('pocketAdmin.save') : t('pocketAdmin.addSubmit')}
          </Button>
        </>
      }
    >
      <Stack gap="md">
        {!pocket && <Text size="sm">{t('pocketAdmin.addBody')}</Text>}
        {!pocket && (
          <Group grow align="flex-start">
            <TextInput
              label={t('pocketAdmin.code')}
              placeholder={t('pocketAdmin.codePlaceholder')}
              value={created.code}
              onChange={(event) => setCreated({ ...created, code: event.currentTarget.value })}
              error={errorOf('code')}
              required
            />
            <Select
              label={t('pocketAdmin.type')}
              data={typeOptions}
              value={created.type}
              onChange={(type) =>
                type && setCreated({ ...created, type: type as AddablePocketType })
              }
              allowDeselect={false}
            />
          </Group>
        )}
        {field('name', t('pocketAdmin.name'))}
        {field('provider', t('pocketAdmin.provider'))}
        {field('accountNumber', t('pocketAdmin.accountNumber'))}
        {field('accountHolder', t('pocketAdmin.accountHolder'))}
        {pocket && edit && (
          <>
            <Stack gap={4}>
              <Switch
                label={t('pocketAdmin.active')}
                checked={edit.isActive}
                disabled={
                  pocket.type === 'CASH' || (pocket.isActive && !canDeactivatePocket(pocket))
                }
                onChange={(event) => setEdited({ ...edit, isActive: event.currentTarget.checked })}
              />
              <Text size="xs" c="dimmed">
                {pocket.type === 'CASH'
                  ? t('pocketAdmin.cashAlwaysOn')
                  : pocket.isActive && !canDeactivatePocket(pocket)
                    ? t('pocketAdmin.cannotDeactivate')
                    : t('pocketAdmin.activeHint')}
              </Text>
            </Stack>
            <Textarea
              label={t('pocketAdmin.reason')}
              value={edit.reason}
              onChange={(event) => setEdited({ ...edit, reason: event.currentTarget.value })}
              minRows={2}
              autosize
            />
          </>
        )}
        {touched && nothingChanged && (
          <Text size="sm" c="orange.8" role="alert">
            {t('pocketAdmin.noChanges')}
          </Text>
        )}
      </Stack>
    </DialogFrame>
  );
}
