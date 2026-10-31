import { MemoryRouter } from 'react-router-dom';
import { screen } from '@testing-library/react';
import { render } from '../../../../../test-utils';
import { LoginForm } from './LoginForm';

const renderForm = (onForgotPassword?: () => void) =>
  render(
    <MemoryRouter>
      <LoginForm onSubmit={() => undefined} isPending={false} onForgotPassword={onForgotPassword} />
    </MemoryRouter>
  );

describe('LoginForm forgot password link', () => {
  it('is not shown when password recovery is unavailable', () => {
    renderForm();

    expect(screen.queryByText('Lupa kata sandi?')).toBeNull();
    expect(screen.getByRole('button', { name: /masuk/i })).toBeTruthy();
  });

  it('is shown when a handler is provided', () => {
    renderForm(() => undefined);

    expect(screen.getByText('Lupa kata sandi?')).toBeTruthy();
  });
});
