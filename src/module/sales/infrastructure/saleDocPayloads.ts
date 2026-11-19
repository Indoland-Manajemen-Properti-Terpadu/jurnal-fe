export interface SendDocInput {
  /** Up to 10 addresses; none means the document is only marked as sent. */
  emails: string[];
  message: string;
}

export const buildSendBody = ({ emails, message }: SendDocInput) =>
  emails.length ? { emails, ...(message.trim() ? { message: message.trim() } : {}) } : {};
