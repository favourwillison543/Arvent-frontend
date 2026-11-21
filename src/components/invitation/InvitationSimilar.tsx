import Link from "next/link";
import { fmtDate } from "@/components/create-event/format";
import { Poster } from "@/components/create-event/EventPreview";
import { posters } from "@/components/create-event/posters";
import { fonts } from "@/components/create-event/themes";
import { Icon } from "@/components/ui/Icon";
import { SimilarEvent } from "@/hooks/useSimilarEvents";

/**
 * Similar events.
 *
 * Each card is just the event's poster, with a small dark gradient at the
 * bottom that carries the title, date and venue. No separate text block, so the
 * card stays short. On phones the row scrolls sideways; from `sm` it is a
 * 3-column grid.
 *
 * The overlay text is always white: it sits on its own dark gradient, so it
 * reads the same on light and dark invitations.
 */
export default function InvitationSimilar({
  events,
}: {
  events: SimilarEvent[];
}) {
  if (!events.length) return null;

  return (
    <section className="mt-8" aria-labelledby="similar-events-title">
      <h2
        id="similar-events-title"
        className="font-display text-xl font-bold tracking-tight"
      >
        Similar events
      </h2>

      <ul
        className="
          -mx-1 mt-3 flex snap-x snap-mandatory gap-3 overflow-x-auto px-1 pb-1
          [scrollbar-width:none] [&::-webkit-scrollbar]:hidden
          sm:mx-0 sm:grid sm:grid-cols-3 sm:gap-3 sm:overflow-visible sm:px-0 sm:pb-0
        "
      >
        {events.map((item) => {
          const place = item.venueName || item.location;

          const poster =
            posters.find(
              (p) => String(p.id) === String(item.eventColors?.posterId),
            ) ?? posters[0];

          const font =
            fonts.find(
              (f) => String(f.id) === String(item.eventColors?.fontId),
            ) ?? fonts[0];

          return (
            <li
              key={item.id}
              className="w-[44%] shrink-0 snap-start min-[480px]:w-[34%] sm:w-auto"
            >
              <Link
                href={`/e/${item.slug}`}
                className="group relative block aspect-[4/5] overflow-hidden rounded-2xl border border-[color:var(--line)] transition duration-200 hover:-translate-y-0.5 hover:border-[color:var(--ink)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--ring)]"
              >
                {/* Poster fills the whole card. Its own text is left empty
                    because the overlay below carries the title, date and
                    venue. */}
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0 transition duration-300 group-hover:scale-105 [&>*]:h-full [&>*]:w-full [&_img]:h-full [&_img]:w-full [&_img]:object-cover"
                >
                  <Poster
                    poster={poster}
                    title=""
                    when=""
                    where=""
                    fontClass={font.className}
                    image={item.imageUrl ?? undefined}
                    small
                  />
                </div>

                {/* Small overlay at the bottom */}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/55 to-transparent px-2.5 pb-2.5 pt-10 text-white">
                  <p className="line-clamp-2 text-[13px] font-semibold leading-tight">
                    {item.name || "Untitled event"}
                  </p>

                  <p className="mt-1 flex min-w-0 items-center gap-1 text-[11px] leading-tight text-white/80">
                    <Icon name="calendar" size={11} />
                    <span className="shrink-0">{fmtDate(item.date)}</span>
                  </p>

                  {place && (
                    <p className="mt-0.5 flex min-w-0 items-center gap-1 text-[11px] leading-tight text-white/80">
                      <Icon name="pin" size={11} />
                      <span className="truncate">{place}</span>
                    </p>
                  )}
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}