/**
 * The backend works in Asia/Jakarta (WIB): its "today" decides `FUTURE_DATE_NOT_ALLOWED` and the
 * period locks. A browser in another time zone must not offer or send a date the server already
 * counts as tomorrow (or refuse one it still counts as today), so dates default from this.
 */
const WIB = 'Asia/Jakarta';

/** `YYYY-MM-DD` of the given moment on the WIB calendar. */
export const todayWib = (now: Date = new Date()): string =>
  new Intl.DateTimeFormat('en-CA', {
    timeZone: WIB,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now);
