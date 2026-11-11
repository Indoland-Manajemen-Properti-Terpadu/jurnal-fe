import { TextInput, type TextInputProps } from '@mantine/core';
import { digitsOnly } from '@/module/contacts/domain/contactInput';

type Props = Omit<TextInputProps, 'onChange' | 'value'> & {
  value: string;
  onValueChange: (value: string) => void;
  /** Cleans what was typed or pasted; defaults to digits only. */
  sanitize?: (value: string) => string;
  numeric?: boolean;
};

/** Text input that drops disallowed characters as they are typed or pasted. */
export function SanitizedInput({
  value,
  onValueChange,
  sanitize = digitsOnly,
  numeric = true,
  maxLength,
  ...rest
}: Readonly<Props>) {
  return (
    <TextInput
      {...rest}
      type="text"
      inputMode={numeric ? 'numeric' : undefined}
      autoComplete="off"
      maxLength={maxLength}
      value={value}
      onChange={(event) => {
        const next = sanitize(event.currentTarget.value);
        onValueChange(maxLength ? next.slice(0, maxLength) : next);
      }}
    />
  );
}
