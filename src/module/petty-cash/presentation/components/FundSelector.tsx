import { Select } from '@mantine/core';
import { IconBuilding } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import type { PettyCashFund } from '@/module/petty-cash/domain/pettyCashEntities';

interface Props {
  funds: PettyCashFund[];
  value: string;
  onChange: (fundId: string) => void;
}

export function FundSelector({ funds, value, onChange }: Readonly<Props>) {
  const { t } = useTranslation('pettyCash');

  return (
    <Select
      aria-label={t('workspace.fund')}
      data={funds.map((fund) => ({ value: fund.id, label: `${fund.code} · ${fund.name}` }))}
      value={value}
      onChange={(next) => next && onChange(next)}
      leftSection={<IconBuilding size={16} />}
      allowDeselect={false}
      searchable
      size="md"
      w={{ base: '100%', sm: 340 }}
    />
  );
}
