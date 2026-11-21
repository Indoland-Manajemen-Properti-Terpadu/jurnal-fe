import { sendOrderInput, validateSend } from '@/module/purchases/domain/orderSend';

const email = { mode: 'email' as const, to: '', cc: [], note: '' };

describe('validateSend', () => {
  it('has nothing to check when the order is only marked as sent', () => {
    expect(validateSend({ mode: 'mark', to: 'bukan-email', cc: ['x'], note: '' }, [])).toEqual({});
  });

  it('accepts the vendor email on file, or an address typed here', () => {
    expect(validateSend(email, ['v@vendor.id'])).toEqual({});
    expect(validateSend({ ...email, to: 'a@b.co' }, [])).toEqual({});
  });

  it('asks for an address when the vendor has none, and refuses a malformed one', () => {
    expect(validateSend(email, [])).toEqual({ to: 'toRequired' });
    expect(validateSend({ ...email, to: 'bukan-email' }, ['v@vendor.id'])).toEqual({
      to: 'toInvalid',
    });
  });

  it('refuses a malformed copy address', () => {
    expect(validateSend({ ...email, cc: ['ok@x.id', 'salah'] }, ['v@vendor.id'])).toEqual({
      cc: 'ccInvalid',
    });
  });
});

describe('sendOrderInput', () => {
  it('marks as sent without an email and keeps a note only when there is one', () => {
    expect(sendOrderInput({ mode: 'mark', to: 'x', cc: ['y'], note: '  ' })).toEqual({
      sendEmail: false,
    });
    expect(sendOrderInput({ mode: 'mark', to: '', cc: [], note: ' WA ' })).toEqual({
      sendEmail: false,
      note: 'WA',
    });
  });

  it('mails to the typed address and copies, leaving out what is blank', () => {
    expect(sendOrderInput(email)).toEqual({ sendEmail: true });
    expect(
      sendOrderInput({ mode: 'email', to: ' a@b.co ', cc: [' c@d.co '], note: 'Mohon konfirmasi' })
    ).toEqual({ sendEmail: true, to: 'a@b.co', cc: ['c@d.co'], note: 'Mohon konfirmasi' });
  });
});
