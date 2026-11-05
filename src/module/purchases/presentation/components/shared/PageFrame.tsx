import type { ReactNode } from 'react';
import { Box, Button, Stack } from '@mantine/core';
import { IconArrowLeft, type Icon } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { AppShellLayout } from '@/components/AppShellLayout';
import { ModuleHeader } from '@/components/ModuleHeader/ModuleHeader';

interface PageFrameProps {
  icon: Icon;
  title: ReactNode;
  description: ReactNode;
  /** Where the back button leads; omit on the hub. */
  backTo?: string;
  backLabel?: string;
  actions?: ReactNode;
  children: ReactNode;
}

/** The shell every purchasing page shares: Standard A/B wrapper plus the module header. */
export const PageFrame = ({
  icon,
  title,
  description,
  backTo,
  backLabel,
  actions,
  children,
}: Readonly<PageFrameProps>) => {
  const navigate = useNavigate();
  return (
    <AppShellLayout>
      <Box p={{ base: 'md', sm: 'xl' }}>
        <Stack gap="lg">
          <ModuleHeader
            icon={icon}
            title={title}
            description={description}
            actions={
              <>
                {backTo && (
                  <Button
                    variant="default"
                    radius="md"
                    leftSection={<IconArrowLeft size={16} />}
                    onClick={() => navigate(backTo)}
                  >
                    {backLabel}
                  </Button>
                )}
                {actions}
              </>
            }
          />
          {children}
        </Stack>
      </Box>
    </AppShellLayout>
  );
};
