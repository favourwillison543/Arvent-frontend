import type { CSSProperties } from "react";

/*
  Effect + RSVP artwork. Every motif is drawn as layered parts and can be
  shown two ways:
    variant="line"   (default) refined duotone outline with soft fill.
    variant="solid"  glossy filled vector artwork with highlights and shading.

  The colours are paint, not tokens — see the note at the top of
  `posterDesigns.tsx`.
*/

type Role = "body" | "line" | "stroke" | "shine" | "shade" | "eye" | "dot";
type Part = { d: string; r: Role };

const f = (n: number) => +n.toFixed(2);

const circle = (cx: number, cy: number, r: number) =>
  `M${f(cx - r)},${f(cy)} a${r},${r} 0 1 0 ${f(r * 2)},0 a${r},${r} 0 1 0 ${f(-r * 2)},0Z`;

const ellipse = (cx: number, cy: number, rx: number, ry: number) =>
  `M${f(cx - rx)},${f(cy)} a${rx},${ry} 0 1 0 ${f(rx * 2)},0 a${rx},${ry} 0 1 0 ${f(-rx * 2)},0Z`;

/** Five-point star with softly pinched sides. */
const star = (cx: number, cy: number, R: number, r: number, n = 5) => {
  const pts = Array.from({ length: n * 2 }, (_, i) => {
    const a = -Math.PI / 2 + (i * Math.PI) / n;
    const rad = i % 2 === 0 ? R : r;
    return [cx + rad * Math.cos(a), cy + rad * Math.sin(a)];
  });
  return `M${pts.map((p) => `${f(p[0])},${f(p[1])}`).join("L")}Z`;
};

/** Four-point sparkle with concave sides. */
const sparkle = (cx: number, cy: number, r: number, k = 0.2) => {
  const q = r * k;
  return `M${cx},${f(cy - r)}Q${f(cx + q)},${f(cy - q)} ${f(cx + r)},${cy}Q${f(cx + q)},${f(cy + q)} ${cx},${f(cy + r)}Q${f(cx - q)},${f(cy + q)} ${f(cx - r)},${cy}Q${f(cx - q)},${f(cy - q)} ${cx},${f(cy - r)}Z`;
};

const HEART =
  "M32 58C12 44 4 32 4 20C4 10 11 4 20 4C26 4 30 8 32 13C34 8 38 4 44 4C53 4 60 10 60 20C60 32 52 44 32 58Z";

const PETAL = "M32 32C20 22 20 8 32 2C44 8 44 22 32 32Z";

