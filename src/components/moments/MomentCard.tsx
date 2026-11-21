import { Heart, Sparkles } from "lucide-react";

import type { ReactNode } from "react";

import type { Moment } from "./data";

/* The card itself: your photo, or a designed face when there's no photo.
 *
 * The designed face is a drawing, not UI: it is laid out in container units
 * (`46cqw`, `2cqw`, `5cqw`) so it scales with whatever box it lands in, and its
 * radii and type are part of that drawing — `rounded-[3cqw]` and `rounded-md`
 * below size themselves with the card and are deliberately outside the
 * `rounded-field` / `panel` / `sheet` scale. Same for the type sizes in this
 * file, which are not read as body text. The face palette's hexes below are
 * paint, not tokens, for the same reason. */

const faces: Record<Moment["kind"], { bg: string; ink: string; accent: string }> = {
  "save-the-date": { bg: "#efe7f6", ink: "#2a1f3d", accent: "#c9b2e6" },
  announcement: { bg: "#fbe9df", ink: "#4a2a22", accent: "#f0a58d" },
  milestone: { bg: "#f7edcf", ink: "#3d2f0f", accent: "#e8c878" },
  "thank-you": { bg: "#eef0e4", ink: "#1a1a2e", accent: "#b7dc6a" },
};

const MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

function Face({ m }: { m: Moment }) {
  const f = faces[m.kind];
  const [y, mo, d] = m.date ? m.date.split("-") : ["", "", ""];

  return (
    <div
      className="flex h-full w-full items-center justify-center"
      style={{
        backgroundColor: f.bg,
        backgroundImage: "radial-gradient(rgba(0,0,0,.06) 1px, transparent 1.5px)",
        backgroundSize: "14px 14px",
        color: f.ink,
      }}
    >
      {m.kind === "save-the-date" &&
        (m.date ? (
          <div className="flex w-[46cqw] flex-col overflow-hidden rounded-[3cqw] bg-white text-center">
            <div
              className="py-[2cqw] text-[5cqw] font-bold tracking-[0.2em]"
              style={{ background: f.accent }}
            >
              {MONTHS[Number(mo) - 1]}
            </div>
            <div className="py-[3cqw] font-display text-[24cqw] font-bold leading-none">{Number(d)}</div>
            <div className="pb-[3cqw] text-[4.5cqw] tracking-[0.2em] opacity-70">{y}</div>
          </div>
        ) : (
          <p className="font-accent text-[46cqw] italic leading-none" style={{ color: f.accent }}>
            &amp;
          </p>
        ))}

      {m.kind === "announcement" && (
        <div
          className="flex h-[58cqw] w-[44cqw] items-center justify-center rounded-t-full text-[18cqw] text-white"
          style={{ background: f.accent }}
        >
          <Heart className="size-[18cqw] fill-current" aria-hidden />
        </div>
      )}

      {m.kind === "milestone" && (
        <div
          className="flex size-[54cqw] items-center justify-center rounded-full text-[26cqw]"
          style={{ background: f.accent }}
        >
          <Sparkles className="size-[26cqw] fill-current" aria-hidden />
        </div>
      )}

      {m.kind === "thank-you" && (
        <Heart className="size-[50cqw] fill-current" style={{ color: f.accent }} aria-hidden />
      )}
    </div>
  );
}

export default function MomentCard({
  moment: m,
  children,
}: {
  moment: Moment;
  children?: ReactNode;
}) {
  // editorial = card tucked in an envelope, photo = bigger and straight, minimal = flat
  const envelope = m.style === "editorial";
  const big = m.style === "photo";

  return (
    <div className={`relative mx-auto ${big ? "w-[min(86vw,24rem)]" : "w-[min(70vw,18.5rem)]"}`}>
      {envelope && (
        <div
          aria-hidden
          className="absolute inset-0 translate-x-[7%] -translate-y-[3%] rotate-[8deg] rounded-md"
          style={{ background: "#e9dec6" }}
        >
          <div
            className="absolute right-0 top-0 h-1/2 w-1/2 [clip-path:polygon(0_0,100%_0,100%_100%)]"
            style={{ background: "#f3ead6" }}
          />
        </div>
      )}

      <div
        className="relative aspect-square w-full overflow-hidden rounded-md border border-black/10 shadow-[0_6px_18px_rgba(0,0,0,0.18)] [container-type:inline-size]"
        style={{ transform: envelope ? "rotate(-5deg)" : undefined }}
      >
        {m.photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={m.photo} alt="" className="h-full w-full object-cover" />
        ) : (
          <Face m={m} />
        )}
        {children}
      </div>
    </div>
  );
}
