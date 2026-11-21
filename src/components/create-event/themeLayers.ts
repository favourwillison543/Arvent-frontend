/* Shared primitives for the theme layers: noise, confetti palette, layer
   classes and the seeded RNG that keeps generated shapes stable between
   the server and the client. */

export const NOISE = `url("data:image/svg+xml,${encodeURIComponent(
  "<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(#n)'/></svg>",
)}")`;

export const CONFETTI = ["#e8c878", "#f0a58d", "#c9b2e6", "#b7dc6a", "#9fd3f0"];

export const fixedLayer = "pointer-events-none fixed inset-0 z-0 overflow-hidden";
export const boxLayer = "pointer-events-none absolute inset-0 z-0 overflow-hidden";

/** Small seeded random: same seed, same shape, on server and client. */
/** Small seeded random: same seed, same shape, on server and client. */
export function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}
