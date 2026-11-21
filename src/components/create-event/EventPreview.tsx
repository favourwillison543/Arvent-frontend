"use client";

import { Poster } from "./Poster";
import { fonts } from "./themes";
import { posters } from "./posters";
import { whenOf, whereOf } from "./format";
import type { EventDraft } from "./draft";

// Re-export Poster so other components (like PosterPicker) can import it from here if needed
export { Poster };

/**
 * The poster's one size.
 *
 * The create page, the invitation (`/e/[slug]`), the organizer's preview
 * (`/create/preview`) and the host's event page (`/events/[id]`) all draw the
 * poster inside this frame, so it is the same poster at the same size on all
 * four screens — the poster is square, so one width is one height.
 *
 * The `svh` cap is what keeps the RSVP block under the poster above the fold on
 * a laptop: on a short viewport the poster gives up width instead of pushing
 * the choices out of sight.
 */
export const POSTER_FRAME =
  "mx-auto w-full max-w-[clamp(10rem,calc(100svh-23rem),23rem)]";

/**
 * The poster card: square, one radius, one shadow. Kept here so the create page,
 * the invitation and the dashboard hero can't drift apart on either.
 */
export const POSTER_CARD =
  "w-full overflow-hidden rounded-panel shadow-[0_18px_44px_rgba(18,18,22,0.22)]";

export default function EventPreview({ draft }: { draft: EventDraft }) {
  const poster = posters.find((p) => p.id === draft.posterId) ?? posters[0];
  const font = fonts.find((f) => f.id === draft.fontId) ?? fonts[0];

  return (
    <div className={POSTER_CARD}>
      <Poster
        poster={poster}
        title={draft.title || "Untitled event"}
        when={whenOf(draft) || "Pick a date"}
        where={whereOf(draft) || "Add a location"}
        fontClass={font.className}
        image={draft.image}
      />
    </div>
  );
}