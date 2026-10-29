import { PurchaseBill } from './purchase';

/** Persistence port for purchase bills. `save` throws when the bills could not be stored. */
export interface PurchaseRepository {
  load: () => PurchaseBill[];
  save: (bills: PurchaseBill[]) => void;
}
