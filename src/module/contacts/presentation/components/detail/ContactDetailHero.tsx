import { Avatar, Badge, Group, Paper, Stack, Text, Title } from '@mantine/core';
import { useTranslation } from '@/i18n';
import type { Contact } from '@/module/contacts/domain/contact';
import { getContactTypeBadgeConfig } from '@/module/contacts/domain/contactFormat';
import { getInitials } from '@/module/contacts/domain/contactTransactions';
import classes from '@/module/contacts/presentation/pages/DetailContactPage.module.css';

export function ContactDetailHero({ contact }: Readonly<{ contact: Contact }>) {
  const { t } = useTranslation('contactDetail');

  return (
    <Paper withBorder radius="lg" p={{ base: 'md', sm: 'xl' }} className={classes.hero}>
      <Group justify="space-between" align="stretch" gap="xl" className={classes.heroContent}>
        <Group gap="lg" align="flex-start" className={classes.heroIdentity} wrap="nowrap">
          <Avatar
            size={76}
            radius="lg"
            color="primary"
            variant="light"
            className={classes.heroAvatar}
          >
            {getInitials(contact.displayName)}
          </Avatar>
          <Stack gap="xs" className={classes.heroIdentity}>
            <Text fz="xs" fw={700} tt="uppercase" lts="0.08em" c="primary.7">
              {t('contactRecord')}
            </Text>
            <Title order={2} fz={{ base: 23, sm: 30 }} className={classes.heroTitle}>
              {contact.displayName}
            </Title>
            <Group gap="xs">
              {contact.contactType.map((type) => {
                const config = getContactTypeBadgeConfig(type);
                return (
                  <Badge key={type} color={config.color} variant="light">
                    {t(`type.${type}`)}
                  </Badge>
                );
              })}
              <Badge color={contact.deleted ? 'gray' : 'teal'} variant="light">
                {contact.deleted ? t('archived') : t('active')}
              </Badge>
              {contact.contactGroups?.map((group) => (
                <Badge key={group} color="gray" variant="outline">
                  {group}
                </Badge>
              ))}
            </Group>
            <Text fz="sm" c="dimmed">
              {[contact.companyName, contact.emails?.[0], contact.phones?.mobile]
                .filter(Boolean)
                .join(' · ') || t('noPrimaryDetails')}
            </Text>
          </Stack>
        </Group>
        <div className={classes.heroSummary}>
          <Text fz="xs" fw={700} c="dimmed" tt="uppercase">
            {t('contactNumber')}
          </Text>
          <Text fw={750} fz="lg" c="primary.8" mt={4} className={classes.breakValue}>
            {contact.contactNumber || t('notProvided')}
          </Text>
          {contact.external_id && (
            <>
              <Text fz="xs" c="dimmed" mt="md">
                {t('externalCode')}
              </Text>
              <Text fw={600} fz="sm" className={classes.breakValue}>
                {contact.external_id}
              </Text>
            </>
          )}
        </div>
      </Group>
    </Paper>
  );
}
