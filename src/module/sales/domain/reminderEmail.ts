export type ReminderEmailIssue = 'missing' | 'invalid' | 'example' | null;

/** Checks what the form can prove before asking the server to send an email. */
export const validateReminderEmail = (value: string): ReminderEmailIssue => {
  const email = value.trim().toLowerCase();
  if (!email) return 'missing';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'invalid';
  const domain = email.split('@')[1];
  if (
    /\.(test|example|invalid|localhost)$/.test(domain) ||
    /^example\.(com|net|org)$/.test(domain)
  ) return 'example';
  return null;
};
