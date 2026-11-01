import { serverMessage } from './serverMessage';

describe('serverMessage', () => {
  it('reads the message of an HTTP error response', () => {
    expect(serverMessage({ response: { data: { message: 'Tidak bisa' } } })).toBe('Tidak bisa');
  });

  it('is undefined without a usable message', () => {
    expect(serverMessage(new Error('network'))).toBeUndefined();
    expect(serverMessage({ response: { data: { message: '' } } })).toBeUndefined();
    expect(serverMessage({ response: { data: { message: 42 } } })).toBeUndefined();
    expect(serverMessage(null)).toBeUndefined();
    expect(serverMessage('boom')).toBeUndefined();
  });
});
