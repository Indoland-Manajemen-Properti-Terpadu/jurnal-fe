import { Button, Stack } from '@mantine/core';
import { useTranslation } from '@/i18n';

interface FormActionsProps {
  submitLabel: string;
  onSubmit: () => void;
  onCancel: () => void;
  loading?: boolean;
}

/** The two buttons closing a form summary: one primary action, cancel under it, both full width. */
export const FormActions = ({
  submitLabel,
  onSubmit,
  onCancel,
  loading,
}: Readonly<FormActionsProps>) => {
  const { t } = useTranslation('purchases');
  return (
    <Stack gap="xs">
      <Button fullWidth loading={loading} onClick={onSubmit}>
        {submitLabel}
      </Button>
      <Button fullWidth variant="default" disabled={loading} onClick={onCancel}>
        {t('common.cancel')}
      </Button>
    </Stack>
  );
};
