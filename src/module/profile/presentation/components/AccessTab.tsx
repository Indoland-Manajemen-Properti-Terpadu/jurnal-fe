import {
  Accordion,
  Alert,
  Badge,
  Group,
  Paper,
  SimpleGrid,
  Stack,
  Table,
  Text,
  ThemeIcon,
  VisuallyHidden,
} from '@mantine/core';
import { IconCheck, IconInfoCircle, IconListCheck, IconShieldLock } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import {
  RIGHT_TYPES,
  rightsOf,
  splitMenus,
  type MyAccess,
  type RightType,
} from '../../domain/access';
import type { Profile } from '../../domain/profile';
import { SectionCard } from './SectionCard';

type AccessTabProps = {
  user: Profile;
  access: MyAccess;
};

const pill = {
  tt: 'none',
  radius: 'sm',
  styles: { root: { maxWidth: 'none', overflow: 'visible' }, label: { overflow: 'visible' } },
} as const;

export function AccessTab({ user, access }: Readonly<AccessTabProps>) {
  const { t } = useTranslation('profile');
  const { granted, none } = splitMenus(access);
  const label = (type: RightType) => t(`access.right.${type}`);

  return (
    <Stack gap="lg">
      {access.isSuperAdmin && (
        <Alert color="blue" variant="light" radius="md" icon={<IconInfoCircle size={18} />}>
          {t('access.superAdminNote')}
        </Alert>
      )}

      {user.roles.length > 0 && (
        <SectionCard
          icon={IconShieldLock}
          title={t('access.rolesTitle')}
          subtitle={t('access.rolesSubtitle')}
        >
          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
            {user.roles.map((role) => (
              <Paper key={role.id} withBorder shadow="none" radius="md" p="sm" bg="gray.0">
                <Group gap="xs" mb={role.description ? 4 : 0}>
                  <ThemeIcon size={22} radius="md" variant="light" color="primary">
                    <IconShieldLock size={14} />
                  </ThemeIcon>
                  <Text size="sm" fw={600} c="primary.9">
                    {role.name}
                  </Text>
                </Group>
                {role.description && (
                  <Text size="xs" c="dimmed" lineClamp={2}>
                    {role.description.split('\n')[0]}
                  </Text>
                )}
              </Paper>
            ))}
          </SimpleGrid>
        </SectionCard>
      )}

      {!access.isSuperAdmin && user.roles.length === 0 && (
        <SectionCard
          icon={IconShieldLock}
          title={t('access.rolesTitle')}
          subtitle={t('access.rolesSubtitle')}
        >
          <Text size="sm" c="dimmed">
            {t('access.rolesEmpty')}
          </Text>
        </SectionCard>
      )}

      <SectionCard
        icon={IconListCheck}
        title={t('access.menusTitle')}
        subtitle={t('access.menusSubtitle', { count: granted.length })}
      >
        {granted.length === 0 ? (
          <Text size="sm" c="dimmed">
            {t('access.menusEmpty')}
          </Text>
        ) : (
          <Paper withBorder shadow="none" radius="md" bg="white" p={0} style={{ overflow: 'hidden' }}>
            <Table.ScrollContainer minWidth={420}>
              <Table highlightOnHover verticalSpacing="sm" horizontalSpacing="md">
                <Table.Thead bg="gray.0">
                  <Table.Tr>
                    <Table.Th scope="col">{t('access.menu')}</Table.Th>
                    {RIGHT_TYPES.map((type) => (
                      <Table.Th key={type} scope="col" ta="center" w={90}>
                        {label(type)}
                      </Table.Th>
                    ))}
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {granted.map((menu) => {
                    const held = rightsOf(menu);
                    return (
                      <Table.Tr key={menu.menuId}>
                        <Table.Td>
                          <Text size="sm" fw={600} c="primary.9">
                            {menu.name}
                          </Text>
                        </Table.Td>
                        {RIGHT_TYPES.map((type) => (
                          <Table.Td key={type} ta="center">
                            {access.isSuperAdmin || held.includes(type) ? (
                              <ThemeIcon size={22} radius="xl" variant="light" color="teal">
                                <IconCheck size={14} />
                                <VisuallyHidden>
                                  {t('access.hasRight', { menu: menu.name, action: label(type) })}
                                </VisuallyHidden>
                              </ThemeIcon>
                            ) : (
                              <Text span c="dimmed" aria-hidden="true">
                                –
                              </Text>
                            )}
                            {!access.isSuperAdmin && !held.includes(type) && (
                              <VisuallyHidden>
                                {t('access.noRight', { menu: menu.name, action: label(type) })}
                              </VisuallyHidden>
                            )}
                          </Table.Td>
                        ))}
                      </Table.Tr>
                    );
                  })}
                </Table.Tbody>
              </Table>
            </Table.ScrollContainer>
          </Paper>
        )}

        {none.length > 0 && (
          <Accordion variant="contained" radius="md" chevronPosition="right">
            <Accordion.Item value="none">
              <Accordion.Control>
                <Text size="sm" fw={500} c="dimmed">
                  {t('access.noneTitle', { count: none.length })}
                </Text>
              </Accordion.Control>
              <Accordion.Panel>
                <Group gap={6}>
                  {none.map((menu) => (
                    <Badge key={menu.menuId} variant="light" color="gray" {...pill}>
                      {menu.name}
                    </Badge>
                  ))}
                </Group>
              </Accordion.Panel>
            </Accordion.Item>
          </Accordion>
        )}
      </SectionCard>
    </Stack>
  );
}
