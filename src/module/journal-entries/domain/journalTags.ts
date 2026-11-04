/** A tag of a journal as `GET /v1/journal/detail/:id` sends it. */
export interface JournalTagRef {
  id?: string;
  name?: string;
  color?: string;
}

/**
 * The detail answers a list of tag objects (`[]` for none); older data sent a string, and "-"
 * when empty. Anything else is treated as no tag.
 */
export type RawJournalTags = readonly (JournalTagRef | string)[] | string | null | undefined;

/** The tag names to show, without blanks and without the "-" placeholder. */
export const tagNames = (tags: RawJournalTags): string[] => {
  const list = Array.isArray(tags) ? tags : typeof tags === 'string' ? [tags] : [];
  return list
    .map((tag) => (typeof tag === 'string' ? tag : (tag?.name ?? '')))
    .map((name) => name.trim())
    .filter((name) => name !== '' && name !== '-');
};
