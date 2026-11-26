import { activityTone } from './activityLog';

describe('activityTone', () => {
  it('reads an approval as positive, whatever the tense or case', () => {
    expect(activityTone('APPROVE')).toBe('positive');
    expect(activityTone('approved')).toBe('positive');
    expect(activityTone('VERIFY')).toBe('positive');
  });

  it('reads a refusal, a send-back or a cancellation as negative', () => {
    expect(activityTone('REJECT')).toBe('negative');
    expect(activityTone('REJECTED')).toBe('negative');
    expect(activityTone('RETURN')).toBe('warning');
    expect(activityTone('CANCEL')).toBe('negative');
    expect(activityTone('WITHDRAW')).toBe('negative');
  });

  it('leaves the other actions neutral', () => {
    expect(activityTone('CREATE')).toBeUndefined();
    expect(activityTone('SUBMIT')).toBeUndefined();
  });
});
