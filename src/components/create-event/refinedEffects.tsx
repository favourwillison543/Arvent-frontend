/* Refined ambient effects: soft light, dust, embers, lanterns, glitter, silk
   and aurora. These are drawn as shapes instead of designer icons so they read
   as light and fabric, and they move slowly enough to feel real rather than
   playful. Used for traditional ceremonies, conventions and grown-up parties. */

import type { CSSProperties } from "react";

import DesignerArtwork from "./DesignerArtwork";
import { rng } from "./themeLayers";

type SoftSpec = {
  count: number;
  size: [number, number];
  dur: [number, number];
  palette: string[];
};

export const SOFT: Record<string, SoftSpec> = {
  bokeh: {
    count: 15,
    size: [46, 210],
    dur: [26, 48],
    palette: ["#fff4d6", "#ffe0b8", "#dfe9ff", "#ffd6e8"],
  },
  dust: {
    count: 46,
    size: [2, 7],
    dur: [30, 62],
    palette: ["#f7e3b0", "#ffeec2", "#e8cd8a"],
  },
  embers: {
    count: 26,
    size: [3, 10],
    dur: [14, 28],
    palette: ["#ff9b4a", "#ffcb7a", "#ff7043"],
  },
  lanterns: {
    count: 9,
    size: [16, 34],
    dur: [42, 74],
    palette: ["#ffd9a0", "#ffbd75", "#ffe6c2"],
  },
  glitter: {
    count: 34,
    size: [8, 18],
    dur: [2.6, 5.4],
    palette: ["#fff6d8", "#ffe9a8", "#ffffff", "#ffe0f2"],
  },
  silk: {
    count: 12,
    size: [70, 190],
    dur: [38, 66],
    palette: ["#f4e7d3", "#e8d6ff", "#d6ecff", "#ffe2ec"],
  },
};

const AURORA_BANDS = [
  { top: "4%", tint: "rgba(118,224,198,.30)", width: "72%", dur: 34, delay: 0 },
  { top: "32%", tint: "rgba(146,138,255,.26)", width: "82%", dur: 43, delay: -9 },
  { top: "60%", tint: "rgba(255,172,212,.20)", width: "64%", dur: 38, delay: -17 },
];

/** Slow ribbons of coloured light, like light bouncing off a ceiling. */
export function Aurora({ layer }: { layer: string }) {
  return (
    <div aria-hidden className={layer}>
      {AURORA_BANDS.map((band, i) => (
        <span
          key={i}
          className="evx-aurora"
          style={
            {
              top: band.top,
              width: band.width,
              backgroundImage: `linear-gradient(90deg, transparent, ${band.tint} 28%, ${band.tint} 72%, transparent)`,
              animationDuration: `${band.dur}s`,
              animationDelay: `${band.delay}s`,
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}

/**
 * Particle-style refined effects. One span per grain of light or thread of
 * silk; the animation lives in CSS (`theme.css`) so the browser can keep it on
 * the compositor.
 */
export function RefinedEffect({ id, layer }: { id: string; layer: string }) {
  const spec = SOFT[id];
  const r = rng(id.length * 733 + id.charCodeAt(0));
  // Draw every random number up front so the server and client trees match.
  const seeds = Array.from({ length: spec.count }, () => ({
    depth: r(),
    x: r(),
    y: r(),
    len: r(),
    sway: r(),
    tint: r(),
  }));

  return (
    <div aria-hidden className={layer}>
      {seeds.map((s, i) => {
        const dur = spec.dur[0] + s.len * (spec.dur[1] - spec.dur[0]);
        const size = Math.round(
          spec.size[0] + s.depth * (spec.size[1] - spec.size[0]),
        );
        const color = spec.palette[i % spec.palette.length];
        const timing = {
          left: `${(s.x * 100).toFixed(1)}%`,
          top: `${(s.y * 100).toFixed(1)}%`,
          animationDuration: `${dur.toFixed(1)}s`,
          animationDelay: `${(-s.len * dur).toFixed(1)}s`,
          animationIterationCount: "infinite",
          "--sway": `${Math.round(12 + s.sway * 34)}px`,
        } as CSSProperties;

        if (id === "bokeh") {
          return (
            <span
              key={i}
              className="evx evx-bokeh"
              style={
                {
                  ...timing,
                  width: size,
                  height: size,
                  borderRadius: "50%",
                  backgroundImage: `radial-gradient(circle at 34% 30%, ${color}, transparent 70%)`,
                  opacity: Number((0.12 + s.tint * 0.24).toFixed(2)),
                  filter: `blur(${Math.round(4 + s.depth * 14)}px)`,
                } as CSSProperties
              }
            />
          );
        }

        if (id === "dust") {
          return (
            <span
              key={i}
              className="evx evx-dust"
              style={
                {
                  ...timing,
                  width: size,
                  height: size,
                  borderRadius: "50%",
                  backgroundColor: color,
                  boxShadow: `0 0 ${Math.round(size * 2.4)}px ${color}`,
                } as CSSProperties
              }
            />
          );
        }

        if (id === "embers") {
          return (
            <span
              key={i}
              className="evx evx-ember"
              style={
                {
                  ...timing,
                  width: size,
                  height: size,
                  borderRadius: "50%",
                  backgroundImage: `radial-gradient(circle, #ffe7bd, ${color} 58%, transparent 72%)`,
                  boxShadow: `0 0 ${Math.round(size * 3)}px rgba(255, 138, 58, .5)`,
                } as CSSProperties
              }
            />
          );
        }

        if (id === "lanterns") {
          return (
            <span
              key={i}
              className="evx evx-lantern"
              style={
                {
                  ...timing,
                  width: size,
                  height: Math.round(size * 1.35),
                  borderRadius: `${Math.round(size * 0.32)}px`,
                  backgroundImage:
                    "linear-gradient(180deg, rgba(255,241,208,.95), rgba(255,178,110,.72))",
                  boxShadow: `0 0 ${Math.round(size * 1.1)}px rgba(255, 196, 120, .6)`,
                } as CSSProperties
              }
            />
          );
        }

        if (id === "glitter") {
          return (
            <span
              key={i}
              className="evx evx-glitter"
              style={
                { ...timing, width: size, height: size, color } as CSSProperties
              }
            >
              <DesignerArtwork name="star" variant="solid" className="size-full" />
            </span>
          );
        }

        // silk: a slow fall of thin, translucent fabric strips
        return (
          <span
            key={i}
            className="evx evx-silk"
            style={
              {
                ...timing,
                width: Math.round(2 + s.depth * 4),
                height: size,
                borderRadius: 999,
                backgroundImage: `linear-gradient(180deg, transparent, ${color}, transparent)`,
              } as CSSProperties
            }
          />
        );
      })}
    </div>
  );
}
