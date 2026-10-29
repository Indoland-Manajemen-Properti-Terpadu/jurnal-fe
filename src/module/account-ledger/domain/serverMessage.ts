/** The `message` of an HTTP error response, when the server sent one. */
export const serverMessage = (error: unknown): string | undefined => {
  if (typeof error !== 'object' || error === null) return undefined;
  const { response } = error as { response?: { data?: { message?: unknown } } };
  const message = response?.data?.message;
  return typeof message === 'string' && message ? message : undefined;
};
