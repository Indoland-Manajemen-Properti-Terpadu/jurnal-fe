import { describe, expect, it } from 'vitest';
import {
  DOCUMENT_TYPES,
  MAX_DOCUMENT_BYTES,
  validateDocument,
  validateDocuments,
} from '@/module/bank-connection/domain/connectionDocuments';

const file = (name: string, type: string, size = 1024) =>
  new File([new Uint8Array(size)], name, { type });

describe('validateDocument', () => {
  it('allows 15 MB of PDF, PNG or JPG', () => {
    expect(MAX_DOCUMENT_BYTES).toBe(15 * 1024 * 1024);
    expect(validateDocument(file('ktp.pdf', 'application/pdf'))).toBeNull();
    expect(validateDocument(file('ktp.png', 'image/png'))).toBeNull();
    expect(validateDocument(file('ktp.jpg', 'image/jpeg'))).toBeNull();
  });

  it('refuses another kind of file and a file that is too large', () => {
    expect(validateDocument(file('ktp.docx', 'application/msword'))).toBe('wrongType');
    expect(validateDocument(file('ktp.pdf', 'application/pdf', MAX_DOCUMENT_BYTES + 1))).toBe(
      'tooLarge'
    );
  });
});

describe('validateDocuments', () => {
  const pdf = file('a.pdf', 'application/pdf');

  it('names the documents of a new request and asks for both', () => {
    expect(DOCUMENT_TYPES).toEqual(['IDENTITY', 'ACCOUNT_PROOF']);
    expect(validateDocuments({}, [])).toEqual({
      IDENTITY: 'required',
      ACCOUNT_PROOF: 'required',
    });
  });

  it('is complete when both are chosen', () => {
    expect(validateDocuments({ IDENTITY: pdf, ACCOUNT_PROOF: pdf }, [])).toEqual({});
  });

  it('does not ask again for a document the backend already holds', () => {
    expect(validateDocuments({}, ['IDENTITY', 'ACCOUNT_PROOF'])).toEqual({});
    expect(validateDocuments({}, ['IDENTITY'])).toEqual({ ACCOUNT_PROOF: 'required' });
  });

  it('reports a chosen file that cannot be used', () => {
    expect(
      validateDocuments({ IDENTITY: file('x.docx', 'application/msword'), ACCOUNT_PROOF: pdf }, [])
    ).toEqual({ IDENTITY: 'wrongType' });
  });
});
