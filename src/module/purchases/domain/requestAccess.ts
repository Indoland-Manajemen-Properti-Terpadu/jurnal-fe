import {
  PURCHASE_MENU,
  type MenuAction,
  type PurchaseMenu,
} from '@/module/purchases/domain/purchaseAccess';

type Can = (menu: PurchaseMenu, action: MenuAction) => boolean;

const M = PURCHASE_MENU;

/**
 * Who may do what with an FPPBJ. The requester works on their own request; Accounting (the
 * verification menu) verifies or returns any request and may cancel one. The service has the last
 * word and a refusal is shown politely.
 */
export const requestRights = (can: Can, isOwner: boolean) => ({
  edit: isOwner && can(M.request, 'update'),
  cancel: (isOwner && can(M.request, 'delete')) || can(M.requestVerify, 'delete'),
  decide: can(M.requestVerify, 'update'),
});

export const canCreateRequest = (can: Can): boolean => can(M.request, 'create');

/** Accounting sees every request; a requester only their own, which the service already filters. */
export const canSeeAllRequests = (can: Can): boolean => can(M.requestVerify, 'read');
