import { MemoryRouter } from 'react-router-dom';
import { render, screen, userEvent } from '@test-utils';
import { LoginForm } from './LoginForm';

const renderForm = (onForgotPassword = () => undefined) =>
  render(
    <MemoryRouter>
      <LoginForm onSubmit={() => undefined} isPending={false} onForgotPassword={onForgotPassword} />
    </MemoryRouter>
  );

describe('LoginForm secondary sign-in options', () => {
  it('shows Google sign-in without running an action', async () => {
    renderForm();

    const google = screen.getByRole('button', { name: 'Masuk dengan Google' });
    expect(google).toBeEnabled();
    await userEvent.click(google);
    expect(screen.getByRole('heading', { name: 'Selamat datang kembali' })).toBeInTheDocument();
  });

  it('opens password recovery without submitting login', async () => {
    const onForgotPassword = vi.fn();
    renderForm(onForgotPassword);

    await userEvent.click(screen.getByRole('button', { name: 'Lupa kata sandi?' }));
    expect(onForgotPassword).toHaveBeenCalledOnce();
  });
});
