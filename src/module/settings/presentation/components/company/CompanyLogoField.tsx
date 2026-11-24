import { useState } from 'react';
import { Button, FileButton, Group, Stack, Text } from '@mantine/core';
import { IconPhotoUp, IconTrash } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import {
  checkLogoFile,
  companyInitials,
  LOGO_RULES,
  type CompanyLogo,
  type LogoProblem,
} from '@/module/settings/domain/companyProfile';
import { resolveLogoUrl } from '@/module/settings/infrastructure/companyProfileApi';
import { DeleteConfirmModal } from '@/module/settings/presentation/components/DeleteConfirmModal';
import classes from './CompanyLetterhead.module.css';

interface CompanyLogoFieldProps {
  logo: CompanyLogo | null;
  /** The name typed now, for the initials box and the picture's description. */
  name: string;
  canEdit: boolean;
  uploading: boolean;
  removing: boolean;
  onPick: (file: File) => void;
  onRemove: () => void;
}

/** The logo with its two actions. A wrong file is refused here, with the reason, before anything is sent. */
export const CompanyLogoField = ({
  logo,
  name,
  canEdit,
  uploading,
  removing,
  onPick,
  onRemove,
}: Readonly<CompanyLogoFieldProps>) => {
  const { t } = useTranslation('settings');
  const [problem, setProblem] = useState<LogoProblem | null>(null);
  const [confirming, setConfirming] = useState(false);
  const url = resolveLogoUrl(logo?.filePath ?? null);

  const pick = (file: File | null) => {
    if (!file) return;
    const found = checkLogoFile(file);
    setProblem(found);
    if (!found) onPick(file);
  };

  return (
    <Stack gap="sm">
      <Group align="center" gap="lg" wrap="nowrap">
        <div style={{ width: '8rem', flexShrink: 0 }}>
          <div className={`${classes.logo} ${url ? '' : classes.initials}`}>
            {url ? (
              <img
                className={classes.logoImage}
                src={url}
                alt={t('company.logo.alt', { name: name.trim() })}
              />
            ) : (
              <span aria-hidden="true">{companyInitials(name)}</span>
            )}
          </div>
        </div>
        <Stack gap={6} style={{ minWidth: 0 }}>
          <Text size="sm" c="dimmed">
            {url ? t('company.logo.hint') : t('company.logo.none')}
          </Text>
          {canEdit && (
            <Group gap="xs">
              <FileButton onChange={pick} accept={LOGO_RULES.types.join(',')}>
                {(props) => (
                  <Button
                    {...props}
                    variant="default"
                    size="sm"
                    leftSection={<IconPhotoUp size={16} />}
                    loading={uploading}
                  >
                    {url ? t('company.logo.replace') : t('company.logo.upload')}
                  </Button>
                )}
              </FileButton>
              {url && (
                <Button
                  variant="subtle"
                  color="red"
                  size="sm"
                  leftSection={<IconTrash size={16} />}
                  disabled={uploading}
                  onClick={() => setConfirming(true)}
                >
                  {t('company.logo.remove')}
                </Button>
              )}
            </Group>
          )}
        </Stack>
      </Group>
      {problem && (
        <Text size="xs" c="red" role="alert">
          {t(`company.logo.problem.${problem}`)}
        </Text>
      )}
      <DeleteConfirmModal
        opened={confirming}
        onClose={() => setConfirming(false)}
        title={t('company.logo.removeTitle')}
        loading={removing}
        onConfirm={() => {
          onRemove();
          setConfirming(false);
        }}
      >
        {t('company.logo.removeBody')}
      </DeleteConfirmModal>
    </Stack>
  );
};
