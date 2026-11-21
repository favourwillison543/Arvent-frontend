/** An announcement the host posts for guests. */
export type EventUpdate = {
  id: string;
  eventId: string;
  title: string;
  /** The body text. `CreateUpdateDto` calls it `message` (v2.2) — not `content`. */
  message: string;
  isImportant: boolean;
  createdAt: string;
  updatedAt: string;
};

/** `CreateUpdateDto`: `title` 1–140, `message` 1–5000, `isImportant` optional. */
export type CreateEventUpdateInput = {
  title: string;
  message: string;
  isImportant?: boolean;
};

/** `EditUpdateDto`: the same three keys, all optional. */
export type UpdateEventUpdateInput = Partial<CreateEventUpdateInput>;
