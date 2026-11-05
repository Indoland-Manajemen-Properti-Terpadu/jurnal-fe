import React from 'react';
import { Button } from '@mantine/core';
import { IconArrowLeft } from '@tabler/icons-react';
import { Link } from 'react-router-dom';
import { routes } from '@/router/routes';

import { useTranslation } from '@/i18n';

/** Header action that returns to the report center. */
export const ReportBackButton: React.FC = () => {
  const { t } = useTranslation('reports');
  return (
    <Button
      component={Link}
      to={routes.reports.main}
      variant="default"
      radius="md"
      leftSection={<IconArrowLeft size={16} />}
    >
      {t('common.backToReports')}
    </Button>
  );
};
