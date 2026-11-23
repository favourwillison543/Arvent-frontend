import { ArrowUpRight } from "lucide-react";

import { Icon } from "@/components/ui/Icon";

type Props = {
  isoDate: string;
  date: string;
  times: string;
  venue: string;
  address: string;
  mapsHref: string;
};

function parts(iso: string) {
  if (!iso) return null;

  const value = new Date(`${iso}T00:00`);
  if (Number.isNaN(value.getTime())) return null;

  return {
    month: value.toLocaleDateString("en-US", { month: "short" }).toUpperCase(),
    day: value.getDate(),
    // "Saturday, November 28": US order, so the month comes before the day.
    label: value.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    }),
  };
}

/* No font class anywhere in this file: the text inherits the page font, the
   same as the host line and the description. */
const tileBox =
  "flex size-11 shrink-0 flex-col items-center justify-center overflow-hidden rounded-xl border border-[color:var(--ink)]/15 bg-[color:var(--ink)]/5";

const primary = "block truncate text-[15px] font-semibold leading-tight";
const secondary = "ev-muted mt-0.5 block truncate text-sm leading-tight";

export default function InvitationTiles({
  isoDate,
  date,
  times,
  venue,
  address,
  mapsHref,
}: Props) {
  const when = parts(isoDate);
  const place = venue || address;

  const where = (
    <>
      <span className={tileBox}>
        <Icon name="pin" size={18} />
      </span>

      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-1">
          <span className={primary}>{place || "Venue to be announced"}</span>
          {mapsHref && (
            <ArrowUpRight className="size-4 shrink-0 opacity-60" aria-hidden />
          )}
        </span>
        <span className={secondary}>
          {venue && address ? address : "The host will confirm the address"}
        </span>
      </span>
    </>
  );

  return (
    <div className="flex flex-col gap-3.5">
      {/* Date */}
      <div className="flex items-center gap-3">
        {when ? (
          <span className={tileBox}>
            <span className="text-[9px] font-bold uppercase leading-none tracking-widest opacity-70">
              {when.month}
            </span>
            <span className="mt-0.5 text-lg font-bold leading-none tabular-nums">
              {when.day}
            </span>
          </span>
        ) : (
          <span className={tileBox}>
            <Icon name="calendar" size={18} />
          </span>
        )}

        <span className="min-w-0 flex-1">
          <span className={primary}>{when ? when.label : date}</span>
          <span className={secondary}>{times || "Time to be announced"}</span>
        </span>
      </div>

      {/* Venue */}
      {mapsHref ? (
        <a
          href={mapsHref}
          target="_blank"
          rel="noreferrer"
          aria-label={`Open ${place || "the venue"} in maps`}
          className="flex items-center gap-3 rounded-xl transition-opacity hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[color:var(--ring)]"
        >
          {where}
        </a>
      ) : (
        <div className="flex items-center gap-3">{where}</div>
      )}
    </div>
  );
}