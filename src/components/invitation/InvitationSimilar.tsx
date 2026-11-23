import Link from "next/link";
import { Poster } from "@/components/create-event/EventPreview";
import { posters } from "@/components/create-event/posters";
import { fonts } from "@/components/create-event/themes";
import { Icon } from "@/components/ui/Icon";
import { SimilarEvent } from "@/hooks/useSimilarEvents";

function formatCompactDate(dateStr?: string | null) {
  if (!dateStr) return "";
  const parsed = new Date(dateStr);
  if (Number.isNaN(parsed.getTime())) return dateStr;
  return parsed.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function buildCardTitle(item: SimilarEvent) {
  const name = item.name?.trim() || "Untitled event";
  const venue = item.venueName?.trim();
  return venue ? `${name} @ ${venue}` : name;
}

export default function InvitationSimilar({
  events,
}: {
  events: SimilarEvent[];
}) {
  if (!events.length) return null;

  return (
    <section
      className="mt-8"
      aria-labelledby="similar-events-title"
    >
      <div className="flex items-center justify-between gap-3 border-b border-[color:var(--line)] pb-3">
        <h2
          id="similar-events-title"
          className="font-display text-xl font-bold tracking-tight text-[color:var(--ink)] sm:text-2xl"
        >
          Similar events
        </h2>

        <Link
          href="/discover"
          className="group inline-flex shrink-0 items-center gap-1 text-[13px] font-semibold text-[color:var(--soft)] transition hover:text-[color:var(--ink)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--ring)]"
        >
          See all
          <Icon
            name="chevron-right"
            size={16}
          />
        </Link>
      </div>

      <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-3.5">
        {events.map((item) => {
          const poster =
            posters.find(
              (p) => String(p.id) === String(item.eventColors?.posterId),
            ) ?? posters[0];

          const font =
            fonts.find(
              (f) => String(f.id) === String(item.eventColors?.fontId),
            ) ?? fonts[0];

          const compactDate = formatCompactDate(item.date);
          const displayTitle = buildCardTitle(item);
          const subDetail = [compactDate, item.location]
            .filter(Boolean)
            .join(" · ");

          return (
            <li key={item.id} className="min-w-0">
              <Link
                href={`/e/${item.slug}`}
                className="group block focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--ring)]"
              >
                <div className="relative aspect-square overflow-hidden rounded-lg border border-[color:var(--line)] transition duration-200 group-hover:-translate-y-0.5 group-hover:border-[color:var(--ink)]">
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0 transition duration-300 group-hover:scale-105 [&>*]:h-full [&>*]:w-full [&_img]:h-full [&_img]:w-full [&_img]:object-cover"
                  >
                    <Poster
                      poster={poster}
                      title={item.name || ""}
                      when={compactDate}
                      where={item.venueName || item.location || ""}
                      fontClass={font.className}
                      image={item.imageUrl ?? undefined}
                      small
                    />
                  </div>
                </div>

                <p className="mt-2 line-clamp-2 text-[13px] font-bold leading-tight tracking-tight text-[color:var(--ink)]">
                  {displayTitle}
                </p>

                {subDetail && (
                  <p className="mt-0.5 truncate text-[11px] font-medium text-[color:var(--soft)]">
                    {subDetail}
                  </p>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}