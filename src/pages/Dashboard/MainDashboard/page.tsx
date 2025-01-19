import React from 'react';
import PageHeader from '@/components/PageHeader/PageHeader';
import {
  ActionIcon,
  Anchor,
  Container,
  Group,
  Paper,
  PaperProps,
  Stack,
  Text,
} from '@mantine/core';
import { IconDotsVertical } from '@tabler/icons-react';
import MainDashboardLayout from '../layout';

const items = [
  { title: 'Settings', href: '#' },
  { title: 'User Management', href: '#' },
].map((item, index) => (
  <Anchor href={item.href} key={index}>
    {item.title}
  </Anchor>
));

const PAPER_PROPS: PaperProps = {
  p: 'md',
  shadow: 'md',
  radius: 'md',
};

function MainDashboard() {
  

  return (
    <MainDashboardLayout>
      <Container fluid>
        <Stack gap="lg">
          <Paper {...PAPER_PROPS}>
            <PageHeader
              title="Main Dashboard"
              breadcrumbItems={items}
              withActions={true}
            />
          </Paper>
          <Paper {...PAPER_PROPS}>
            <Group justify="space-between" mb="md">
              <Text fz="lg" fw={600}>
                User Management
              </Text>
              <ActionIcon>
                <IconDotsVertical size={18} />
              </ActionIcon>
            </Group>
            {/* <UserTable
              data={invoicesData}
              error={invoicesError}
              loading={invoicesLoading}
            /> */}
          </Paper>
        </Stack>
      </Container>
    </MainDashboardLayout>
  );
}

export default MainDashboard;
