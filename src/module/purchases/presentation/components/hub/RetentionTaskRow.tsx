import { Button, Text, UnstyledButton } from '@mantine/core';
import { IconChevronRight } from '@tabler/icons-react';
import { Link } from 'react-router-dom';
import { useTranslation } from '@/i18n';
import { taskKind, type RetentionTask } from '@/module/purchases/domain/retention';
import classes from '@/module/purchases/presentation/components/hub/OverviewTab.module.css';
import { formatAmount, formatDay } from '@/module/purchases/presentation/components/shared/format';
import { routes } from '@/router/routes';

/** A retention to-do in "Perlu tindakan": ask for the final BAST, then release the held amount. */
export const RetentionTaskRow = ({
  task,
  language,
  onRelease,
}: Readonly<{
  task: RetentionTask;
  language: string;
  /** Given when the person may release: the release task then opens the dialog instead of the order. */
  onRelease?: (purchaseOrderId: string) => void;
}>) => {
  const { t } = useTranslation('purchases');
  // The service words each task in Indonesian; English readers get a line of ours.
  const title =
    language === 'id' && task.title
      ? `${task.title} ${formatAmount(task.balance)}`
      : `${t(`reports.retention.task.${taskKind(task.type)}`)} ${formatAmount(task.balance)}`;
  const body = (
    <>
      <span className={classes.bar} aria-hidden />
      <div className={classes.main}>
        <Text size="md" fw={600} lh={1.3}>
          {title}
        </Text>
        <Text size="xs" c="dimmed">
          {task.number} · {task.vendorName}
          {task.dueDate &&
            ` · ${t('reports.retention.taskDue', { date: formatDay(task.dueDate, language) })}`}
        </Text>
      </div>
      {onRelease && taskKind(task.type) === 'release' ? (
        <Button size="compact-sm" radius="md" component="span">
          {t('reports.retention.release.cta')}
        </Button>
      ) : (
        <IconChevronRight size={16} color="var(--mantine-color-dimmed)" aria-hidden />
      )}
    </>
  );
  if (onRelease && taskKind(task.type) === 'release') {
    return (
      <UnstyledButton
        className={classes.row}
        data-late={false}
        w="100%"
        onClick={() => onRelease(task.purchaseOrderId)}
      >
        {body}
      </UnstyledButton>
    );
  }
  return (
    <Link
      to={routes.purchases.orderDetail.replace(':id', task.purchaseOrderId)}
      className={classes.row}
      data-late={false}
    >
      {body}
    </Link>
  );
};
