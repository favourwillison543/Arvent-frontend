import type { HTMLAttributes } from "react";

import {
  EVENT_BODY,
  EVENT_TOP,
  GUTTERS,
  PAGE_BODY,
  READING_BODY,
  WIDE_BODY,
} from "./Container";

/**
 * The page shell — the one place a page's outer padding and measure are set.
 *
 * Every screen used to resolve its own: `DiscoverPage` carried `px-4 pt-12 pb-32
 * sm:px-8 sm:pt-16` **around** a `Container` that brought its own gutters, so a
 * phone paid 32px of horizontal padding and 208px of dead space under the last
 * card (its own `pb-32` stacked on the workspace frame's `pb-20`). Settings paid
 * its `pb-28` on top of the same frame padding. Those are the "nested wrappers
 * that each add padding" the audit called out.
 *
 * So a page renders its canvas (`<main className="… bg-background">`) and puts
 * its content inside this; nothing between the two adds padding. The measure
 * comes from `Container.tsx`, which is where the numbers live — this component
 * only composes them, so there is still exactly one definition per value.
 *
 * `top` is the shared opening rhythm (`EVENT_TOP`): one value for every page, so
 * the first line lands at the same height whether you are reading settings, an
 * event or the discover feed. A page whose first child is a hero does not add a
 * second top padding of its own — it gives its hero `pb-*` and nothing above.
 * The one exception is a marketing page under the fixed navbar, which measures
 * its first gap from the bar; that page passes `top="none"` and states the
 * clearance at its own call site.
 *
 * Bottom space is not a prop: every page inside a frame already gets it from the
 * frame (`OrganizerWorkspace` reserves the mobile tab bar once), and a themed
 * canvas reserves its own. A second one at this level is the double padding this
 * component exists to delete.
 */
export type PageWidth = "page" | "event" | "reading" | "wide" | "narrow";

const COLUMNS: Record<PageWidth, string> = {
  /**
   * The default column: the width every screen shares — the full viewport on a
   * phone, 95% from `sm` up, with the shared gutters inside both.
   */
  page: PAGE_BODY,
  /** The event column — the same measure across create, preview, dashboard, invitation. */
  event: EVENT_BODY,
  /** A reading column, capped for settings and other read-mostly screens. */
  reading: READING_BODY,
  /**
   * The organizer home's column, opened a step wider on large screens. `discover`
   * renders on it too: the two screens sit in the same frame, behind the same
   * sidebar, and a feed that centred itself in a 1024px column while `/home`
   * started at the sidebar's edge read as a different app. One column, so a card
   * starts on the same x whichever of the two you are on.
   */
  wide: WIDE_BODY,
  /** One narrow column, capped at 576px: the door list, a single-column editor. */
  narrow: `mx-auto w-full max-w-xl ${GUTTERS}`,
};

export interface PageLayoutProps extends HTMLAttributes<HTMLDivElement> {
  width?: PageWidth;
  /** The shared top rhythm. `none` for a page that measures from fixed chrome. */
  top?: "page" | "none";
}

export default function PageLayout({
  width = "page",
  top = "page",
  className,
  children,
  ...props
}: PageLayoutProps) {
  return (
    <div
      className={[COLUMNS[width], top === "page" ? EVENT_TOP : "", "min-w-0", className]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {children}
    </div>
  );
}
