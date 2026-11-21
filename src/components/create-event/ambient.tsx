/* The quiet glow behind every theme. */

import type { CSSProperties } from "react";

import { fixedLayer } from "./themeLayers";

/* ------------------------------------------------------------------ */
/* Ambient: a slow glow that gives every theme a pulse of life.        */
/* Deliberately quiet so it never competes with the chosen effect.     */
/* ------------------------------------------------------------------ */

export type AmbientKind =
  | "smoke"
  | "mist"
  | "fire"
  | "aurora"
  | "sea"
  | "violet"
  | "forest"
  | "warm"
  | "cool"
  | "prism";

const AMB: Record<AmbientKind, [string, string, string]> = {
  smoke: ["rgba(255,255,255,.17)", "rgba(190,200,220,.15)", "rgba(255,255,255,.12)"],
  mist: ["rgba(120,110,100,.17)", "rgba(255,255,255,.60)", "rgba(150,140,130,.14)"],
  fire: ["rgba(255,120,40,.48)", "rgba(225,55,35,.41)", "rgba(255,185,70,.51)"],
  aurora: ["rgba(70,230,170,.41)", "rgba(150,95,255,.44)", "rgba(60,170,255,.34)"],
  sea: ["rgba(40,160,255,.41)", "rgba(30,210,190,.34)", "rgba(100,120,255,.34)"],
  violet: ["rgba(210,80,230,.44)", "rgba(115,85,255,.41)", "rgba(255,105,175,.31)"],
  forest: ["rgba(60,200,130,.37)", "rgba(130,225,120,.27)", "rgba(40,150,110,.34)"],
  warm: ["rgba(255,170,120,.54)", "rgba(255,205,135,.48)", "rgba(255,150,190,.44)"],
  cool: ["rgba(130,170,255,.51)", "rgba(190,150,255,.44)", "rgba(130,225,210,.44)"],
  prism: ["rgba(255,150,220,.54)", "rgba(130,200,255,.51)", "rgba(190,255,200,.48)"],
};

export const AMBIENT_BY_THEME: Record<string, AmbientKind> = {
  "moment-save-date": "warm",
  "moment-announcement": "warm",
  "moment-milestone": "warm",
  "moment-thank-you": "mist",
  "template-chika": "prism",
  "template-owambe": "fire",
  "template-brunch": "cool",
  "template-era": "cool",
  "template-sundown": "warm",
  midnight: "smoke",
  noir: "smoke",
  aurora: "aurora",
  ember: "fire",
  forest: "forest",
  paper: "mist",
  blush: "warm",
  mist: "cool",
  ocean: "sea",
  plum: "violet",
  ruby: "fire",
  checker: "smoke",
  sunrise: "warm",
  sky: "cool",
  mint: "cool",
  grid: "mist",
  linen: "mist",
  marble: "mist",
  rosewater: "warm",
  cobalt: "sea",
  velvet: "violet",
  copper: "fire",
  lagoon: "sea",
  candy: "prism",
  "citrus-grove": "warm",
  "night-sky": "aurora",
  terracotta: "warm",
  orchid: "violet",
  "sea-glass": "cool",
  "ink-wash": "smoke",
  wildflower: "warm",
  holographic: "prism",
  graphite: "smoke",
};

/** Turn the whole ambient glow up or down: 0 = off, 1 = full. */
const AMBIENT_OPACITY = 1;

export function Ambient({ kind }: { kind: AmbientKind }) {
  const [a1, a2, a3] = AMB[kind];
  const motion = kind === "mist" ? "smoke" : kind;
  return (
    <div
      aria-hidden
      className={`${fixedLayer} ev-amb-${motion}`}
      style={{ "--a1": a1, "--a2": a2, "--a3": a3, opacity: AMBIENT_OPACITY } as CSSProperties}
    >
      <span className="ev-amb ev-amb-1" />
      <span className="ev-amb ev-amb-2" />
      <span className="ev-amb ev-amb-3" />
    </div>
  );
}
