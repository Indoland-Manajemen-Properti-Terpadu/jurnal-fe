import { Group, Paper, SimpleGrid, Text, ThemeIcon } from '@mantine/core';
import {
  IconAddressBook,
  IconBriefcase,
  IconHome2,
  IconTruckDelivery,
  IconUserCheck,
} from '@tabler/icons-react';

type ContactStatsProps = {
  total: number;
  customers: number;
  suppliers: number;
  employees: number;
  units?: number;
};

export function ContactStatsGrid({
  total,
  customers,
  suppliers,
  employees,
  units = 0,
}: Readonly<ContactStatsProps>) {
  const stats = [
    {
      title: 'Total Kontak',
      value: total,
      description: 'Seluruh entitas terdaftar',
      icon: IconAddressBook,
      color: 'primary',
    },
    {
      title: 'Pelanggan',
      value: customers,
      description: 'Piutang & penjualan',
      icon: IconUserCheck,
      color: 'teal',
    },
    {
      title: 'Pemasok / Vendor',
      value: suppliers,
      description: 'Hutang & pengadaan',
      icon: IconTruckDelivery,
      color: 'blue',
    },
    {
      title: 'Karyawan',
      value: employees,
      description: 'Staf internal',
      icon: IconBriefcase,
      color: 'indigo',
    },
    {
      title: 'Unit',
      value: units,
      description: 'Penghuni & properti',
      icon: IconHome2,
      color: 'cyan',
    },
  ];

  return (
    <SimpleGrid cols={{ base: 1, sm: 2, md: 5 }} spacing="md">
      {stats.map((stat) => {
        const StatIcon = stat.icon;
        return (
          <Paper
            key={stat.title}
            withBorder
            radius="md"
            p="md"
            bg="white"
            style={{
              transition: 'transform 150ms ease, box-shadow 150ms ease',
            }}
          >
            <Group justify="space-between" align="flex-start">
              <div>
                <Text size="xs" c="dimmed" fw={600} tt="uppercase" lts={0.5}>
                  {stat.title}
                </Text>
                <Text fz={26} fw={800} c="dark.8" mt={4} lh={1.1}>
                  {stat.value.toLocaleString('id-ID')}
                </Text>
                <Text size="xs" c="dimmed" mt={4}>
                  {stat.description}
                </Text>
              </div>
              <ThemeIcon
                size={40}
                radius="md"
                variant="light"
                color={stat.color}
              >
                <StatIcon size={20} />
              </ThemeIcon>
            </Group>
          </Paper>
        );
      })}
    </SimpleGrid>
  );
}

export default ContactStatsGrid;

