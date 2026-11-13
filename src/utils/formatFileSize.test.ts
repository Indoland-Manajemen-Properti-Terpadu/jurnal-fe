import { describe, expect, it } from 'vitest';
import { formatFileSize } from '@/utils/formatFileSize';

describe('formatFileSize', () => {
  it('writes KB below a megabyte (never 0) and MB above', () => {
    expect(formatFileSize(500)).toBe('1 KB');
    expect(formatFileSize(2048)).toBe('2 KB');
    expect(formatFileSize(3 * 1024 * 1024)).toBe('3 MB');
    expect(formatFileSize(1.5 * 1024 * 1024)).toBe('1,5 MB');
  });
});
