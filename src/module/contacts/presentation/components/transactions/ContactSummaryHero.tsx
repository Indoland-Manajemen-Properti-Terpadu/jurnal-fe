import { Avatar, Badge, Box, Group, Paper, Stack, Text, Title } from '@mantine/core';
import { useTranslation } from '@/i18n';
import type { Contact, ContactType } from '@/module/contacts/domain/contact';
import { getContactTypeBadgeConfig } from '@/module/contacts/domain/contactFormat';
import { getInitials } from '@/module/contacts/domain/contactTransactions';
import { formatIDR } from './formatAmount';
import { contactTypeLabel } from '../contactTypeLabel';

type Props = {
  contact: Contact | undefined;
  outstanding: number;
  transactionCount: number;
};

export function ContactSummaryHero({ contact, outstanding, transactionCount }: Readonly<Props>) {
  const { t } = useTranslation('contacts');
  const initials = contact ? getInitials(contact.displayName) : '?';

  return (
    <Paper
      withBorder
      radius="lg"
      p={{ base: 'md', sm: 'xl' }}
      style={{
        background:
          'linear-gradient(135deg, var(--mantine-color-white) 65%, var(--mantine-color-secondary-0) 100%)',
        boxShadow: '0 4px 20px -2px color-mix(in srgb, var(--mantine-color-black) 5%, transparent)',
      }}
    >
      <Group justify="space-between" align="flex-start" wrap="wrap" gap="lg">
        <Group gap="lg" align="flex-start">
          <Avatar
            size={84}
            radius="md"
            color="primary"
            variant="light"
            fw={700}
            fz="var(--jurnal-text-2xl)"
            style={{
              border: '2px solid var(--mantine-color-gray-2)',
              boxShadow:
                '0 4px 12px color-mix(in srgb, var(--mantine-color-black) 5%, transparent)',
            }}
          >
            {initials}
          </Avatar>

          <Box>
            <Group gap="xs" align="center" wrap="wrap">
              <Title order={2} fz={{ base: 22, sm: 26 }} c="primary.9">
                {contact?.displayName || t('transactions.fallbackTitle')}
              </Title>
              {contact?.contactNumber && (
                <Badge variant="light" color="primary" size="md" ff="monospace">
                  {contact.contactNumber}
                </Badge>
              )}
            </Group>

            <Group gap="xs" mt={8} wrap="wrap">
              {contact?.contactType && contact.contactType.length > 0 ? (
                contact.contactType.map((type: ContactType) => (
                  <Badge
                    key={type}
                    variant="filled"
                    color={getContactTypeBadgeConfig(type).color}
                    size="sm"
                    radius="sm"
                  >
                    {contactTypeLabel(t, type)}
                  </Badge>
                ))
              ) : (
                <Badge variant="outline" color="gray" size="sm">
                  {t('types.Pelanggan')}
                </Badge>
              )}

              {contact?.companyName && (
                <Badge variant="outline" color="secondary.8" size="sm">
                  {contact.companyName}
                </Badge>
              )}

              {contact?.emails && contact.emails.length > 0 && (
                <Text size="xs" c="dimmed">
                  • {contact.emails[0]}
                </Text>
              )}
            </Group>
          </Box>
        </Group>

        {/* Quick Outstanding Pill on Hero */}
        <Paper
          withBorder
          p="md"
          radius="md"
          bg="white"
          style={{
            minWidth: 260,
            boxShadow: '0 2px 10px color-mix(in srgb, var(--mantine-color-black) 3%, transparent)',
            border: '1px solid var(--mantine-color-gray-2)',
          }}
        >
          <Stack gap={4} ta={{ base: 'left', sm: 'right' }}>
            <Text size="xs" c="dimmed" fw={700} tt="uppercase" lts={0.5}>
              {t('transactions.outstandingTitle')}
            </Text>
            <Text
              fz="var(--jurnal-text-2xl)"
              fw={800}
              c={outstanding > 0 ? 'orange.8' : 'teal.8'}
              style={{ fontVariantNumeric: 'tabular-nums' }}
            >
              {formatIDR(outstanding)}
            </Text>
            <Text size="xs" c="dimmed">
              {t('transactions.outstandingNote', { count: transactionCount })}
            </Text>
          </Stack>
        </Paper>
      </Group>
    </Paper>
  );
}
