import { useNavigate } from 'react-router-dom';
import { Box, Button, Group, Paper, Stack } from '@mantine/core';
import { IconArrowLeft, IconUserPlus } from '@tabler/icons-react';
import AppShellLayout from '@/components/AppShellLayout';
import ModuleHeader from '@/components/ModuleHeader/ModuleHeader';
import { routes } from '@/router/routes';
import { ContactFormModal } from '../components/ContactFormModal';
import { useSaveContact } from '../hooks/useContactQueries';
import type { ContactFormValues } from '../types/contact';

export function AddContactPage() {
  const navigate = useNavigate();
  const saveMutation = useSaveContact();

  const handleFormSubmit = async (values: ContactFormValues) => {
    const created = await saveMutation.mutateAsync(values);
    navigate(routes.Contact.DetailContact.replace(':idAccount', created.id));
  };

  return (
    <AppShellLayout>
      <Box p={{ base: 'md', sm: 'xl' }}>
        <Stack gap="lg">
          <ModuleHeader
            icon={IconUserPlus}
            title="Tambah Kontak Baru"
            description="Daftarkan entitas pelanggan, pemasok, atau karyawan ke dalam buku besar akuntansi."
            actions={
              <Button
                variant="default"
                leftSection={<IconArrowLeft size={16} />}
                onClick={() => navigate(routes.Contact.Main)}
              >
                Kembali
              </Button>
            }
          />

          <Paper withBorder radius="md" p="xl" bg="white">
            {/* Embedded Form modal container */}
            <ContactFormModal
              opened
              isSubmitting={saveMutation.isPending}
              onClose={() => navigate(routes.Contact.Main)}
              onSubmit={handleFormSubmit}
            />
          </Paper>
        </Stack>
      </Box>
    </AppShellLayout>
  );
}

export default AddContactPage;