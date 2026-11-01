import { ActionIcon, CopyButton, Tooltip } from '@mantine/core';
import { IconCheck, IconCopy } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';

type CopyValueButtonProps = {
  value: string;
  /** Tooltip shown before copying; also used as the accessible name unless `ariaLabel` is set. */
  label: string;
  ariaLabel: string;
};

export function CopyValueButton({ value, label, ariaLabel }: Readonly<CopyValueButtonProps>) {
  const { t } = useTranslation('products');
  return (
    <CopyButton value={value} timeout={2000}>
      {({ copied, copy }) => (
        <Tooltip label={copied ? t('detail.copied') : label} withArrow position="top">
          <ActionIcon
            color={copied ? 'teal' : 'gray'}
            variant="subtle"
            size="xs"
            onClick={copy}
            aria-label={ariaLabel}
          >
            {copied ? <IconCheck size={12} /> : <IconCopy size={12} />}
          </ActionIcon>
        </Tooltip>
      )}
    </CopyButton>
  );
}
