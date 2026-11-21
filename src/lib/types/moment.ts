export type MomentKind = "save-the-date" | "announcement" | "milestone" | "thank-you";
export type MomentStyle = "editorial" | "photo" | "minimal";

/**
 * A Moment, exactly as `POST /public/moments` and `GET /public/moments/{id}`
 * answer it.
 *
 * There is no `visibility` on the contract: a card is always readable by anyone
 * holding its link, and `GET /moments` only lists the cards *you* made while
 * signed in (verified against the deployed API - sending `visibility` is a 400
 * `property visibility should not exist`).
 */
export type Moment = {
  id: string;
  kind: MomentKind;
  style: MomentStyle;
  title: string;
  date: string;
  place: string;
  message: string;
  from: string;
  /** An http(s) image URL, or "" - the API rejects `data:` URLs. */
  photo: string;
  themeId: string;
  fontId: string;
  effectId: string;
  /** An Arvent event id, or "" for a standalone card. */
  eventId: string;
  createdAt: string;
  /** Present on the API's answer; the app builds its own link from the id. */
  shareUrl?: string;
};

/**
 * `CreateMomentDto`: the twelve fields above minus the server's own.
 *
 * `photo` is `""` or an `http(s)` URL. A browser `data:` URL must be uploaded
 * with `POST /uploads/moment-image` first (signed-in only) - see
 * `resolveMomentPhoto`.
 */
export type CreateMomentInput = {
  kind: MomentKind;
  style: MomentStyle;
  title: string;
  /** `YYYY-MM-DD`, or "" when the card has no date. */
  date: string;
  place: string;
  message: string;
  from: string;
  photo: string;
  themeId: string;
  fontId: string;
  effectId: string;
  eventId: string;
};

