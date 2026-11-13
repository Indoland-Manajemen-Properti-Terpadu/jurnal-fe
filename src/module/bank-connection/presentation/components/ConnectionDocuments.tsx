import { useState } from 'react';
import { useTranslation } from '@/i18n';
import type {
  DocumentErrors,
  DocumentFiles,
  DocumentType,
} from '@/module/bank-connection/domain/connectionDocuments';
import { DocumentSampleDialog } from '@/module/bank-connection/presentation/components/DocumentSampleDialog';
import { DocumentField } from '@/module/bank-connection/presentation/components/DocumentField';

const FIELDS: Array<{ type: DocumentType; key: 'identity' | 'accountProof' }> = [
  { type: 'IDENTITY', key: 'identity' },
  { type: 'ACCOUNT_PROOF', key: 'accountProof' },
];

/** The two documents the bank asks for: the ID card of the responsible person and proof of the account. */
export function ConnectionDocuments({
  files,
  errors,
  held,
  onChange,
}: Readonly<{
  files: DocumentFiles;
  errors: DocumentErrors;
  /** File names the backend already holds, by document type. */
  held: Partial<Record<DocumentType, string>>;
  onChange: (type: DocumentType, file: File | null) => void;
}>) {
  const { t } = useTranslation('bankConnection');
  const [sample, setSample] = useState<DocumentType | null>(null);
  return (
    <>
      {FIELDS.map(({ type, key }) => (
        <DocumentField
          key={type}
          label={t(`form.documents.${key}.label`)}
          help={t(`form.documents.${key}.help`)}
          buttonLabel={t(`form.documents.${key}.button`)}
          file={files[type] ?? null}
          held={held[type]}
          error={errors[type] ? t(`form.documents.errors.${errors[type]}`) : undefined}
          onChange={(file) => onChange(type, file)}
          onSeeExample={() => setSample(type)}
        />
      ))}
      <DocumentSampleDialog type={sample} onClose={() => setSample(null)} />
    </>
  );
}
