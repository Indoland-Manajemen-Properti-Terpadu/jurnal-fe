import { useCallback, useEffect, useRef } from 'react';

/**
 * One abortable request at a time. `start` returns the signal for a new request and aborts the
 * previous one; `abort` stops the current one. The request is also aborted when the component
 * unmounts, so a long export does not keep running (and loading) after the user left the page.
 */
export const useAbortableRequest = () => {
  const controller = useRef<AbortController | null>(null);

  const abort = useCallback(() => {
    controller.current?.abort();
    controller.current = null;
  }, []);

  const start = useCallback((): AbortSignal => {
    controller.current?.abort();
    const next = new AbortController();
    controller.current = next;
    return next.signal;
  }, []);

  useEffect(() => abort, [abort]);

  return { start, abort };
};
