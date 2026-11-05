import { describe, expect, it } from 'vitest';
import { MAX_FILES, MAX_FILE_BYTES, validateAttachments } from './saleFiles';

const file = (size: number) => ({ size }) as File;

describe('validateAttachments', () => {
  it('accepts up to five files of up to 5 MB each', () => {
    expect(validateAttachments([])).toBeNull();
    expect(
      validateAttachments(Array.from({ length: MAX_FILES }, () => file(MAX_FILE_BYTES)))
    ).toBeNull();
  });

  it('refuses a sixth file', () => {
    expect(validateAttachments(Array.from({ length: MAX_FILES + 1 }, () => file(1)))).toBe(
      'validation.filesTooMany'
    );
  });

  it('refuses a file above 5 MB', () => {
    expect(validateAttachments([file(MAX_FILE_BYTES + 1)])).toBe('validation.fileTooLarge');
  });
});
