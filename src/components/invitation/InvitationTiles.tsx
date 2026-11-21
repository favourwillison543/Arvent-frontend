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
    month: value
      .toLocaleDateString("en-NG", { month: "short" })
      .toUpperCase(),
    day: value.getDate(),
    weekday: value.toLocaleDateString("en-NG", { weekday: "long" }),
  };
}

/* Faint contour circles + sparkles behind the date. Drawn in currentColor. */
function ContourArt() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 200 120"
      preserveAspectRatio="xMaxYMid slice"
      className="pointer-events-none absolute inset-y-0 right-0 h-full w-auto opacity-[0.14]"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
    >
      <circle cx="150" cy="50" r="26" />
      <circle cx="150" cy="50" r="44" />
      <circle cx="150" cy="50" r="64" />
      <circle cx="150" cy="50" r="86" />
      <path
        d="M172 98l2.5 6 6 2.5-6 2.5-2.5 6-2.5-6-6-2.5 6-2.5z"
        fill="currentColor"
        stroke="none"
      />
      <path
        d="M104 80l1.8 4.2 4.2 1.8-4.2 1.8-1.8 4.2-1.8-4.2-4.2-1.8 4.2-1.8z"
        fill="currentColor"
        stroke="none"
      />
      <circle cx="112" cy="32" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="194" cy="84" r="1.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

/* Faint street map behind the venue. Drawn in currentColor. */
function MapArt() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 220 120"
      preserveAspectRatio="xMaxYMid slice"
      className="pointer-events-none absolute inset-y-0 right-0 h-full w-auto opacity-[0.14]"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
    >
      <path d="M60 0l-6 120" />
      <path d="M118 0l-4 120" />
      <path d="M160 0l-10 120" />
      <path d="M90 78c40-10 70-6 130 14" strokeWidth="9" opacity="0.55" />
      <path d="M90 78c40-10 70-6 130 14" strokeDasharray="5 5" />
      <rect x="40" y="20" width="32" height="22" rx="4" />
      <rect x="168" y="14" width="26" height="26" rx="13" />
      <rect x="150" y="88" width="34" height="22" rx="4" />
    </svg>
  );
}

/**
 * When and where, side by side.
 *
 * Same look as the reference design: contour art behind the date, street map
 * behind the venue, a calendar-style date mark, a haloed pin square and an
 * underlined "View on map".
 *
 * The old lime is replaced by the theme's ink colour. Only the month band and
 * the pin square are filled (`.ev-accent`), and their text/icon always uses the
 * contrasting colour (`--on-ink`), so it stays readable on light and dark
 * invitations. Everything else keeps the normal text colour.
 */
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

  const dateTile = (
    <div className="ev-tile relative overflow-hidden">
      <ContourArt />

      {when ? (
        <span className="relative flex size-[60px] shrink-0 flex-col overflow-hidden rounded-2xl bg-white shadow-md">
          <span className="ev-accent flex h-[22px] items-center justify-center text-[11px] font-bold uppercase leading-none tracking-widest">
            {when.month}
          </span>
          <span className="flex flex-1 items-center justify-center font-display text-2xl font-bold leading-none tabular-nums text-black">
            {when.day}
          </span>
        </span>
      ) : (
        <span className="ev-accent relative flex size-[60px] shrink-0 items-center justify-center rounded-2xl">
          <Icon name="calendar" size={24} />
        </span>
      )}

      <span className="relative min-w-0">
        <span className="block truncate text-base font-semibold">
          {when ? when.weekday : date}
        </span>
        <span className="ev-muted mt-0.5 block truncate text-sm">
          {times || (when ? date : "Time to be announced")}
        </span>
      </span>
    </div>
  );

  const placeInner = (
    <>
      <MapArt />

      <span className="relative flex size-[60px] shrink-0 items-center justify-center">
        <span
          aria-hidden
          className="absolute -inset-3 rounded-[28px] bg-[color:var(--ink)] opacity-[0.07]"
        />
        <span className="ev-accent relative flex size-full items-center justify-center rounded-2xl">
          <Icon name="pin" size={24} />
        </span>
      </span>

      <span className="relative min-w-0 flex-1">
        <span className="block truncate text-base font-semibold">
          {venue || address || "Venue to be announced"}
        </span>
        <span className="ev-muted mt-0.5 block truncate text-sm">
          {venue && address
            ? address
            : venue
              ? venue
              : "The host will confirm the address"}
        </span>
        {mapsHref && (
          <span className="mt-1 block text-sm font-medium underline underline-offset-4">
            View on map
          </span>
        )}
      </span>
    </>
  );

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {dateTile}

      {mapsHref ? (
        <a
          href={mapsHref}
          target="_blank"
          rel="noreferrer"
          aria-label={`Open ${place || "the venue"} in maps`}
          className="ev-tile relative overflow-hidden transition-colors hover:border-[color:var(--ink)]"
        >
          {placeInner}
        </a>
      ) : (
        <div className="ev-tile relative overflow-hidden">{placeInner}</div>
      )}
    </div>
  );
}

