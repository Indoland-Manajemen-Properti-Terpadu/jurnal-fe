import { describe, expect, it } from 'vitest';
import {
  MAX_ATTACHMENT_BYTES,
  addAttachments,
  formatFileSize,
  removeAttachment,
} from '@/module/bank-cash/domain/attachments';

const file = (name: string, size = 10) => new File([new Uint8Array(size)], name);

describe('attachments', () => {
  it('allows 30 MB per file, as the manual journal does', () => {
    expect(MAX_ATTACHMENT_BYTES).toBe(30 * 1024 * 1024);
  });

  it('adds new files after the ones already chosen', () => {
    const result = addAttachments([file('a.pdf')], [file('b.png')]);
    expect(result.map((f) => f.name)).toEqual(['a.pdf', 'b.png']);
  });

  it('does not add the same file twice (same name and size)', () => {
    const result = addAttachments([file('a.pdf', 5)], [file('a.pdf', 5), file('a.pdf', 6)]);
    expect(result.map((f) => `${f.name}:${f.size}`)).toEqual(['a.pdf:5', 'a.pdf:6']);
  });

  it('removes one file by its place in the list', () => {
    const files = [file('a.pdf'), file('b.png'), file('c.jpg')];
    expect(removeAttachment(files, 1).map((f) => f.name)).toEqual(['a.pdf', 'c.jpg']);
  });

  it('writes a size people read: KB below a megabyte, MB above', () => {
    expect(formatFileSize(500)).toBe('1 KB');
    expect(formatFileSize(2048)).toBe('2 KB');
    expect(formatFileSize(3 * 1024 * 1024)).toBe('3 MB');
    expect(formatFileSize(1.5 * 1024 * 1024)).toBe('1,5 MB');
  });
});
