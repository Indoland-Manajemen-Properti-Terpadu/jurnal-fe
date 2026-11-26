import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Anchor,
  Button,
  Group,
  Loader,
  SimpleGrid,
  Stack,
  Table,
  Text,
  Textarea,
  TextInput,
} from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import { IconSearch } from '@tabler/icons-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { ModalFrame } from '@/components/Modals/ModalFrame';
import { useTranslation } from '@/i18n';
import { toApiError, type FieldError } from '@/lib/http/apiError';
import type { ReorderInput } from '@/module/purchases/domain/purchaseReorder';
import {
  createReorder,
  listReorderSources,
  previewReorder,
} from '@/module/purchases/infrastructure/purchaseReorderApi';
import { ReorderSourcePicker } from '@/module/purchases/presentation/components/orders/ReorderSourcePicker';
import { ReorderItemRow } from '@/module/purchases/presentation/components/orders/ReorderItemRow';
import {
  sourceLines,
  type EditableLine,
} from '@/module/purchases/presentation/components/orders/reorderFormState';
import { formatAmount } from '@/module/purchases/presentation/components/shared/format';
import { usePurchaseErrorMessage } from '@/module/purchases/presentation/hooks/purchaseErrorMessage';
import { purchaseKeys } from '@/module/purchases/presentation/hooks/purchaseKeys';
import { useOrder } from '@/module/purchases/presentation/hooks/usePurchaseQueries';
import { usePurchaseScope } from '@/module/purchases/presentation/hooks/usePurchaseScope';
import { routes } from '@/router/routes';

interface ReorderDialogProps {
  opened: boolean;
  onClose: () => void;
  sourceId?: string | null;
}

