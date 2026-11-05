import { renderHook } from '@testing-library/react';
import { useAbortableRequest } from './useAbortableRequest';

describe('useAbortableRequest', () => {
  it('aborts the previous request when a new one starts', () => {
    const { result } = renderHook(() => useAbortableRequest());
    const first = result.current.start();
    const second = result.current.start();
    expect(first.aborted).toBe(true);
    expect(second.aborted).toBe(false);
  });

  it('aborts the current request on demand', () => {
    const { result } = renderHook(() => useAbortableRequest());
    const signal = result.current.start();
    result.current.abort();
    expect(signal.aborted).toBe(true);
  });

  it('aborts the current request when the page unmounts', () => {
    const { result, unmount } = renderHook(() => useAbortableRequest());
    const signal = result.current.start();
    unmount();
    expect(signal.aborted).toBe(true);
  });

  it('does nothing when there is no request to abort', () => {
    const { result } = renderHook(() => useAbortableRequest());
    expect(() => result.current.abort()).not.toThrow();
  });
});
