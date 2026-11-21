/**
 * The organiser account, as the API describes it.
 *
 * `/auth/me` and `/auth/login` answer `{ user }`; `/auth/register` adds a
 * `message`. The number is `phoneNumber` on the way in and out (PRD §3.2), and
 * it is unique: a second account with the same number answers `409 PHONE_TAKEN`.
 */
export type User = {
  id: string;
  name: string;
  email: string;
  /** E.164, e.g. `+2348031234567`. */
  phoneNumber?: string;
  /** WhatsApp consent recorded at signup. */
  whatsappOptIn?: boolean;
  createdAt: string;
  updatedAt: string;
};

/** `RegisterDto`: name ≤120, phoneNumber 5–32, password 10–128, all required. */
export type RegisterInput = {
  name: string;
  email: string;
  /**
   * Nigerian numbers may omit `+234`; other countries need the `+` prefix. The
   * API normalises and stores E.164, and rejects a duplicate with 409.
   */
  phoneNumber: string;
  /** "Send me event updates on WhatsApp". */
  whatsappOptIn?: boolean;
  password: string;
};

export type LoginInput = {
  email: string;
  password: string;
};

/**
 * `/auth/register` (201) and `/auth/login` (200).
 *
 * The body is the account, not the session: register adds a `message`, login
 * answers `{ user }` alone. The session is the httpOnly `access_token` /
 * `refresh_token` cookie pair set by the same response, which this bundle can
 * never read — and, since the API went cookie-only, no token is returned in any
 * body for a client to store.
 */
export type AuthResponse = {
  user: User;
  message?: string;
};