const ICONS: Record<string, Part[]> = {
  heart: [
    { d: HEART, r: "body" },
    { d: "M11 20C11 13 15 8 21 8C16 11 14 16 15 23Z", r: "shine" },
    { d: "M32 58C20 49 12 39 10 30C18 36 26 48 32 58Z", r: "shade" },
  ],
  "heart-pulse": [
    { d: HEART, r: "body" },
    { d: "M8 32h14l5-12 8 24 6-12h15", r: "line" },
  ],
  "heart-break": [
    { d: HEART, r: "body" },
    { d: "M38 6L28 22L39 30L29 44L34 58", r: "line" },
  ],
  lips: [
    { d: "M4 32C13 28 21 16 32 16C43 16 51 28 60 32C53 48 43 56 32 56C21 56 11 48 4 32Z", r: "body" },
    { d: "M5 32C16 34 22 40 32 40C42 40 48 34 59 32", r: "line" },
    { d: "M20 47C25 50 30 51 35 50C28 51 23 50 18 46Z", r: "shine" },
  ],
  balloon: [
    { d: "M32 4C48 4 56 16 56 30C56 44 44 54 32 56C20 54 8 44 8 30C8 16 16 4 32 4Z", r: "body" },
    { d: "M28 56L32 62L36 56Z", r: "body" },
    { d: "M32 62C27 65 37 68 32 72", r: "line" },
    { d: "M18 22C18 14 23 8 30 7C24 10 23 17 23 24Z", r: "shine" },
  ],
  flame: [
    { d: "M34 4C37 16 31 20 26 27C22 21 18 18 18 18C10 27 6 35 9 45C12 55 21 62 33 62C46 62 56 53 57 41C59 28 50 16 38 7C38 15 37 20 34 24C33 18 32 12 34 4Z", r: "body" },
    { d: "M33 58C26 58 20 53 21 47C21 42 25 38 29 33C31 38 35 40 38 44C41 50 38 58 33 58Z", r: "shine" },
  ],
  money: [
    { d: "M4 12H60A4 4 0 0 1 64 16V48A4 4 0 0 1 60 52H4A4 4 0 0 1 0 48V16A4 4 0 0 1 4 12Z", r: "body" },
    { d: "M6 16H58V44H6Z", r: "line" },
    { d: circle(32, 30, 10), r: "shine" },
    { d: circle(32, 30, 10), r: "line" },
    { d: circle(12, 22, 2.5) + circle(52, 38, 2.5) + circle(12, 38, 2.5) + circle(52, 22, 2.5), r: "eye" },
  ],
  music: [
    { d: "M22 52V12L56 4V42H48V16L28 21V52Z", r: "body" },
    { d: ellipse(16, 52, 10, 7.5), r: "body" },
    { d: ellipse(42, 42, 10, 7.5), r: "body" },
    { d: "M10 50C11 47 15 46 19 46", r: "shine" },
  ],
  star: [
    { d: star(32, 32, 30, 13), r: "body" },
    { d: "M32 8L37 22L27 25Z", r: "shine" },
  ],
  sparkle: [
    { d: sparkle(28, 38, 26), r: "body" },
    { d: sparkle(50, 12, 11), r: "body" },
    { d: sparkle(56, 48, 7), r: "body" },
  ],
  fireworks: [
    { d: "M32 28V4M32 60V36M28 32H4M60 32H36M16 16L6 6M58 58L48 48M48 16L58 6M6 58L16 48", r: "stroke" },
    { d: circle(32, 32, 6), r: "body" },
  ],
  snow: [
    { d: "M32 4V60M6 18L58 46M6 46L58 18", r: "stroke" },
    { d: "M24 10L32 18L40 10M24 54L32 46L40 54M10 26L18 28L16 20M54 38L46 36L48 44M10 38L18 36L16 44M54 26L46 28L48 20", r: "stroke" },
  ],
  ghost: [
    { d: "M8 60V28A24 24 0 0 1 56 28V60L48 54L40 60L32 54L24 60L16 54Z", r: "body" },
    { d: "M18 24C20 16 27 12 34 12C27 14 22 19 21 28Z", r: "shine" },
    { d: circle(22, 30, 3.2) + circle(42, 30, 3.2), r: "eye" },
    { d: "M26 40C29 44 35 44 38 40", r: "line" },
  ],
  bat: [
    { d: "M4 18C12 18 16 22 20 30L26 22L32 30L38 22L44 30C48 22 52 18 60 18L56 46L47 40L40 50L32 40L24 50L17 40L8 46Z", r: "body" },
    { d: circle(26, 30, 2) + circle(38, 30, 2), r: "eye" },
  ],
  spider: [
    { d: "M24 30C16 25 10 18 6 10M22 35C13 34 7 36 2 40M23 40C16 45 11 52 8 60M40 30C48 25 54 18 58 10M42 35C51 34 57 36 62 40M41 40C48 45 53 52 56 60", r: "stroke" },
    { d: circle(32, 42, 12), r: "body" },
    { d: circle(32, 22, 8), r: "body" },
    { d: circle(29, 21, 1.8) + circle(35, 21, 1.8), r: "eye" },
    { d: "M26 38C28 35 34 35 36 38", r: "shine" },
  ],
  leaf: [
    { d: "M8 58C6 30 24 6 58 6C60 38 42 60 8 58Z", r: "body" },
    { d: "M10 56L48 18M28 40L21 38M37 31L33 22M44 26L52 26", r: "line" },
    { d: "M18 38C21 28 30 19 42 14C32 20 24 29 22 40Z", r: "shine" },
  ],
  petal: [
    { d: "M32 4C50 16 54 38 32 62C10 38 14 16 32 4Z", r: "body" },
    { d: "M32 12V52", r: "line" },
    { d: "M21 22C23 16 27 12 31 8C27 15 25 22 25 31Z", r: "shine" },
  ],
  flower: [
    { d: PETAL, r: "body" },
    { d: circle(32, 32, 8), r: "shine" },
  ],
  bud: [
    { d: "M32 62V38", r: "stroke" },
    { d: "M32 38C18 36 14 18 32 4C50 18 46 36 32 38Z", r: "body" },
    { d: "M32 54C22 54 16 50 12 42C21 42 30 47 32 54Z", r: "body" },
    { d: "M32 50C42 50 48 46 52 38C43 38 34 42 32 50Z", r: "body" },
    { d: "M21 22C22 16 27 10 31 8C27 14 25 21 25 29Z", r: "shine" },
  ],
  confetti: [
    { d: "M8 14L24 7L30 23L14 30Z", r: "body" },
    { d: "M42 5L61 16L44 27Z", r: "body" },
    { d: "M35 38L52 32L59 49L42 55Z", r: "body" },
    { d: circle(15, 48, 8), r: "body" },
    { d: "M26 34Q30 26 34 34T42 34", r: "stroke" },
  ],
  "piece-rect": [
    { d: "M8 26L48 10L58 32L18 48Z", r: "body" },
    { d: "M8 26L48 10L50 14L10 30Z", r: "shine" },
  ],
  "piece-tri": [
    { d: "M32 6L60 54L4 50Z", r: "body" },
    { d: "M32 6L60 54L52 54L32 18Z", r: "shade" },
  ],
  "piece-dot": [
    { d: circle(32, 32, 22), r: "body" },
    { d: "M18 28C19 20 25 14 33 13C26 16 22 21 21 30Z", r: "shine" },
  ],
  "piece-ribbon": [
    { d: "M4 38C13 18 24 16 33 30C42 44 50 42 62 20L64 29C49 52 36 54 25 38C18 28 12 30 6 46Z", r: "body" },
  ],
  beams: [
    { d: "M2 6L62 30L62 54Z", r: "body" },
    { d: "M62 6L2 30L2 54Z", r: "body" },
    { d: circle(4, 7, 4) + circle(60, 7, 4), r: "dot" },
  ],
  stage: [
    { d: "M16 4L2 60H30Z", r: "body" },
    { d: "M48 4L34 60H62Z", r: "body" },
    { d: circle(16, 5, 4) + circle(48, 5, 4), r: "dot" },
  ],
  neon: [
    { d: "M4 60L22 6L34 12Z", r: "body" },
    { d: "M60 60L42 6L30 12Z", r: "body" },
    { d: circle(5, 60, 4) + circle(59, 60, 4), r: "dot" },
  ],
  glow: [
    { d: circle(32, 32, 22), r: "body" },
    { d: circle(32, 32, 10), r: "line" },
    { d: "M32 2V10M32 54V62M2 32H10M54 32H62M11 11L17 17M47 47L53 53M53 11L47 17M17 47L11 53", r: "stroke" },
  ],
  grain: Array.from({ length: 16 }, (_, i) => ({
    d: circle(12 + (i % 4) * 13, 12 + Math.floor(i / 4) * 13, 2.2),
    r: "dot" as Role,
  })),
  none: [
    { d: circle(32, 32, 26), r: "stroke" },
    { d: "M14 14L50 50", r: "stroke" },
  ],
};

