import { Anchor, Box, Group, Text } from '@mantine/core';
import type { Icon } from '@tabler/icons-react';
import { Link } from 'react-router-dom';
import type { PurchaseStatus } from '@/module/purchases/domain/purchaseStatus';
import { SectionCard } from '@/module/purchases/presentation/components/shared/SectionCard';
import { StatusBadge } from '@/module/purchases/presentation/components/shared/StatusBadge';

export interface RelatedDoc {
  id: string;
  number: string;
  status: PurchaseStatus | string;
  statusLabel?: string;
  to: string;
  /** A dimmed line under the number: the vendor, the date. */
  sub?: string;
  /** Right aligned: an amount. */
  trailing?: string;
}

interface RelatedDocsCardProps {
  icon: Icon;
  title: string;
  subtitle: string;
  /** "2 dokumen". */
  count: string;
  docs: RelatedDoc[];
  emptyText: string;
}

/** The documents made from this one ("Faktur pembelian", "Pembayaran"), each a link with its status. */
export const RelatedDocsCard = ({
  icon,
  title,
  subtitle,
  count,
  docs,
  emptyText,
}: Readonly<RelatedDocsCardProps>) => (
  <SectionCard icon={icon} flush title={title} subtitle={subtitle} count={count}>
    {docs.length === 0 ? (
      <Box px="lg" py="md">
        <Text size="sm" c="dimmed">
          {emptyText}
        </Text>
      </Box>
    ) : (
      docs.map((doc, index) => (
        <Group
          key={doc.id}
          justify="space-between"
          wrap="nowrap"
          px="lg"
          py="sm"
          style={
            index > 0 ? { borderTop: '1px solid var(--jurnal-color-border-subtle)' } : undefined
          }
        >
          <div style={{ minWidth: 0 }}>
            <Anchor component={Link} to={doc.to} size="sm" fw={700}>
              {doc.number}
            </Anchor>
            {doc.sub && (
              <Text size="xs" c="dimmed">
                {doc.sub}
              </Text>
            )}
          </div>
          <Group gap="sm" wrap="nowrap">
            {doc.trailing && (
              <Text size="sm" fw={600} style={{ fontVariantNumeric: 'tabular-nums' }}>
                {doc.trailing}
              </Text>
            )}
            <StatusBadge status={doc.status as PurchaseStatus} label={doc.statusLabel} />
          </Group>
        </Group>
      ))
    )}
  </SectionCard>
);
