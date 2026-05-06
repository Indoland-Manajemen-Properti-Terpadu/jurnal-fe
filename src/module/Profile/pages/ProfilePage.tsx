import { Container, Card, Avatar, Text, Stack, Group, Title, Divider, Loader, Center, Badge } from '@mantine/core';
import { useGetProfile } from '../service/Profile.service';
import { Envelope, User, ShieldCheck, Calendar, Globe } from '@phosphor-icons/react';
import AppShellLayout from '@/components/AppShellLayout';

export default function ProfilePage() {
  const { data: user, isLoading } = useGetProfile();

  if (isLoading) {
    return (
      <AppShellLayout>
        <Center h="400px">
          <Loader size="xl" />
        </Center>
      </AppShellLayout>
    );
  }

  return (
    <AppShellLayout>
      <Container>
        <Title order={2} mb="lg">My Profile</Title>
        <Card withBorder padding="xl" radius="md" shadow="sm">
          <Stack align="center" gap="xs" mb="xl">
            <Avatar
              src={null}
              size={120}
              radius={120}
              mx="auto"
              color="cyan"
            >
              {user?.name?.charAt(0).toUpperCase()}
            </Avatar>
            <Title order={3}>{user?.name}</Title>
            <Badge color="cyan" variant="light" size="lg">
              {user?.role}
            </Badge>
          </Stack>

          <Divider my="lg" label="Personal Information" labelPosition="center" />

          <Stack gap="sm">
            <Group wrap="nowrap">
              <Envelope size={20} color="gray" weight="duotone" />
              <div>
                <Text size="xs" c="dimmed" fw={700} style={{ textTransform: 'uppercase' }}>
                  Email Address
                </Text>
                <Text size="sm" fw={500}>{user?.email}</Text>
              </div>
            </Group>

            <Group wrap="nowrap">
              <User size={20} color="gray" weight="duotone" />
              <div>
                <Text size="xs" c="dimmed" fw={700} style={{ textTransform: 'uppercase' }}>
                  Full Name
                </Text>
                <Text size="sm" fw={500}>{user?.name}</Text>
              </div>
            </Group>

            <Group wrap="nowrap">
              <Globe size={20} color="gray" weight="duotone" />
              <div>
                <Text size="xs" c="dimmed" fw={700} style={{ textTransform: 'uppercase' }}>
                  Site Name
                </Text>
                <Text size="sm" fw={500}>{user?.site?.name}</Text>
              </div>
            </Group>

            <Group wrap="nowrap">
              <ShieldCheck size={20} color="gray" weight="duotone" />
              <div>
                <Text size="xs" c="dimmed" fw={700} style={{ textTransform: 'uppercase' }}>
                  Account Status
                </Text>
                <Text size="sm" fw={500}>{user?.isEmailVerified ? 'Verified' : 'Unverified'}</Text>
              </div>
            </Group>

            <Group wrap="nowrap">
              <Calendar size={20} color="gray" weight="duotone" />
              <div>
                <Text size="xs" c="dimmed" fw={700} style={{ textTransform: 'uppercase' }}>
                  Joined At
                </Text>
                <Text size="sm" fw={500}>
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('id-ID', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  }) : '-'}
                </Text>
              </div>
            </Group>
          </Stack>
        </Card>
      </Container>
    </AppShellLayout>
  );
}
