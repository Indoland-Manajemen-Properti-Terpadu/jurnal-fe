import React from 'react';
import { Button } from '@mantine/core';
import { IconArrowLeft } from '@tabler/icons-react';
import { Link } from 'react-router-dom';
import { routes } from '@/router/routes';

import { useTranslation } from '@/i18n';

/** Header action that returns to the report center. */
export const ReportBackButton: React.FC<{ label?: string; plain?: boolean }> = ({
  label,
  plain,
}) => {
  const { t } = useTranslation('reports');
  return (
    <Button
      component={Link}
      to={routes.reports.main}
      variant={plain ? 'subtle' : 'default'}
      radius="md"
      size={plain ? 'compact-sm' : 'sm'}
      px={plain ? 0 : undefined}
      color={plain ? 'gray.7' : undefined}
      leftSection={<IconArrowLeft size={16} />}
    >
      {label ?? t('common.backToReports')}
    </Button>
  );
};
