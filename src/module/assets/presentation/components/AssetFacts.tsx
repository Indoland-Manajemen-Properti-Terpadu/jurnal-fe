import type { ReactNode } from 'react';
import { SimpleGrid, Text } from '@mantine/core';
import { useTranslation } from '@/i18n';

/** Facts of one card in two columns, each label above its value, as on the contact detail. */
export function AssetFactGrid({
  children,
  single,
}: Readonly<{
  children: ReactNode;
  /** One column, for the narrow side column. */ single?: boolean;
}>) {
  return (
    <SimpleGrid cols={single ? 1 : { base: 1, sm: 2 }} spacing="lg">
      {children}
    </SimpleGrid>
  );
}

export type AssetFactProps = {
  label: string;
  /** Leave empty to show "Belum diisi" (or `emptyText`) in a muted colour. */
  value?: ReactNode;
  emptyText?: string;
  /** Money and numbers line up in tabular figures. */
  numeric?: boolean;
};

export function AssetFact({ label, value, numeric, emptyText }: Readonly<AssetFactProps>) {
  const { t } = useTranslation('assets');
  const empty = value === undefined || value === null || value === '' || value === false;
  return (
    <div style={{ minWidth: 0 }}>
      <Text fz="xs" c="dimmed" fw={600}>
        {label}
      </Text>
      {empty ? (
        <Text fz="sm" c="dimmed">
          {emptyText ?? t('notFilled')}
        </Text>
      ) : (
        <Text
          component="div"
          fz="sm"
          fw={600}
          c="dark.9"
          style={{
            overflowWrap: 'anywhere',
            fontVariantNumeric: numeric ? 'tabular-nums' : undefined,
          }}
        >
          {value}
        </Text>
      )}
    </div>
  );
}

export default AssetFactGrid;
