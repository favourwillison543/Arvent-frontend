import { Heart, Sparkles } from "lucide-react";

import type { MomentKind } from "./data";

/*
  Small, static compositions of each Moment type. Text is sized in "cqw"
  (a % of the tile's own width) so it scales from a tiny card to a big one.
  That is also why the type floor and the spacing grid don't apply inside: this
  is a drawing of a card at whatever size the tile is, so `text-[8cqw]` and
  `p-[8cqw]` are measurements of the picture. Colours are paint, not tokens —
  see the note at the top of `create-event/posterDesigns.tsx`.
*/
export function MiniMoment({
  kind,
  className = "",
}: {
  kind: MomentKind;
  className?: string;
}) {
  const base = `relative aspect-[4/5] w-full overflow-hidden rounded-panel [container-type:inline-size] ${className}`;
  const inner =
    "absolute inset-0 flex flex-col items-center justify-center gap-[3cqw] p-[8cqw] text-center";

  if (kind === "save-the-date") {
    return (
      <div className={base} style={{ background: "linear-gradient(160deg,#3b1d4d,#150a1f)", color: "#f3e8ff" }}>
        <div className={inner}>
          <p className="text-[3.6cqw] font-semibold uppercase tracking-[0.3em] opacity-70">Save the date</p>
          <p className="font-accent text-[16cqw] italic leading-[0.95]">
            Chika
            <span className="block text-[8cqw] opacity-60">&amp;</span>
            Emeka
          </p>
          <p className="text-[5cqw] tracking-[0.2em]">18 · 10 · 2027</p>
          <p className="text-[3.4cqw] uppercase tracking-[0.3em] opacity-70">Lagos</p>
        </div>
      </div>
    );
  }

  if (kind === "announcement") {
    return (
      <div className={base} style={{ background: "#ffe3d3", color: "#4a1d1d" }}>
        <div className={inner}>
          <div
            className="h-[34cqw] w-[26cqw] rounded-t-full"
            style={{ background: "linear-gradient(180deg,#f0a58d,#ff9fd0)" }}
          />
          <p className="font-display text-[10cqw] font-bold uppercase leading-none">It&apos;s a girl</p>
          <p className="text-[4.2cqw] opacity-80">Ada arrives this December.</p>
          <Heart className="size-[6cqw] fill-current text-[#e0566e]" aria-hidden />
        </div>
      </div>
    );
  }

  if (kind === "milestone") {
    return (
      <div className={base} style={{ background: "linear-gradient(160deg,#f6d36b,#e0a93a)", color: "#2a1a05" }}>
        <div className={inner}>
          <Sparkles className="size-[7cqw]" aria-hidden />
          <p className="font-display text-[20cqw] font-bold uppercase leading-[0.9]">
            I did
            <br />
            it.
          </p>
          <p className="text-[4.2cqw] font-semibold uppercase tracking-[0.25em]">Class of 2026</p>
        </div>
      </div>
    );
  }

  return (
    <div className={base} style={{ background: "#f6f2ea", color: "var(--poster-ink)" }}>
      <div className={inner}>
        <div
          className="size-[34cqw] -rotate-3 border-[1.6cqw] border-white shadow-lg"
          style={{ background: "linear-gradient(135deg,#c9b2e6,#9fd3f0)" }}
        />
        <p className="font-accent text-[8.5cqw] italic leading-tight">
          Thank you
          <br />
          for being there
        </p>
        <p className="text-[3.8cqw] opacity-70">
          <b className="font-display text-[6cqw] opacity-100">86</b> people celebrated with us
        </p>
      </div>
    </div>
  );
}
