import { PURCHASE_MENU } from '@/module/purchases/domain/purchaseAccess';
import { requestActions } from '@/module/purchases/domain/purchaseActions';
import type { PurchaseRequest } from '@/module/purchases/domain/purchaseRequest';
import { canCreateRequest, requestRights } from '@/module/purchases/domain/requestAccess';

const holding =
  (...granted: string[]) =>
  (menu: string, action: string) =>
    granted.includes(`${menu}:${action}`);

const doc = (status: string) => ({ status }) as unknown as PurchaseRequest;

describe('requestRights', () => {
  const requester = holding(
    `${PURCHASE_MENU.request}:update`,
    `${PURCHASE_MENU.request}:delete`,
    `${PURCHASE_MENU.request}:create`
  );
  const accounting = holding(
    `${PURCHASE_MENU.requestVerify}:read`,
    `${PURCHASE_MENU.requestVerify}:update`,
    `${PURCHASE_MENU.requestVerify}:delete`
  );

  it('lets a requester edit and cancel their own request but not decide on it', () => {
    expect(requestRights(requester, true)).toEqual({ edit: true, cancel: true, decide: false });
  });

  it('keeps a requester away from a request that is not theirs', () => {
    expect(requestRights(requester, false)).toEqual({ edit: false, cancel: false, decide: false });
  });

  it('lets Accounting verify and cancel any request but not edit it', () => {
    expect(requestRights(accounting, false)).toEqual({ edit: false, cancel: true, decide: true });
  });

  it('only a role with the create right may start a request', () => {
    expect(canCreateRequest(requester)).toBe(true);
    expect(canCreateRequest(accounting)).toBe(false);
  });
});

describe('requestActions', () => {
  it('lets the requester edit, submit and attach while it is a draft or sent back', () => {
    for (const status of ['DRAFT', 'RETURNED']) {
      expect(requestActions(doc(status))).toMatchObject({
        edit: true,
        submit: true,
        attach: true,
        verify: false,
      });
    }
  });

  it('asks Accounting to verify only a submitted request', () => {
    expect(requestActions(doc('SUBMITTED'))).toMatchObject({
      verify: true,
      return: true,
      edit: false,
      submit: false,
      attach: false,
    });
  });

  it('sends back only a submitted request: a verified one can no longer be returned', () => {
    expect(requestActions(doc('SUBMITTED')).return).toBe(true);
    expect(requestActions(doc('VERIFIED'))).toMatchObject({ verify: false, return: false });
  });

  it('closes every action once procurement has started or the request ended', () => {
    for (const status of ['IN_PROCUREMENT', 'COMPLETED', 'CANCELLED']) {
      expect(requestActions(doc(status))).toEqual({
        edit: false,
        submit: false,
        attach: false,
        verify: false,
        return: false,
        cancel: false,
      });
    }
  });
});
