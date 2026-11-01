import {
  Accordion,
  Alert,
  Badge,
  Group,
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
        <Alert color="blue" variant="light" icon={<IconInfoCircle size={18} />}>
          {t('access.superAdminNote')}
        </Alert>
      )}

      <SectionCard
        icon={IconShieldLock}
        title={t('access.rolesTitle')}
        subtitle={t('access.rolesSubtitle')}
      >
        {user.roles.length === 0 ? (
          <Text size="sm" c="dimmed">
            {t('access.rolesEmpty')}
          </Text>
        ) : (
          <Stack gap="sm">
            {user.roles.map((role) => (
              <div key={role.id}>
                <Text size="sm" fw={600}>
                  {role.name}
                </Text>
                {role.description && (
                  <Text size="xs" c="dimmed" lineClamp={2}>
                    {role.description.split('\n')[0]}
                  </Text>
                )}
              </div>
            ))}
          </Stack>
        )}
      </SectionCard>

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
          <Table.ScrollContainer minWidth={420}>
            <Table verticalSpacing="xs">
              <Table.Thead>
                <Table.Tr>
                  <Table.Th scope="col">{t('access.menu')}</Table.Th>
                  {RIGHT_TYPES.map((type) => (
                    <Table.Th key={type} scope="col" ta="center">
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
                        <Text size="sm" fw={500}>
                          {menu.name}
                        </Text>
                      </Table.Td>
                      {RIGHT_TYPES.map((type) => (
                        <Table.Td key={type} ta="center">
                          {access.isSuperAdmin || held.includes(type) ? (
                            <ThemeIcon size={22} radius="xl" variant="light" color="green">
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
        )}

        {none.length > 0 && (
          <Accordion variant="default" chevronPosition="left">
            <Accordion.Item value="none">
              <Accordion.Control>{t('access.noneTitle', { count: none.length })}</Accordion.Control>
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
