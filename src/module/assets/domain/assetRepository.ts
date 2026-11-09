import type {
  AccountOption,
  ActivationValues,
  AssetFormValues,
  AssetItem,
  AssetJournal,
  AssetListParams,
  AssetSummary,
  AssetTag,
  DisposalValues,
  Paginated,
} from '@/module/assets/domain/asset';
import type { AssetEditRights } from '@/module/assets/domain/assetRules';

/** Port for the fixed asset register held by the API. */
export interface AssetRepository {
  list: (params: AssetListParams) => Promise<Paginated<AssetItem>>;
  get: (id: string) => Promise<AssetItem>;
  summary: () => Promise<AssetSummary>;
  journals: (id: string) => Promise<AssetJournal[]>;
  tags: () => Promise<AssetTag[]>;
  accounts: () => Promise<AccountOption[]>;
  /** Without `activation` the asset waits as pending; with it the asset is booked at once. */
  create: (values: AssetFormValues, activation?: ActivationValues) => Promise<AssetItem>;
  /** Sends only the fields `rights` allows for this asset. */
  update: (id: string, values: AssetFormValues, rights: AssetEditRights) => Promise<AssetItem>;
  activate: (id: string, values: ActivationValues) => Promise<AssetItem>;
  /** Changes the accounts and depreciation of an active asset. */
  reviseActivation: (id: string, values: ActivationValues) => Promise<AssetItem>;
  dispose: (id: string, values: DisposalValues) => Promise<AssetItem>;
}
