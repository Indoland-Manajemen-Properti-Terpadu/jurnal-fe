import { backStateOf, readBackState } from './backState';

describe('backStateOf and readBackState', () => {
  it('carries where the person came from and the words for the way back', () => {
    const state = backStateOf(
      '/inventory/stock-movements?tab=history&warehouse=w1',
      'Kembali ke mutasi stok'
    );

    expect(readBackState(state)).toEqual({
      backTo: '/inventory/stock-movements?tab=history&warehouse=w1',
      backLabel: 'Kembali ke mutasi stok',
    });
  });

  it('knows nothing when the page was opened without such a state', () => {
    expect(readBackState(null)).toBeNull();
    expect(readBackState(undefined)).toBeNull();
    expect(readBackState({})).toBeNull();
    expect(readBackState('x')).toBeNull();
  });

  it('only goes back inside the app, never to an address typed into the state', () => {
    expect(readBackState({ backTo: 'https://evil.example', backLabel: 'x' })).toBeNull();
    expect(readBackState({ backTo: '//evil.example', backLabel: 'x' })).toBeNull();
  });

  it('needs the words as well as the address', () => {
    expect(readBackState({ backTo: '/inventory' })).toBeNull();
    expect(readBackState({ backTo: '/inventory', backLabel: '' })).toBeNull();
  });
});