export const ReorderDialog = ({ opened, onClose, sourceId }: Readonly<ReorderDialogProps>) => {
  const { t } = useTranslation('purchases');
  const scope = usePurchaseScope();
  const client = useQueryClient();
  const navigate = useNavigate();
  const describe = usePurchaseErrorMessage();
  const [search, setSearch] = useState('');
  const [debouncedSearch] = useDebouncedValue(search, 350);
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState<string | null>(sourceId ?? null);
  const [lines, setLines] = useState<EditableLine[]>([]);
  const [note, setNote] = useState('');
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldError[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const retry = useRef<{
    sourceId: string;
    input: ReorderInput & { idempotencyKey: string };
  } | null>(null);
  const initializedSourceId = useRef<string | null>(null);

  useEffect(() => {
    if (opened) {
      setSelectedId(sourceId ?? null);
      setLines([]);
      setNote('');
      setSubmitError(null);
      setFieldErrors([]);
      retry.current = null;
      initializedSourceId.current = null;
    }
  }, [opened, sourceId]);

  const sources = useQuery({
    queryKey: [
      ...purchaseKeys.documents(scope, 'orders'),
      'reorder-sources',
      debouncedSearch,
      page,
    ],
    queryFn: () => listReorderSources(debouncedSearch, page),
    enabled: opened && !selectedId,
  });
  const order = useOrder(opened ? (selectedId ?? undefined) : undefined);
  useEffect(() => {
    if (order.data && selectedId === order.data.id && initializedSourceId.current !== selectedId) {
      setLines(sourceLines(order.data));
      initializedSourceId.current = selectedId;
    }
  }, [order.data, selectedId]);

  const input = useMemo<ReorderInput>(
    () => ({
      items: lines
        .filter((line) => line.checked && line.quantity > 0)
        .map((line) => ({
          sourceItemId: line.id,
          quantity: line.quantity,
          unitPrice: line.unitPrice,
        })),
      ...(note.trim() ? { note: note.trim() } : {}),
    }),
    [lines, note]
  );
  const preview = useQuery({
    queryKey: [...purchaseKeys.documents(scope, 'orders'), 'reorder-preview', selectedId, input],
    queryFn: () => previewReorder(selectedId as string, input),
    enabled: opened && Boolean(selectedId) && input.items.length > 0,
    retry: false,
  });
  const changeLine = (id: string, update: Partial<EditableLine>) => {
    retry.current = null;
    setSubmitError(null);
    setFieldErrors([]);
    setLines((current) => current.map((line) => (line.id === id ? { ...line, ...update } : line)));
  };
  const close = () => {
    if (!submitting) onClose();
  };
  const submit = async () => {
    if (!selectedId || !preview.data || submitting) return;
    const pending = retry.current ?? {
      sourceId: selectedId,
      input: { ...input, idempotencyKey: crypto.randomUUID() },
    };
    retry.current = pending;
    setSubmitting(true);
    setSubmitError(null);
    setFieldErrors([]);
    try {
      const created = await createReorder(pending.sourceId, pending.input);
      retry.current = null;
      await client.invalidateQueries({ queryKey: purchaseKeys.all(scope) });
      onClose();
      navigate(routes.purchases.orderDetail.replace(':id', created.id));
    } catch (error) {
      setSubmitError(describe(error));
      const apiError = toApiError(error);
      setFieldErrors(apiError.fieldErrors);
      if (apiError.kind !== 'network') retry.current = null;
    } finally {
      setSubmitting(false);
    }
  };
  const source = order.data;
  const amount = (value: number) => formatAmount(value, preview.data?.precision);
  const valid =
    Boolean(preview.data) &&
    !preview.isFetching &&
    !preview.isError &&
    input.items.length > 0 &&
    !preview.data?.approvalConfigurationError &&
    (!preview.data?.requiresReason || Boolean(note.trim()));

  return (
    <ModalFrame
      opened={opened}
      onClose={close}
      size={selectedId ? 'min(900px, 96vw)' : 'min(640px, 94vw)'}
      scrollBody
      title={
        selectedId
          ? t('orders.reorder.from', { number: source?.number ?? '' })
          : t('orders.reorder.pickTitle')
      }
      description={selectedId ? source?.vendor.name : t('orders.reorder.pickDescription')}
      headerExtra={
        !selectedId && (
          <TextInput
            data-autofocus
            leftSection={<IconSearch size={16} />}
            placeholder={t('orders.reorder.search')}
            value={search}
            onChange={(event) => {
              setSearch(event.currentTarget.value);
              setPage(1);
            }}
          />
        )
      }
      footer={
        selectedId ? (
          <>
            <Button
              variant="default"
              onClick={() => {
                if (retry.current) return;
                setSelectedId(null);
                setLines([]);
                initializedSourceId.current = null;
              }}
            >
              {t('common.cancel')}
            </Button>
            <Button
              onClick={submit}
              loading={submitting}
              disabled={!source?.canReorder || (!valid && !retry.current)}
            >
              {retry.current ? t('orders.reorder.retry') : t('orders.reorder.submit')}
            </Button>
          </>
        ) : (
          <Button variant="default" onClick={close}>
            {t('common.cancel')}
          </Button>
        )
      }
    >
      {!selectedId && (
        <ReorderSourcePicker
          sources={sources.data?.results ?? []}
          page={page}
          totalPages={sources.data?.totalPages ?? 0}
          loading={sources.isLoading}
          error={sources.error}
          onPage={setPage}
          onPick={(id) => {
            initializedSourceId.current = null;
            setSelectedId(id);
          }}
        />
      )}
      {selectedId && order.isLoading && (
        <Group justify="center">
          <Loader size="sm" />
        </Group>
      )}
      {selectedId && order.isError && <Alert color="red">{describe(order.error)}</Alert>}
      {source && selectedId && (
        <>
          {!source.canReorder && (
            <Alert color="orange">{source.reorderBlockReason || t('orders.reorder.blocked')}</Alert>
          )}
          <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md">
            <div>
              <Text size="xs" c="dimmed">
                {t('common.vendor')}
              </Text>
              <Text fw={600}>{source.vendor.name}</Text>
            </div>
            <div>
              <Text size="xs" c="dimmed">
                {t('orders.form.paymentTerm')}
              </Text>
              <Text fw={600}>{source.paymentTermName || '—'}</Text>
            </div>
            <div>
              <Text size="xs" c="dimmed">
                {t('orders.draft.warehouse')}
              </Text>
              <Text fw={600}>{source.warehouse?.name || '—'}</Text>
            </div>
          </SimpleGrid>
          <Text size="sm" c="dimmed">
            {t('orders.reorder.locked', { number: source.number })}
          </Text>
          <Table.ScrollContainer minWidth={680}>
            <Table verticalSpacing="sm" highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th w={36} />
                  <Table.Th>{t('orders.reorder.item')}</Table.Th>
                  <Table.Th w={120}>{t('orders.reorder.qty')}</Table.Th>
                  <Table.Th w={155}>{t('orders.reorder.price')}</Table.Th>
                  <Table.Th ta="right">{t('orders.reorder.amount')}</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {source.items.map((item) => (
                  <ReorderItemRow
                    key={item.id}
                    item={item}
                    line={lines.find((entry) => entry.id === item.id)}
                    preview={preview.data}
                    inputIndex={input.items.findIndex((entry) => entry.sourceItemId === item.id)}
                    fieldErrors={fieldErrors}
                    locked={Boolean(retry.current)}
                    onChange={changeLine}
                  />
                ))}
              </Table.Tbody>
            </Table>
          </Table.ScrollContainer>
          <Stack gap={2} align="flex-end">
            <Text size="sm" c="dimmed">
              {t('orders.reorder.oldTotal')}:{' '}
              {amount(preview.data?.sourceTotal ?? source.finalAmount)}
            </Text>
            <Text fw={700} size="lg">
              {t('orders.reorder.newTotal')}:{' '}
              {preview.isFetching ? '…' : amount(preview.data?.total ?? 0)}
            </Text>
            {preview.data?.totalIncreased && (
              <Text size="sm" c="orange.8">
                {t('orders.reorder.increasedBy', {
                  amount: amount(preview.data.total - preview.data.sourceTotal),
                })}
              </Text>
            )}
          </Stack>
          {preview.isError && <Alert color="red">{describe(preview.error)}</Alert>}
          {preview.data?.approvalConfigurationError && (
            <Alert color="red">{preview.data.approvalConfigurationError}</Alert>
          )}
          {preview.data && (
            <Alert color="orange" title={t('orders.reorder.approvalTitle')}>
              {preview.data.approvalPlan
                .map((stage) => `${stage.name}: ${stage.roles.map((role) => role.name).join(', ')}`)
                .join(' → ')}
            </Alert>
          )}
          {(preview.data?.activeReorders ?? []).length > 0 && (
            <Alert color="yellow" title={t('orders.reorder.activeTitle')}>
              {preview.data?.activeReorders.map((ref) => (
                <Anchor
                  key={ref.id}
                  component={Link}
                  to={routes.purchases.orderDetail.replace(':id', ref.id)}
                  mr="sm"
                >
                  {ref.number}
                </Anchor>
              ))}
            </Alert>
          )}
          <Textarea
            label={
              preview.data?.requiresReason ? t('orders.reorder.reason') : t('orders.reorder.note')
            }
            value={note}
            error={fieldErrors.find((entry) => entry.field === 'note')?.message}
            disabled={Boolean(retry.current)}
            onChange={(event) => {
              retry.current = null;
              setNote(event.currentTarget.value);
            }}
            minRows={3}
            autosize
            required={preview.data?.requiresReason}
          />
          {submitError && <Alert color="red">{submitError}</Alert>}
        </>
      )}
    </ModalFrame>
  );
};
