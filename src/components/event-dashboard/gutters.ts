import { EVENT_BODY, WIDE_BODY } from "@/components/ui/Container";

/**
 * The event dashboard's body column — the shared event column, so the hero
 * title sits on the same x as the invitation's and the create page's.
 */
export const DASH_WRAP = EVENT_BODY;

/**
 * The organizer home column: the shared wide column, defined once in
 * `Container.tsx` so the dashboard's header and its card grid cannot disagree
 * about where the left edge is.
 */
export const HOME_WRAP = WIDE_BODY;

