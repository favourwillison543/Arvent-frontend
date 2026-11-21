import type { HTMLAttributes } from "react";

/**
 * The horizontal gutters for every page body, in one place.
 *
 * Exported because `PageLayout` composes its narrower columns from them: a
 * screen that needs a smaller measure gets the same gutters at a smaller cap
 * instead of hand-writing `px-4 sm:px-6`.
 */
export const GUTTERS = "px-4 sm:px-6 lg:px-8";

/**
 * The page column: a 90% width with the shared gutters. Marketing pages, the
 * organizer home, the event dashboard and the invitation all sit on it, so the
 * body doesn't shift sideways when the reader moves between screens.
 */
export const PAGE_BODY = `mx-auto w-full max-w-[90%] ${GUTTERS}`;

/**
 * The event column — the one measure for every screen that shows an event.
 *
 * The create page, the organizer's preview, the host's dashboard hero and the
 * guest invitation all render this string, so the title starts on the same x
 * and the poster is the same width whichever of the four you land on. Before,
 * each screen resolved its own width — `max-w-[90%]` on the create page,
 * `max-w-6xl` in the invitation header, `xl:max-w-6xl` on the dashboard — and
 * the same event slid sideways between its own pages.
 */
export const EVENT_BODY = `${PAGE_BODY} xl:max-w-6xl`;

/**
 * The wide column: the page column, opened up a step on large screens so a row
 * of four dashboard cards still reads as four cards rather than a strip of
 * thumbnails — 1280px at `xl`, 1408px from `2xl`.
 *
 * It lives here, next to the other three, because its *header* and its *body*
 * have to agree: the organizer home used to apply this cap inside its content
 * wrapper only, so a header that took plain `PAGE_BODY` would have started 80px
 * to the left of its own cards. `HOME_WRAP` in `event-dashboard/gutters.ts` is
 * this string, and `PageHeader width="wide"` is the same string again.
 */
export const WIDE_BODY = `${PAGE_BODY} xl:max-w-7xl 2xl:max-w-page`;

/**
 * A reading column: the shared gutters, capped at 1024px. Settings and other
 * read-mostly screens use it so a form doesn't stretch across a 27-inch display.
 * It was a `max-w-5xl` and a `px-5 sm:px-8` hand-written on the settings page;
 * now it is one string with the same gutters as everything else.
 */
export const READING_BODY = `mx-auto w-full max-w-5xl ${GUTTERS}`;

/**
 * The event column's top rhythm. One value for the create page and the
 * dashboard hero, so the first line of the page lands at the same height
 * whether you are writing the event or reading it.
 */
export const EVENT_TOP = "pt-6 sm:pt-10 lg:pt-14";

/**
 * The display title: 32 / 40 / 48, the biggest words on a screen.
 *
 * Two things carry it. A screen's own name — "Settings", "The moments we made" —
 * through `PageHeader`, and an event's name, wherever that event is drawn. That
 * is one tier on purpose: stepping from an event's dashboard to a page inside it
 * shouldn't change the size of the largest type.
 *
 * The screens used to resolve it themselves: 32 / 42, 36 / 48, 36 / 48 / 60, a
 * flat 30, and a handful of `clamp()`s. Marketing heroes are the one deliberate
 * step above this and stay in their own components, where the extra drama is the
 * point.
 *
 * The three sizes below are in brackets on purpose. They are the display tier:
 * they exist in this one string, so a screen can't reach for its own, and
 * `text-[2rem]` here is a decision rather than a stray value.
 */
export const PAGE_TITLE = "text-[2rem] leading-[1.06] sm:text-[2.5rem] lg:text-[3rem]";

/**
 * The event's title. A page title, because that is what it is; the alias keeps
 * the same event's name from changing size as you move between its screens.
 */
export const EVENT_TITLE = PAGE_TITLE;

/**
 * The page column itself. There is one shape — `PAGE_BODY` — because a page's
 * width is a property of the page, not of the block inside it: `PageLayout`
 * picks the column, and this drops a block of content into it.
 *
 * The old `size="narrow"` variant had no callers, and it appended `max-w-xl`
 * next to `max-w-[90%]`. Two max-widths on one element means the winner is
 * whichever rule Tailwind happens to emit later, which is not a design decision
 * anyone can make. `PageLayout`'s `narrow` column is the supported way to ask
 * for a smaller measure.
 */
export type ContainerProps = HTMLAttributes<HTMLDivElement>;

export default function Container({ className, ...props }: ContainerProps) {
  return (
    <div className={[PAGE_BODY, className].filter(Boolean).join(" ")} {...props} />
  );
}
