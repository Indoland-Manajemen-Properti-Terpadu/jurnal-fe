import { vi } from 'vitest';
import { render, screen, userEvent } from '@test-utils';
import { DefaultButton } from '@/components/Button';

describe('<DefaultButton />', () => {
  it('renders its label as an accessible button', () => {
    render(<DefaultButton>Save</DefaultButton>);

    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
  });

  it('calls onClick once when clicked', async () => {
    const onClick = vi.fn();
    render(<DefaultButton onClick={onClick}>Save</DefaultButton>);

    await userEvent.click(screen.getByRole('button', { name: 'Save' }));

    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
