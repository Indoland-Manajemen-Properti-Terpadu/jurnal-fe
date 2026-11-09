import type {
  AccountOption,
  AccountRef,
  AssetItem,
  AssetJournal,
  AssetSummary,
  AssetTag,
  Paginated,
} from '@/module/assets/domain/asset';
import type {
  AccountRefDto,
  AccountTreeDto,
  AssetDto,
  AssetJournalDto,
  AssetSummaryDto,
  PaginatedDto,
  TagDto,
  TagRefDto,
} from './assetDto';

/** The API sends ISO timestamps; the register works with calendar dates. */
const toDateOnly = (value: string | null | undefined): string | undefined =>
  value ? value.slice(0, 10) : undefined;

const mapAccountRef = (dto: AccountRefDto | undefined): AccountRef | null => {
  if (!dto) return null;
  if (typeof dto === 'string') return { id: dto, accountNumber: '', name: '' };
  return { id: dto.id, accountNumber: dto.accountNumber ?? '', name: dto.name ?? '' };
};

const mapTagRef = (dto: TagRefDto): AssetTag =>
  typeof dto === 'string' ? { id: dto, name: '' } : { id: dto.id, name: dto.name ?? '' };

export const mapAsset = (dto: AssetDto): AssetItem => ({
  id: dto.id,
  code: dto.code,
  name: dto.name,
  categoryCode: dto.categoryCode ?? null,
  categoryName: dto.categoryName ?? null,
  acquisitionDate: toDateOnly(dto.acquisitionDate) ?? '',
  acquisitionCost: dto.acquisitionCost ?? 0,
  residualValue: dto.residualValue ?? 0,
  usefulLifeYears: dto.usefulLifeYears ?? 0,
  depreciationMethod: dto.depreciationMethod ?? 'straight_line',
  accumulatedDepreciation: dto.accumulatedDepreciation ?? 0,
  openingAccumulatedDepreciation: dto.openingAccumulatedDepreciation ?? 0,
  depreciationRatePerYear: dto.depreciationRatePerYear ?? 0,
  depreciationStartDate: toDateOnly(dto.depreciationStartDate),
  netBookValue: dto.netBookValue ?? 0,
  monthlyEstimate: dto.monthlyEstimate ?? 0,
  status: dto.status,
  source: dto.source ?? '',
  notes: dto.notes || undefined,
  tags: (dto.tags ?? []).map(mapTagRef),
  assetAccount: mapAccountRef(dto.assetAccount),
  creditAccount: mapAccountRef(dto.creditAccount),
  accumDeprAccount: mapAccountRef(dto.accumDeprAccount),
  deprExpenseAccount: mapAccountRef(dto.deprExpenseAccount),
  disposalProceedsAccount: mapAccountRef(dto.disposalProceedsAccount),
  disposalGainLossAccount: mapAccountRef(dto.disposalGainLossAccount),
  disposalDate: toDateOnly(dto.disposalDate),
  disposalPrice: dto.disposalPrice ?? undefined,
  disposalGainLoss: dto.disposalGainLoss ?? undefined,
  syncError: dto.proappsSyncError || undefined,
  schedule: (dto.schedule ?? []).map((row) => ({ ...row })),
});

export const mapPaginated = <D, T>(dto: PaginatedDto<D>, map: (d: D) => T): Paginated<T> => ({
  items: (dto.data ?? []).map(map),
  pagination: dto.pagination,
});

export const mapSummary = (dto: AssetSummaryDto): AssetSummary => ({
  totalAcquisitionCost: dto.totalAcquisitionCost ?? 0,
  totalAccumulatedDepreciation: dto.totalAccumulatedDepreciation ?? 0,
  totalNetBookValue: dto.totalNetBookValue ?? 0,
  counts: {
    pending: dto.counts?.pending ?? 0,
    active: dto.counts?.active ?? 0,
    fully_depreciated: dto.counts?.fully_depreciated ?? 0,
    disposed: dto.counts?.disposed ?? 0,
  },
});

export const mapJournal = (dto: AssetJournalDto): AssetJournal => ({
  id: dto.id,
  transactionNumber: dto.transactionNumber,
  date: toDateOnly(dto.transactionDate) ?? '',
  status: dto.status,
  notes: dto.notes ?? '',
  sourceType: dto.sourceType ?? '',
  lines: (dto.transactionDetail ?? []).map((line) => ({
    account: [line.account?.accountNumber, line.account?.name].filter(Boolean).join(' · '),
    debit: line.debit ?? 0,
    credit: line.credit ?? 0,
  })),
});

export const mapTag = (dto: TagDto): AssetTag => ({ id: dto.id, name: dto.name });

/** Flattens the account tree to the accounts a journal can post to. */
export const flattenAccountOptions = (tree: AccountTreeDto[]): AccountOption[] =>
  tree.flatMap((account) => [
    ...(account.isPostable !== false && !account.isArchived && !account.deleted
      ? [
          {
            id: account.id,
            accountNumber: account.accountNumber ?? '',
            name: account.name,
            type: account.type ?? '',
          },
        ]
      : []),
    ...flattenAccountOptions(account.subAccount ?? []),
  ]);
