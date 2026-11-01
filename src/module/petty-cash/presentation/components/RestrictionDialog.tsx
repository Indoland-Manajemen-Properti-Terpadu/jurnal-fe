import { useState } from 'react';
import { Alert, Button, Group, Modal, Radio, Stack, Text, Textarea } from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import dayjs from 'dayjs';
import { IconAlertCircle, IconCircleCheck } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import { dateFormatV1 } from '@/utils/formatDate';
import {
  availableRestrictionActions,
  validateRestriction,
  type RestrictionKind,
} from '@/module/petty-cash/domain/restriction';
import { useChangeRestriction } from '@/module/petty-cash/presentation/hooks/useAdvanceMutations';
import { useAdvanceStatus } from '@/module/petty-cash/presentation/hooks/useAdvanceQueries';

interface Props {
  userId: string;
  name: string;
  opened: boolean;
  onClose: () => void;
}

/** A controller blocks, unblocks, or grants an exception to one employee's advance requests. */
export function RestrictionDialog({ userId, name, opened, onClose }: Readonly<Props>) {
  const { t } = useTranslation('pettyCash');
  const today = dayjs().format('YYYY-MM-DD');
  const status = useAdvanceStatus(opened ? userId : undefined);
  const change = useChangeRestriction(userId);
  const [kind, setKind] = useState<RestrictionKind | null>(null);
  const [reason, setReason] = useState('');
  const [until, setUntil] = useState('');
  const [touched, setTouched] = useState(false);

  const info = status.data;
  const actions = info ? availableRestrictionActions(info) : [];
  const chosen = kind && actions.includes(kind) ? kind : (actions[0] ?? null);
  const issues = chosen ? validateRestriction({ kind: chosen, reason, until }, today) : [];
  const errorOf = (path: string) => {
    const issue = issues.find((item) => item.path === path);
    return touched && issue ? t(`restriction.issue.${issue.code}`) : undefined;
  };

  const close = () => {
    setKind(null);
    setReason('');
    setUntil('');
    setTouched(false);
    onClose();
  };
  const submit = () => {
    setTouched(true);
    if (!chosen || issues.length > 0) return;
    const text = reason.trim();
    const request =
      chosen === 'block' || chosen === 'unblock'
        ? { kind: chosen, reason: text }
        : {
            kind: 'override' as const,
            until: chosen === 'revoke' ? null : dayjs(until).endOf('day').toISOString(),
            reason: text,
          };
    change.mutate(request, { onSuccess: close });
  };

  return (
    <Modal
      opened={opened}
      onClose={close}
      centered
      radius="md"
      title={<Text fw={700}>{t('restriction.title', { name })}</Text>}
      closeButtonProps={{ 'aria-label': t('common.close') }}
    >
      <Stack gap="md">
        {info && (
          <Alert
            color={info.isBlocked ? 'orange' : 'teal'}
            icon={info.isBlocked ? <IconAlertCircle size={18} /> : <IconCircleCheck size={18} />}
            radius="md"
          >
            <Text size="sm">{t(info.isBlocked ? 'restriction.held' : 'restriction.clear')}</Text>
            {info.reasons.map((item) => (
              <Text size="xs" key={`${item.type}-${item.since ?? ''}`}>
                {t(item.type === 'MANUAL' ? 'advances.reasonManual' : 'advances.reasonOverdue')}
                {item.since ? ` (${dateFormatV1(item.since)})` : ''}
              </Text>
            ))}
            {info.overrideUntil && (
              <Text size="xs">
                {t('advances.overrideUntil', { date: dateFormatV1(info.overrideUntil) })}
              </Text>
            )}
          </Alert>
        )}
        {actions.length > 0 && (
          <Radio.Group
            label={t('restriction.action')}
            value={chosen}
            onChange={(value) => setKind(value as RestrictionKind)}
          >
            <Stack gap={6} mt={6}>
              {actions.map((item) => (
                <Radio key={item} value={item} label={t(`restriction.${item}`)} />
              ))}
            </Stack>
          </Radio.Group>
        )}
        {chosen === 'override' && (
          <DatePickerInput
            label={t('restriction.until')}
            description={t('restriction.untilHint')}
            value={until || null}
            onChange={(value) => setUntil(value ?? '')}
            minDate={today}
            valueFormat="DD/MM/YYYY"
            error={errorOf('until')}
            required
          />
        )}
        {chosen && (
          <Textarea
            label={t('restriction.reason')}
            placeholder={t('restriction.reasonPlaceholder')}
            value={reason}
            onChange={(event) => setReason(event.currentTarget.value)}
            error={errorOf('reason')}
            minRows={2}
            autosize
            required
          />
        )}
        <Group justify="flex-end" gap="sm">
          <Button variant="default" onClick={close} disabled={change.isPending}>
            {t('actions.keep')}
          </Button>
          <Button
            color={chosen === 'block' ? 'red' : 'primary'}
            loading={change.isPending}
            disabled={!chosen}
            onClick={submit}
          >
            {chosen ? t(`restriction.${chosen}`) : t('restriction.manage')}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
