/* Poster kit: the shared layout pieces (Art, Stack, Title, Details...) every
   poster design is built from, plus the helpers that keep them in sync.

   Hexes here are paint, not tokens — see the note at the top of
   `posterDesigns.tsx`. */

import type { CSSProperties, ReactNode } from "react";

import type { PosterDef } from "./posters";

/* The poster's shape, in one place.
   Square: this is the shape the design catalogue is drawn for and the shape the
   cover image is cropped to, so a poster is never letterboxed and never a
   different shape on a different screen. `<Art>` fills any box with `slice` and
   the text stack is measured in `cqw`, so the artwork recomposes itself inside
   the square instead of leaving bands. */
export const RATIO = "1 / 1";

export type Ctx = {
  poster: PosterDef;
  title: string;
  when: string;
  where: string;
  fontClass: string;
  small: boolean;
  size: number;
};

export const fill: CSSProperties = { position: "absolute", inset: 0 };
export const cq = (n: number) => `${n}cqw`;

export const baseSize = (title: string) => {
  const n = title.trim().length;
  return n <= 9 ? 16 : n <= 16 ? 12.5 : n <= 26 ? 9.5 : 7.5;
};

export function Art({ children }: { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 100 125"
      preserveAspectRatio="xMidYMid slice"
      style={{ ...fill, width: "100%", height: "100%" }}
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

export function Stack({
  justify = "flex-end",
  align = "flex-start",
  padX = 8,
  padY = 8,
  gap = 2.5,
  children,
}: {
  justify?: CSSProperties["justifyContent"];
  align?: CSSProperties["alignItems"];
  padX?: number;
  padY?: number;
  gap?: number;
  children: ReactNode;
}) {
  return (
    <div
      style={{
        ...fill,
        display: "flex",
        flexDirection: "column",
        justifyContent: justify,
        alignItems: align,
        padding: `${padY}cqw ${padX}cqw`,
        gap: cq(gap),
      }}
    >
      {children}
    </div>
  );
}

export function InvitedTag({ accent, small }: { accent?: string; small?: boolean }) {
  return (
    <p
      style={{
        margin: 0,
        fontSize: cq(small ? 3.2 : 3.0),
        fontWeight: 600,
        textTransform: "uppercase",
        letterSpacing: cq(0.18),
        color: accent ?? "inherit",
        opacity: accent ? 1 : 0.85,
      }}
    >
      You&apos;re invited
    </p>
  );
}

export function Title({
  c,
  mult = 1,
  style,
}: {
  c: Ctx;
  mult?: number;
  style?: CSSProperties;
}) {
  return (
    <h3
      className={c.fontClass}
      style={
        {
          margin: 0,
          fontSize: cq(c.size * mult),
          lineHeight: 0.95,
          overflowWrap: "anywhere",
          textWrap: "balance",
          textAlign: "left",
          ...style,
        } as CSSProperties
      }
    >
      {c.title}
    </h3>
  );
}

export function Details({
  c,
  align = "left",
  style,
}: {
  c: Ctx;
  align?: CSSProperties["textAlign"];
  style?: CSSProperties;
}) {
  if (c.small) {
    return (
      <div style={{ fontSize: cq(3.2), lineHeight: 1.3, textAlign: align, ...style }}>
        <p style={{ margin: 0, fontWeight: 600 }}>{c.when}</p>
        <p style={{ margin: 0, opacity: 0.75 }}>{c.where}</p>
      </div>
    );
  }
  return (
    <div style={{ fontSize: cq(3.6), lineHeight: 1.35, textAlign: align, ...style }}>
      <p style={{ margin: 0, fontWeight: 600 }}>{c.when}</p>
      <p style={{ margin: 0, opacity: 0.75 }}>{c.where}</p>
    </div>
  );
}

export function Sparkle({
  x,
  y,
  s,
  fill: f,
  rot = 0,
  o = 1,
}: {
  x: number;
  y: number;
  s: number;
  fill: string;
  rot?: number;
  o?: number;
}) {
  return (
    <path
      d="M0,-1 C.14,-.36 .36,-.14 1,0 C.36,.14 .14,.36 0,1 C-.14,.36 -.36,.14 -1,0 C-.36,-.14 -.14,-.36 0,-1Z"
      transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}
      fill={f}
      fillOpacity={o}
    />
  );
}

export function Squiggle({
  x,
  y,
  color,
  w = 1.6,
  n = 4,
}: {
  x: number;
  y: number;
  color: string;
  w?: number;
  n?: number;
}) {
  return (
    <path
      d={`M${x},${y} q4,-6 8,0 ${"t8,0 ".repeat(n - 1)}`}
      fill="none"
      stroke={color}
      strokeWidth={w}
      strokeLinecap="round"
    />
  );
}

export function Balloon({ x, y, color, s = 1 }: { x: number; y: number; color: string; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M0,-9 C6,-9 8,-3 8,1 C8,7 3,11 0,12 C-3,11 -8,7 -8,1 C-8,-3 -6,-9 0,-9Z" fill={color} />
      <path d="M0,12 l-1.6,2.4 h3.2z" fill={color} />
      <path d="M0,14.4 C-2,20 2,24 0,32" fill="none" stroke="#1a1a2e" strokeWidth=".35" />
      <ellipse cx="-3" cy="-3" rx="1.3" ry="2.6" fill="#fff" fillOpacity=".5" transform="rotate(20 -3 -3)" />
    </g>
  );
}

export function Sprig({
  x,
  y,
  rot,
  s,
  color,
  flip,
}: {
  x: number;
  y: number;
  rot: number;
  s: number;
  color: string;
  flip?: boolean;
}) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${flip ? -s : s} ${s})`}>
      <path d="M0,0 C-1,-14 1,-28 0,-42" fill="none" stroke={color} strokeWidth=".8" strokeLinecap="round" />
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const yy = -6 - i * 6;
        const k = 1 - i * 0.07;
        return (
          <g key={i}>
            <ellipse cx={-4.6 * k} cy={yy} rx={4.8 * k} ry={1.9 * k} transform={`rotate(28 ${-4.6 * k} ${yy})`} fill={color} />
            <ellipse cx={4.6 * k} cy={yy - 3} rx={4.8 * k} ry={1.9 * k} transform={`rotate(-28 ${4.6 * k} ${yy - 3})`} fill={color} />
          </g>
        );
      })}
      <ellipse cx="0" cy="-43" rx="1.6" ry="3.6" fill={color} />
    </g>
  );
}

export function Cloud({ x, y, s = 1, color = "#fff", o = 1 }: { x: number; y: number; s?: number; color?: string; o?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} fill={color} fillOpacity={o}>
      <circle cx="-8" cy="2" r="6" />
      <circle cx="0" cy="-2" r="8" />
      <circle cx="9" cy="2" r="6.4" />
      <rect x="-14" y="2" width="29" height="6.4" rx="3.2" />
    </g>
  );
}
