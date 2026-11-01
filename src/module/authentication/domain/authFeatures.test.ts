import { FORGOT_PASSWORD_ENABLED } from './authFeatures';

describe('authFeatures', () => {
  it('keeps password recovery off until the backend endpoint exists', () => {
    expect(FORGOT_PASSWORD_ENABLED).toBe(false);
  });
});
