import { Badge } from '@mantine/core';
import { useTranslation } from '@/i18n';
import {
  advanceStatusTone,
  countStatusTone,
  fundStatusTone,
  reimbursementStatusTone,
  voucherStatusTone,
  type AdvanceStatus,
  type CountStatus,
  type FundStatus,
  type ReimbursementStatus,
  type StatusTone,
  type VoucherStatus,
} from '@/module/petty-cash/domain/pettyCashStatus';

type Props =
  | { kind: 'fund'; status: FundStatus }
  | { kind: 'voucher'; status: VoucherStatus }
  | { kind: 'count'; status: CountStatus }
  | { kind: 'reimbursement'; status: ReimbursementStatus }
  | { kind: 'advance'; status: AdvanceStatus };

const TONE_COLOR: Record<StatusTone, string> = {
  neutral: 'gray',
  info: 'blue',
  warning: 'orange',
  success: 'teal',
  danger: 'red',
  muted: 'gray',
};

const toneOf = (props: Props): StatusTone => {
  switch (props.kind) {
    case 'fund':
      return fundStatusTone[props.status];
    case 'voucher':
      return voucherStatusTone[props.status];
    case 'count':
      return countStatusTone[props.status];
    case 'reimbursement':
      return reimbursementStatusTone[props.status];
    default:
      return advanceStatusTone[props.status];
  }
};

/** One badge for every petty cash document; the color carries the state, the text names it. */
export function PettyCashStatusBadge(props: Readonly<Props>) {
  const { t } = useTranslation('pettyCash');
  const tone = toneOf(props);

  return (
    <Badge
      color={TONE_COLOR[tone]}
      variant={tone === 'muted' ? 'outline' : 'light'}
      radius="sm"
      tt="none"
    >
      {t(`status.${props.kind}.${props.status}`)}
    </Badge>
  );
}
