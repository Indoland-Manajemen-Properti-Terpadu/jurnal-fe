import { describe, expect, it } from 'vitest';
import {
  CONNECTION_STATUSES,
  blocksNewRequest,
  connectionStep,
  isEditable,
  isLive,
  isTerminal,
  resolveNextAction,
  statusTone,
} from '@/module/bank-connection/domain/connectionStatus';

describe('connectionStep', () => {
  it('maps every status to the step the user is on, or none once the request is over', () => {
    expect(connectionStep('DRAFT')).toBe(1);
    expect(connectionStep('NEEDS_REVISION')).toBe(1);
    expect(connectionStep('SUBMITTED')).toBe(2);
    expect(connectionStep('IN_REVIEW')).toBe(2);
    expect(connectionStep('AWAITING_SIGNATURE')).toBe(3);
    expect(connectionStep('SIGNED')).toBe(3);
    expect(connectionStep('ACTIVE')).toBe(4);
    expect(connectionStep('ERROR')).toBe(4);
    expect(connectionStep('REVOKED')).toBeNull();
    expect(connectionStep('CANCELLED')).toBeNull();
    expect(connectionStep('REJECTED')).toBeNull();
  });

  it('covers every status', () => {
    CONNECTION_STATUSES.forEach((status) => {
      expect(() => connectionStep(status)).not.toThrow();
    });
  });
});

describe('status groups', () => {
  it('lets the user edit only a draft or a request sent back', () => {
    expect(CONNECTION_STATUSES.filter(isEditable)).toEqual(['DRAFT', 'NEEDS_REVISION']);
  });

  it('shows the connected view for a live connection, even a paused or failing one', () => {
    expect(CONNECTION_STATUSES.filter(isLive)).toEqual(['ACTIVE', 'SUSPENDED', 'ERROR', 'EXPIRED']);
  });

  it('treats a rejected, revoked or cancelled request as over, so a new one can start', () => {
    expect(CONNECTION_STATUSES.filter(isTerminal)).toEqual(['REJECTED', 'REVOKED', 'CANCELLED']);
  });

  it('colors a status by what it asks of the user', () => {
    expect(statusTone('ACTIVE')).toBe('ok');
    expect(statusTone('IN_REVIEW')).toBe('info');
    expect(statusTone('AWAITING_SIGNATURE')).toBe('warn');
    expect(statusTone('EXPIRED')).toBe('warn');
    expect(statusTone('ERROR')).toBe('bad');
    expect(statusTone('REJECTED')).toBe('bad');
    expect(statusTone('REVOKED')).toBe('neutral');
  });
});

describe('resolveNextAction', () => {
  it('trusts the action the server names', () => {
    expect(resolveNextAction('IN_REVIEW', 'SIGN')).toBe('SIGN');
  });

  it('falls back to the status when the server names none', () => {
    expect(resolveNextAction('DRAFT')).toBe('FILL_FORM');
    expect(resolveNextAction('NEEDS_REVISION')).toBe('FIX_FORM');
    expect(resolveNextAction('IN_REVIEW')).toBe('WAIT_REVIEW');
    expect(resolveNextAction('AWAITING_SIGNATURE')).toBe('SIGN');
    expect(resolveNextAction('SIGNED')).toBe('WAIT_BANK');
    expect(resolveNextAction('EXPIRED')).toBe('RECONNECT');
    expect(resolveNextAction('ACTIVE')).toBe('NONE');
  });
});

describe('blocksNewRequest', () => {
  it('blocks a second request while one is open or live, but not once it is over or expired', () => {
    expect(CONNECTION_STATUSES.filter(blocksNewRequest)).toEqual([
      'DRAFT',
      'SUBMITTED',
      'IN_REVIEW',
      'NEEDS_REVISION',
      'AWAITING_SIGNATURE',
      'SIGNED',
      'ACTIVE',
      'SUSPENDED',
      'ERROR',
    ]);
  });
});
