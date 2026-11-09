import type { ReactNode } from 'react';
import { ActionIcon, Box, Paper, Stack, Tooltip } from '@mantine/core';
import { IconRefresh, type Icon } from '@tabler/icons-react';
import { ModuleHeader } from '@/components/ModuleHeader/ModuleHeader';
import { useTranslation } from '@/i18n';

interface ProductMasterDataFrameProps {
  icon: Icon;
  title: string;
  description: string;
  isFetching: boolean;
  onRefresh: () => void;
  children: ReactNode;
}

/** Shared frame of the product master lists (categories, units): header, refresh and one panel. */
export function ProductMasterDataFrame({
  icon,
  title,
  description,
  isFetching,
  onRefresh,
  children,
}: Readonly<ProductMasterDataFrameProps>) {
  const { t } = useTranslation('products');

  return (
    <Box p={{ base: 'md', sm: 'xl' }}>
      <Stack gap="lg">
        <ModuleHeader
          icon={icon}
          title={title}
          description={description}
          actions={
            <Tooltip label={t('list.refresh')}>
              <ActionIcon
                size="lg"
                variant="default"
                radius="md"
                onClick={onRefresh}
                loading={isFetching}
                aria-label={t('list.refresh')}
              >
                <IconRefresh size={18} />
              </ActionIcon>
            </Tooltip>
          }
        />
        <Paper withBorder radius="lg" p="md" bg="white">
          {children}
        </Paper>
      </Stack>
    </Box>
  );
}
