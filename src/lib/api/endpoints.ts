/**
 * Backend route paths. Keep URL construction inside the API layer.
 *
 * Every path below is in the deployed API's own document (`GET /docs-yaml`) —
 * the v2.2 contract. A path that is not in that document does not exist — the
 * API answers 404 — so nothing may be invented here.
 *
 * Publishing is its own operation again (`PATCH /events/{id}/publish`), with
 * cancellation next to it (`PATCH /events/{id}/cancel`). The one path this app
 * still calls that the API does not serve is `/public/waitlist`.
 */
export const endpoints = {
  auth: {
    register: "/auth/register",
    login: "/auth/login",
    logout: "/auth/logout",
    refresh: "/auth/refresh",
    currentUser: "/auth/me",
    forgotPassword: "/auth/forgot-password",
    resetPassword: "/auth/reset-password",
  },
  events: {
    list: "/events",
    detail: (id: string) => `/events/${id}`,
    /** Publish is a separate operation on a draft (PRD §4.3) — no body. */
    publish: (id: string) => `/events/${id}/publish`,
    /** Cancellation is the extension beside it; body `{ reason? }`. */
    cancel: (id: string) => `/events/${id}/cancel`,
    duplicate: (id: string) => `/events/${id}/duplicate`,
    notifications: (eventId: string) => `/events/${eventId}/notifications`,
    guests: (eventId: string) => `/events/${eventId}/guests`,
    guest: (eventId: string, guestId: string) => `/events/${eventId}/guests/${guestId}`,
    regenerateGuestToken: (eventId: string, guestId: string) => `/events/${eventId}/guests/${guestId}/regenerate-token`,
    updates: (eventId: string) => `/events/${eventId}/updates`,
    update: (eventId: string, updateId: string) => `/events/${eventId}/updates/${updateId}`,
    gateAccess: (eventId: string) => `/events/${eventId}/gate-access`,
    gateAccessItem: (eventId: string, accessId: string) => `/events/${eventId}/gate-access/${accessId}`,
    gateList: (eventId: string) => `/events/${eventId}/gate-list`,
    checkIn: (eventId: string, guestId: string) => `/events/${eventId}/guests/${guestId}/check-in`,
    walkIns: (eventId: string) => `/events/${eventId}/walk-ins`,
    reconfirmation: (eventId: string) => `/events/${eventId}/reconfirmation/start`,
    attendance: (eventId: string) => `/events/${eventId}/attendance`,
    memories: (eventId: string) => `/events/${eventId}/memories`,
    memory: (eventId: string, photoId: string) => `/events/${eventId}/memories/${photoId}`,
    memorySettings: (eventId: string) => `/events/${eventId}/memories/settings`,
  },
  /** The door. `POST` opens a session for the event; there is no token header. */
  gate: { session: "/gate/session" },
  moments: {
    /** `GET /moments` — the Moments I created while signed in. */
    list: "/moments",
    /** Anonymous creation is public: `POST /public/moments` (PRD §11.3). */
    create: "/public/moments",
    /** `DELETE /moments/{id}` — delete one I created. */
    item: (id: string) => `/moments/${id}`,
  },
  uploads: {
    eventImage: "/uploads/event-image",
    momentImage: "/uploads/moment-image",
  },
  public: {
    /** Absent from the contract; kept so the call site type-checks while unused. */
    waitlist: "/public/waitlist",
    events: "/public/events",
    event: (slug: string) => `/public/events/${slug}`,
    eventUpdates: (slug: string) => `/public/events/${slug}/updates`,
    memories: (slug: string) => `/public/events/${slug}/memories`,
    rsvp: (slug: string) => `/public/events/${slug}/rsvp`,
    /** Email-code sign-in for a guest whose link they lost. */
    guestAccessRequestCode: (slug: string) =>
      `/public/events/${slug}/guest-access/request-code`,
    guestAccessVerify: (slug: string) => `/public/events/${slug}/guest-access/verify`,
    /** The guest session itself: `POST` to claim, `DELETE` to drop. */
    guestSession: "/public/guest/session",
    guest: "/public/guest",
    guestRsvp: "/public/guest/rsvp",
    reconfirm: "/public/guest/reconfirm",
    guestNotifications: "/public/guest/notifications",
    notificationsUnsubscribe: "/public/notifications/unsubscribe",
    /** A pass link carries `#token=…`; this trades it for a guest session. */
    passSession: "/public/guest/pass/session",
    pass: "/public/guest/pass",
    moment: (slug: string) => `/public/moments/${slug}`,
  },
} as const;
