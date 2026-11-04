import { AxiosError } from 'axios';
import { matchFailureReason } from './matchErrors';

const failure = (status: number, errors?: string[]) =>
  new AxiosError('Request failed', 'ERR_BAD_REQUEST', undefined, undefined, {
    status,
    statusText: '',
    headers: {},
    config: {} as never,
    data: {
      message: 'All matches failed',
      data: { errors: (errors ?? []).map((error) => ({ error })) },
    },
  });

describe('matchFailureReason', () => {
  it('reads the reason of the first failed match', () => {
    expect(
      matchFailureReason(
        failure(400, ['Amount mismatch: bank statement amount (500000) does not match'])
      )
    ).toBe('amountMismatch');
    expect(
      matchFailureReason(failure(400, ['Some journal details not found or already reconciled']))
    ).toBe('alreadyReconciled');
    expect(matchFailureReason(failure(400, ['Unreconciled bank statement not found']))).toBe(
      'statementNotFound'
    );
  });

  it('does not show a database message for a server error', () => {
    expect(matchFailureReason(failure(500))).toBe('serverError');
  });

  it('falls back to unknown for anything else', () => {
    expect(matchFailureReason(failure(400, ['Something new']))).toBe('unknown');
    expect(matchFailureReason(new Error('offline'))).toBe('unknown');
  });
});
