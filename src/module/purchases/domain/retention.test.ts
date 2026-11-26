import { describe, expect, it } from 'vitest';
import {
  canReleaseRetention,
  retentionTiming,
  taskKind,
  type RetentionRow,
} from '@/module/purchases/domain/retention';

const row = (patch: Partial<RetentionRow> = {}): RetentionRow => ({
  purchaseOrderId: 'po1',
  number: 'SPK/1',
  vendorName: 'PT A',
  isService: true,
  status: 'MAINTENANCE',
  percent: 5,
  maintenanceMonths: 1,
  total: 50,
  held: 50,
  released: 0,
  balance: 50,
  state: 'HELD',
  stateLabel: 'Retensi ditahan',
  maintenanceFrom: '2026-11-25',
  releasableFrom: '2026-12-25',
  reminderDate: '2026-11-25',
  daysLeft: 30,
  releaseBillId: null,
  ...patch,
});

describe('retentionTiming', () => {
  it('counts the days still to wait while the money is held', () => {
    expect(retentionTiming(row())).toEqual({ kind: 'waiting', days: 30 });
  });

  it('says the retention is ready once the maintenance period is over', () => {
    expect(retentionTiming(row({ state: 'RELEASABLE', daysLeft: 0 }))).toEqual({ kind: 'ready' });
  });

  it('shows nothing for retention that is not held or has been released', () => {
    expect(retentionTiming(row({ state: 'RELEASED', daysLeft: null }))).toBeNull();
    expect(retentionTiming(row({ state: 'NONE', daysLeft: null }))).toBeNull();
  });

  it('shows nothing when the service sent no days for a held amount', () => {
    expect(retentionTiming(row({ daysLeft: null }))).toBeNull();
  });
});

describe('canReleaseRetention', () => {
  it('only a releasable row with a balance and no release bill yet', () => {
    expect(canReleaseRetention(row({ state: 'RELEASABLE' }))).toBe(true);
    expect(canReleaseRetention(row())).toBe(false);
    expect(canReleaseRetention(row({ state: 'RELEASABLE', balance: 0 }))).toBe(false);
    expect(canReleaseRetention(row({ state: 'RELEASABLE', releaseBillId: 'b1' }))).toBe(false);
  });
});

describe('taskKind', () => {
  it('knows the two task types and falls back for a new one', () => {
    expect(taskKind('REQUEST_FINAL_HANDOVER')).toBe('requestHandover');
    expect(taskKind('RELEASE_RETENTION')).toBe('release');
    expect(taskKind('SOMETHING_NEW')).toBe('other');
  });
});
