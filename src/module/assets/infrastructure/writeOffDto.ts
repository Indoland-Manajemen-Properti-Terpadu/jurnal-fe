import type { AccountRefDto } from './assetDto';

type FileDto = {
  id?: string;
  filePath?: string | null;
  fileName?: string | null;
  mimeType?: string | null;
};

export type WriteOffSignatureDto = {
  title?: string | null;
  name?: string | null;
  role?: string | null;
  signedAt?: string | null;
  state?: string | null;
  image?: FileDto | null;
  note?: string | null;
};

/** `/v1/asset-reports` rows and detail. */
export type WriteOffDto = {
  id: string;
  number?: string | null;
  asset?: string | { id: string } | null;
  type?: string | null;
  status?: string | null;
  incidentDate?: string | null;
  description?: string | null;
  attachments?: FileDto[] | null;
  proceedsAmount?: number | null;
  proceedsAccount?: AccountRefDto | null;
  gainLossAccount?: AccountRefDto | null;
  snapshot?: {
    acquisitionCost?: number | null;
    accumulatedDepreciation?: number | null;
    bookValue?: number | null;
    code?: string;
    name?: string;
    categoryName?: string | null;
    location?: string | null;
    brand?: string | null;
    modelType?: string | null;
    serialNumber?: string | null;
    acquisitionDate?: string | null;
    estimatedGainLoss?: number | null;
  } | null;
  result?: { accumulatedDepreciation?: number; bookValue?: number; gainLoss?: number } | null;
  createdBy?: { id: string; name?: string | null; email?: string | null } | string | null;
  submittedAt?: string | null;
  createdAt?: string | null;
  rejectedAt?: string | null;
  approvals?: Array<{ at?: string | null; note?: string | null }> | null;
  pendingApprovers?: Array<{
    level?: number;
    name?: string | null;
    mode?: string | null;
    roles?: Array<{ id?: string; name?: string | null; approved?: boolean }> | null;
  }> | null;
  signatures?: WriteOffSignatureDto[] | null;
  canDecide?: boolean | null;
};

type RunLineDto = string | { code?: string; assetCode?: string; reason?: string; message?: string };

export type DepreciationRunDto = {
  upTo?: string;
  months?: number;
  amount?: number;
  plan?: Array<{ code?: string; months?: number; from?: string; to?: string; amount?: number }>;
  skipped?: RunLineDto[];
  failed?: RunLineDto[];
};
