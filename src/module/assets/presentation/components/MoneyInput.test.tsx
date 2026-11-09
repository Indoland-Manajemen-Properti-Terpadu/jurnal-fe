import { useState } from 'react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { render, screen } from '@test-utils';
import { MoneyInput } from './MoneyInput';

function Harness({
  initial = 0,
  onValue,
}: Readonly<{ initial?: number; onValue?: (v: number) => void }>) {
  const [value, setValue] = useState(initial);
  return (
    <MoneyInput
      label="Harga jual"
      value={value}
      onChange={(next) => {
        setValue(next);
        onValue?.(next);
      }}
    />
  );
}

describe('<MoneyInput />', () => {
  it('shows zero as an empty field with a placeholder, so typing does not start after a 0', async () => {
    const user = userEvent.setup();
    let latest = -1;
    render(
      <Harness
        onValue={(v) => {
          latest = v;
        }}
      />
    );
    const input = screen.getByLabelText('Harga jual') as HTMLInputElement;
    expect(input.value).toBe('');
    expect(input.placeholder).toBe('Rp 0');

    await user.type(input, '23243');
    expect(input.value).toBe('Rp 23.243');
    expect(latest).toBe(23243);
  });

  it('drops a leading zero typed first and refuses a minus sign', async () => {
    const user = userEvent.setup();
    let latest = -1;
    render(
      <Harness
        onValue={(v) => {
          latest = v;
        }}
      />
    );
    const input = screen.getByLabelText('Harga jual') as HTMLInputElement;
    await user.type(input, '-0500');
    expect(input.value).not.toContain('-');
    expect(input.value.replace(/\D/g, '')).toBe('500');
    expect(latest).toBe(500);
  });

  it('reports zero again when the field is cleared', async () => {
    const user = userEvent.setup();
    let latest = -1;
    render(
      <Harness
        initial={1500}
        onValue={(v) => {
          latest = v;
        }}
      />
    );
    const input = screen.getByLabelText('Harga jual') as HTMLInputElement;
    expect(input.value).toBe('Rp 1.500');
    await user.clear(input);
    expect(latest).toBe(0);
    expect(input.value).toBe('');
  });
});
