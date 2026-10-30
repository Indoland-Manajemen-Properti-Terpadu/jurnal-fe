import { useNavigate } from 'react-router-dom';
import { Box, Button, Paper, Stack } from '@mantine/core';
import { IconArrowLeft, IconUserPlus } from '@tabler/icons-react';
import AppShellLayout from '@/components/AppShellLayout';
import { ModuleHeader } from '@/components/ModuleHeader/ModuleHeader';
import { useTranslation } from '@/i18n';
import { routes } from '@/router/routes';
import { ContactFormModal } from '@/module/contacts/presentation/components/form/ContactFormModal';
import { useSaveContact } from '@/module/contacts/presentation/hooks/useContactQueries';
import type { ContactFormValues } from '@/module/contacts/domain/contact';

export function AddContactPage() {
  const navigate = useNavigate();
  const { t } = useTranslation('contacts');
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
            title={t('add.title')}
            description={t('add.description')}
            actions={
              <Button
                variant="default"
                leftSection={<IconArrowLeft size={16} />}
                onClick={() => navigate(routes.Contact.Main)}
              >
                {t('add.back')}
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
