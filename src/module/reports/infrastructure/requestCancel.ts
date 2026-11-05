import axios from 'axios';

/** True when a request ended because it was aborted (the user left, changed the period or cancelled). */
export const isRequestCanceled = (error: unknown): boolean =>
  axios.isCancel(error) ||
  (error instanceof Error && (error.name === 'CanceledError' || error.name === 'AbortError'));
