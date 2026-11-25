import type { ActivityKind } from '@/module/purchases/domain/activityLog';
import { ApprovalLogCard } from '@/module/purchases/presentation/components/shared/ApprovalLogCard';
import { useActivity } from '@/module/purchases/presentation/hooks/usePurchaseQueries';

interface DocumentApprovalLogProps {
  kind: ActivityKind;
  id: string;
}

/** The approval log of one document, read from the service; shows nothing while it loads or fails. */
export const DocumentApprovalLog = ({ kind, id }: Readonly<DocumentApprovalLogProps>) => {
  const activity = useActivity(kind, id);
  if (activity.isLoading || activity.isError) return null;
  return <ApprovalLogCard entries={activity.data ?? []} />;
};
