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
  const selected = funds.find((fund) => fund.id === value);

  return (
    <Select
      label={t('workspace.fund')}
      description={selected ? `${selected.code} · ${selected.custodian.name}` : undefined}
      data={funds.map((fund) => ({ value: fund.id, label: `${fund.code} · ${fund.name}` }))}
      value={value}
      onChange={(next) => next && onChange(next)}
      leftSection={<IconBuilding size={16} />}
      allowDeselect={false}
      searchable
      w={{ base: '100%', sm: 380 }}
    />
  );
}