export default function DesignerArtwork({
  name,
  className = "size-12 overflow-visible",
  variant = "line",
  style,
}: {
  name: string;
  className?: string;
  variant?: "line" | "solid";
  style?: CSSProperties;
}) {
  const parts = ICONS[name === "petals" ? "flower" : name] ?? ICONS.sparkle;
  const solid = variant === "solid";
  const flower = name === "flower" || name === "petals";

  return (
    <svg
      className={className}
      viewBox="0 0 64 64"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      style={style}
    >
      {flower
        ? [0, 72, 144, 216, 288].map((a) => (
            <path
              key={a}
              d={PETAL}
              transform={`rotate(${a} 32 32)`}
              {...(solid
                ? { fill: "currentColor", stroke: "currentColor", strokeWidth: 2.5 }
                : { fill: "currentColor", fillOpacity: 0.2, stroke: "currentColor", strokeWidth: 2.5 })}
            />
          ))
        : null}
      {parts.map((p, i) => {
        if (flower && p.d === PETAL) return null;
        switch (p.r) {
          case "body":
            return solid ? (
              <path key={i} d={p.d} fill="currentColor" stroke="currentColor" strokeWidth={2.8} />
            ) : (
              <path key={i} d={p.d} fill="currentColor" fillOpacity={0.22} stroke="currentColor" strokeWidth={2.5} />
            );
          case "line":
            return solid ? (
              <path key={i} d={p.d} stroke="#000" strokeOpacity={0.3} strokeWidth={2.5} />
            ) : (
              <path key={i} d={p.d} stroke="currentColor" strokeWidth={2.5} />
            );
          case "stroke":
            return <path key={i} d={p.d} stroke="currentColor" strokeWidth={solid ? 3.5 : 2.5} />;
          case "shine":
            return solid ? <path key={i} d={p.d} fill="#fff" fillOpacity={0.65} /> : null;
          case "shade":
            return solid ? <path key={i} d={p.d} fill="#000" fillOpacity={0.25} /> : null;
          case "eye":
            return solid ? (
              <path key={i} d={p.d} fill="#1a1a2e" fillOpacity={0.9} />
            ) : (
              <path key={i} d={p.d} fill="currentColor" />
            );
          default:
            return <path key={i} d={p.d} fill="currentColor" />;
        }
      })}
      {flower && (
        <path
          d={circle(32, 32, 8)}
          fill={solid ? "#fff" : "currentColor"}
          fillOpacity={solid ? 0.75 : 0.4}
          stroke={solid ? "none" : "currentColor"}
          strokeWidth={2.5}
        />
      )}
    </svg>
  );
}