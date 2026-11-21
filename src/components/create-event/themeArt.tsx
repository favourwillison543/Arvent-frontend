/* Theme art: backgrounds drawn in code, no image files.
   Layer order: base color, art, effect, content.
   To use one, add an entry with the same id to `themes` in themes.ts.

   The look: muted, mature colour; soft light instead of flat shapes; grain and
   a quiet vignette come from ThemeShell. Light themes stay warm and low-glare
   (oat, clay, sage), dark themes stay deep rather than black. */

   import type { ReactNode } from "react";

   import { rng } from "./themeLayers";
   
   type ArtKind = "aura" | "botanical" | "terrazzo" | "arches" | "waves" | "milkyway" | "tropic";
   type Palette = [string, string, string, string];
   
   export type ArtSpec = {
     mode: "light" | "dark";
     kind: ArtKind;
     base: string;
     colors: Palette;
   };
   
   export const ART: Record<string, ArtSpec> = {
     /* soft colour fields */
     "art-poolside": { mode: "light", kind: "aura", base: "#e1eae4", colors: ["#7fb4ad", "#e8b98a", "#efc9bd", "#2f5c66"] },
     "art-mulberry": { mode: "dark", kind: "aura", base: "#1c0b24", colors: ["#6a2a78", "#b8456f", "#2a1038", "#e8a8c0"] },
     "art-dusk": { mode: "dark", kind: "aura", base: "#131a2e", colors: ["#3a4a8a", "#c8706a", "#1d2a4a", "#f0b890"] },
     "art-oat": { mode: "light", kind: "aura", base: "#e8e0cf", colors: ["#d9b88a", "#a8b5a0", "#e6cfc0", "#7a6a54"] },
     /* watercolour botanicals */
     "art-sage": { mode: "light", kind: "botanical", base: "#ebe7d9", colors: ["#8aa38b", "#c9a574", "#d9d2b8", "#55705a"] },
     "art-blush": { mode: "light", kind: "botanical", base: "#eddfd8", colors: ["#a9b49a", "#d99aa4", "#f1d3cb", "#6f7f66"] },
     /* terrazzo, arches, sea */
     "art-terrazzo": { mode: "light", kind: "terrazzo", base: "#ece3d3", colors: ["#c4694d", "#3f8c82", "#d9b45c", "#2f4650"] },
     "art-sundown": { mode: "dark", kind: "arches", base: "#241230", colors: ["#e07a5f", "#f2b47e", "#b8527a", "#6a3a86"] },
     "art-clay": { mode: "light", kind: "arches", base: "#e9d8c6", colors: ["#c9805f", "#e5b48a", "#d9a0a0", "#8a5a4a"] },
     "art-deepsea": { mode: "dark", kind: "waves", base: "#0b2036", colors: ["#1d6f8f", "#2a9d9a", "#4a8fc0", "#b7ece6"] },
     /* night sky + tropical leaves */
     "art-milkyway": { mode: "dark", kind: "milkyway", base: "#070b1a", colors: ["#5a78c8", "#9a7ad0", "#c8d8ff", "#f1d995"] },
     "art-tropic": { mode: "dark", kind: "tropic", base: "#0c2a22", colors: ["#1f6a4c", "#2f8a62", "#d9a45c", "#0a1a14"] },
     "art-palm-shade": { mode: "light", kind: "tropic", base: "#e4e6d2", colors: ["#6f9a72", "#9ab88a", "#d9a45c", "#3f6a4c"] },
   };
   
   /* ---------- helpers ---------- */
   
   const hex = (c: string) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));
   const mix = (a: string, b: string, t: number) => {
     const A = hex(a);
     const B = hex(b);
     return "#" + A.map((v, i) => Math.round(v + (B[i] - v) * t).toString(16).padStart(2, "0")).join("");
   };
   const f = (n: number) => n.toFixed(1);
   
   /** A smooth organic blob inside a 0-100 box. */
   function blobPath(seed: number, points = 8, min = 0.7, max = 1) {
     const r = rng(seed);
     const pts = Array.from({ length: points }, (_, i) => {
       const angle = (i / points) * Math.PI * 2;
       const radius = 50 * (min + (max - min) * r());
       return [50 + Math.cos(angle) * radius, 50 + Math.sin(angle) * radius];
     });
     const at = (i: number) => pts[(i + points) % points];
     let d = `M${f(at(0)[0])},${f(at(0)[1])}`;
     for (let i = 0; i < points; i++) {
       const p0 = at(i - 1);
       const p1 = at(i);
       const p2 = at(i + 1);
       const p3 = at(i + 2);
       const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
       const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
       d += `C${f(c1[0])},${f(c1[1])} ${f(c2[0])},${f(c2[1])} ${f(p2[0])},${f(p2[1])}`;
     }
     return `${d}Z`;
   }
   
   const full = "absolute inset-0 size-full";
   
   /* ---------- aura: soft colour fields + fine contour lines ---------- */
   
   function Aura({ c, mode }: { c: Palette; mode: "light" | "dark" }) {
     const dark = mode === "dark";
     return (
       <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" className={full} aria-hidden="true">
         <defs>
           <filter id="ta-aura" x="-50%" y="-50%" width="200%" height="200%">
             <feGaussianBlur stdDeviation="9" />
           </filter>
         </defs>
         <g filter="url(#ta-aura)">
           <ellipse cx="14" cy="10" rx="46" ry="30" fill={c[0]} fillOpacity={dark ? 0.55 : 0.5} />
           <ellipse cx="92" cy="24" rx="30" ry="26" fill={c[1]} fillOpacity={dark ? 0.42 : 0.45} />
           <ellipse cx="66" cy="100" rx="64" ry="34" fill={c[2]} fillOpacity={dark ? 0.7 : 0.55} />
           <ellipse cx="20" cy="82" rx="30" ry="22" fill={c[1]} fillOpacity={dark ? 0.2 : 0.28} />
         </g>
         <g fill="none" stroke={c[3]} strokeOpacity={dark ? 0.16 : 0.2} strokeWidth=".18">
           {[18, 26, 34, 42].map((r) => (
             <circle key={`a${r}`} cx="100" cy="0" r={r} />
           ))}
           {[14, 22, 30].map((r) => (
             <circle key={`b${r}`} cx="0" cy="100" r={r} />
           ))}
         </g>
       </svg>
     );
   }
   
   /* ---------- botanical: watercolour eucalyptus in the corners ---------- */
   
   function Branch({ c, seed, u }: { c: Palette; seed: number; u: string }) {
     const r = rng(seed);
     const P0 = [10, 152];
     const P1 = [14, 70];
     const P2 = [104, 14];
     const B = (t: number) => [
       (1 - t) ** 2 * P0[0] + 2 * (1 - t) * t * P1[0] + t * t * P2[0],
       (1 - t) ** 2 * P0[1] + 2 * (1 - t) * t * P1[1] + t * t * P2[1],
     ];
     const T = (t: number) => {
       const dx = 2 * (1 - t) * (P1[0] - P0[0]) + 2 * t * (P2[0] - P1[0]);
       const dy = 2 * (1 - t) * (P1[1] - P0[1]) + 2 * t * (P2[1] - P1[1]);
       return (Math.atan2(dy, dx) * 180) / Math.PI;
     };
     const N = 11;
     const leaves = Array.from({ length: N }, (_, i) => {
       const t = 0.1 + (i * 0.84) / N;
       const side = i % 2 ? 1 : -1;
       const ang = T(t) + side * (58 + r() * 18);
       const size = 7.4 + (1 - t) * 4.4 + r() * 2;
       const [x, y] = B(t);
       return { x, y, ang, size, fill: `url(#ta-lf${1 + Math.floor(r() * 3)}-${u})` };
     });
     const [gx, gy] = B(0.42);
     const sprig = Array.from({ length: 7 }, (_, i) => {
       const u = i / 6;
       return { x: gx + 8 + u * 26, y: gy + 4 - u * 22 + Math.sin(u * 3) * 3, rot: -50 + (i % 2 ? 30 : -30) };
     });
     return (
       <g>
         <ellipse cx="62" cy="86" rx="58" ry="40" fill={c[2]} fillOpacity=".5" filter={`url(#ta-haze-${u})`} transform="rotate(-38 62 86)" />
         <g filter={`url(#ta-wc-${u})`}>
           <path d={`M${P0[0]},${P0[1]} Q${P1[0]},${P1[1]} ${P2[0]},${P2[1]}`} fill="none" stroke={mix(c[3], "#6a5a38", 0.5)} strokeWidth="1.1" strokeLinecap="round" />
           {leaves.map((l, i) => (
             <g key={i} transform={`translate(${f(l.x)} ${f(l.y)}) rotate(${f(l.ang)})`}>
               <ellipse cx={f(l.size * 0.95)} cy="0" rx={f(l.size)} ry={f(l.size * 0.8)} fill={l.fill} fillOpacity=".9" />
               <path d={`M0,0 L${f(l.size * 1.8)},0`} stroke="#fff" strokeOpacity=".32" strokeWidth=".4" />
             </g>
           ))}
           <path d={`M${f(gx)},${f(gy)} Q${f(gx + 14)},${f(gy - 2)} ${f(gx + 34)},${f(gy - 20)}`} fill="none" stroke={c[1]} strokeWidth=".6" strokeLinecap="round" />
           {sprig.map((s, i) => (
             <ellipse key={i} cx={f(s.x)} cy={f(s.y)} rx="2.7" ry="1.2" fill={c[1]} fillOpacity=".9" transform={`rotate(${s.rot} ${f(s.x)} ${f(s.y)})`} />
           ))}
         </g>
       </g>
     );
   }
   
   function Botanical({ c }: { c: Palette }) {
     const u = c[0].slice(1) + c[1].slice(1);
     const corners = [
       { k: "tl", sx: 1, sy: -1, w: [10, 26, 24], seed: 3 },
       { k: "tr", sx: -1, sy: -1, w: [8, 20, 18], seed: 8 },
       { k: "bl", sx: 1, sy: 1, w: [9, 22, 20], seed: 14 },
       { k: "br", sx: -1, sy: 1, w: [11, 28, 26], seed: 21 },
     ] as const;
     return (
       <>
         {corners.map((o) => (
           <svg
             key={o.k}
             viewBox="0 0 120 160"
             aria-hidden="true"
             data-corner={o.k}
             data-w={o.w.join(",")}
             data-sx={o.sx}
             data-sy={o.sy}
             data-bleed="16"
             className="absolute"
             style={{
               [o.k[0] === "t" ? "top" : "bottom"]: "-1rem",
               [o.k[1] === "l" ? "left" : "right"]: "-1rem",
               width: `clamp(${o.w[0]}rem, ${o.w[1]}vw, ${o.w[2]}rem)`,
               height: "auto",
               transform: `scale(${o.sx}, ${o.sy})`,
             }}
           >
             <defs>
               <radialGradient id={`ta-lf1-${u}`} cx=".4" cy=".35" r=".8">
                 <stop offset="0" stopColor={mix(c[0], "#ffffff", 0.35)} />
                 <stop offset="1" stopColor={c[0]} />
               </radialGradient>
               <radialGradient id={`ta-lf2-${u}`} cx=".4" cy=".35" r=".8">
                 <stop offset="0" stopColor={c[0]} />
                 <stop offset="1" stopColor={mix(c[0], c[3], 0.6)} />
               </radialGradient>
               <radialGradient id={`ta-lf3-${u}`} cx=".4" cy=".35" r=".8">
                 <stop offset="0" stopColor={mix(c[0], c[3], 0.3)} />
                 <stop offset="1" stopColor={c[3]} />
               </radialGradient>
               <filter id={`ta-haze-${u}`} x="-50%" y="-50%" width="200%" height="200%">
                 <feGaussianBlur stdDeviation="9" />
               </filter>
               <filter id={`ta-wc-${u}`} x="-10%" y="-10%" width="120%" height="120%">
                 <feTurbulence type="fractalNoise" baseFrequency=".035" numOctaves="2" seed="4" result="n" />
                 <feDisplacementMap in="SourceGraphic" in2="n" scale="2.4" xChannelSelector="R" yChannelSelector="G" result="d" />
                 <feGaussianBlur in="d" stdDeviation=".25" />
               </filter>
             </defs>
             <Branch c={c} seed={o.seed} u={u} />
           </svg>
         ))}
       </>
     );
   }
   
   /* ---------- terrazzo: chips with depth + fine speckle ---------- */
   
   function Terrazzo({ c }: { c: Palette }) {
     const r = rng(42);
     const chips = Array.from({ length: 46 }, (_, i) => ({
       x: r() * 100,
       y: r() * 100,
       size: 1.1 + r() * 3.4,
       rot: r() * 360,
       seed: i + 1,
       fill: mix(c[i % 3], r() > 0.5 ? "#ffffff" : "#000000", 0.08 + r() * 0.14),
     }));
     const specks = Array.from({ length: 220 }, () => ({ x: r() * 100, y: r() * 100, s: 0.12 + r() * 0.26 }));
     return (
       <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" className={full} aria-hidden="true">
         <g fill={c[3]} fillOpacity=".35">
           {specks.map((s, i) => (
             <circle key={i} cx={f(s.x)} cy={f(s.y)} r={f(s.s)} />
           ))}
         </g>
         {chips.map((chip) => {
           const s = chip.size;
           const t = `translate(${f(chip.x)} ${f(chip.y)}) rotate(${chip.rot.toFixed(0)}) scale(${(s / 100).toFixed(4)}) translate(-50 -50)`;
           const d = blobPath(chip.seed, 6, 0.55, 1);
           return (
             <g key={chip.seed}>
               <path d={d} fill="#000" fillOpacity=".1" transform={`${t} translate(5 7)`} />
               <path d={d} fill={chip.fill} transform={t} />
             </g>
           );
         })}
       </svg>
     );
   }
   
   /* ---------- arches: stepped arches at a glowing horizon ---------- */
   
   function Arches({ c, mode }: { c: Palette; mode: "light" | "dark" }) {
     const dark = mode === "dark";
     const rings: [number, string][] = [
       [52, c[3]],
       [42, c[2]],
       [32, c[0]],
       [22, c[1]],
     ];
     return (
       <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMax slice" className={full} aria-hidden="true">
         <defs>
           <radialGradient id="ta-hz" cx="50%" cy="100%" r="70%">
             <stop offset="0" stopColor={c[1]} stopOpacity={dark ? 0.55 : 0.5} />
             <stop offset="1" stopColor={c[1]} stopOpacity="0" />
           </radialGradient>
           {rings.map(([rad, fill]) => (
             <linearGradient key={rad} id={`ta-ar${rad}`} x1="0" y1="0" x2="0" y2="1">
               <stop offset="0" stopColor={mix(fill, "#ffffff", dark ? 0.1 : 0.16)} />
               <stop offset="1" stopColor={mix(fill, "#000000", dark ? 0.2 : 0.1)} />
             </linearGradient>
           ))}
         </defs>
         <rect width="100" height="100" fill="url(#ta-hz)" />
         {rings.map(([rad]) => (
           <g key={rad}>
             <path d={`M${50 - rad} 100 A${rad} ${rad} 0 0 1 ${50 + rad} 100 Z`} fill={`url(#ta-ar${rad})`} fillOpacity=".96" />
             <path d={`M${50 - rad} 100 A${rad} ${rad} 0 0 1 ${50 + rad} 100`} fill="none" stroke="#fff" strokeOpacity=".16" strokeWidth=".25" />
           </g>
         ))}
         <path d="M0 0 H34 A34 34 0 0 1 0 34Z" fill={c[2]} fillOpacity={dark ? 0.35 : 0.3} />
         <path d="M100 0 H78 A22 22 0 0 0 100 22Z" fill={c[0]} fillOpacity={dark ? 0.28 : 0.26} />
       </svg>
     );
   }
   
   /* ---------- waves: layered sea with lit crests ---------- */
   
   function wave(y: number, amp: number, shift: number) {
     let d = `M-10,${y}`;
     for (let i = 0; i < 6; i++) {
       const x = -10 + i * 40;
       const dir = (i + shift) % 2 ? -1 : 1;
       d += ` C${x + 14},${y + dir * amp} ${x + 26},${y + dir * amp} ${x + 40},${y}`;
     }
     return d;
   }
   
   function Waves({ c }: { c: Palette }) {
     const layers: [number, number, number, string, number][] = [
       [60, 4, 0, c[0], 0.5],
       [70, 4.4, 1, c[1], 0.62],
       [80, 4, 0, c[2], 0.78],
       [90, 3.4, 1, mix(c[0], "#000000", 0.45), 0.96],
     ];
     return (
       <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMax slice" className={full} aria-hidden="true">
         <defs>
           <radialGradient id="ta-sea-glow" cx="50%" cy="58%" r="60%">
             <stop offset="0" stopColor={c[3]} stopOpacity=".22" />
             <stop offset="1" stopColor={c[3]} stopOpacity="0" />
           </radialGradient>
           {layers.map(([, , , fill], i) => (
             <linearGradient key={i} id={`ta-wv${i}`} x1="0" y1="0" x2="0" y2="1">
               <stop offset="0" stopColor={mix(fill, "#ffffff", 0.12)} />
               <stop offset="1" stopColor={mix(fill, "#000000", 0.35)} />
             </linearGradient>
           ))}
         </defs>
         <rect width="100" height="100" fill="url(#ta-sea-glow)" />
         {layers.map(([y, amp, shift, , o], i) => (
           <g key={i}>
             <path d={`${wave(y, amp, shift)} L130,110 L-10,110Z`} fill={`url(#ta-wv${i})`} fillOpacity={o} />
             <path d={wave(y, amp, shift)} fill="none" stroke="#fff" strokeOpacity=".2" strokeWidth=".22" />
           </g>
         ))}
       </svg>
     );
   }
   
   /* ---------- milky way ---------- */
   
   function MilkyWay({ c }: { c: Palette }) {
     const r = rng(77);
     const stars = Array.from({ length: 170 }, () => {
       const t = r();
       return { x: r() * 100, y: r() * 100, s: 0.07 + Math.pow(r(), 3) * 0.32, o: 0.3 + r() * 0.65, w: t > 0.82 ? c[3] : t > 0.6 ? c[2] : "#ffffff" };
     });
     const [nr, ng, nb] = hex(c[2]).map((v) => (v / 255).toFixed(2));
     const bright = Array.from({ length: 9 }, () => ({ x: 6 + r() * 88, y: 6 + r() * 88, s: 0.32 + r() * 0.3 }));
     return (
       <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" className={full} aria-hidden="true">
         <defs>
           <filter id="ta-milk" x="0" y="0" width="100%" height="100%">
             <feTurbulence type="fractalNoise" baseFrequency=".014 .022" numOctaves="4" seed="7" />
             <feColorMatrix type="matrix" values={`0 0 0 0 ${nr}  0 0 0 0 ${ng}  0 0 0 0 ${nb}  1.9 0 0 0 -.62`} />
           </filter>
           <filter id="ta-band" x="-50%" y="-50%" width="200%" height="200%">
             <feGaussianBlur stdDeviation="8" />
           </filter>
           <filter id="ta-glow" x="-200%" y="-200%" width="500%" height="500%">
             <feGaussianBlur stdDeviation=".7" />
           </filter>
           <mask id="ta-bandmask">
             <ellipse cx="50" cy="52" rx="80" ry="14" fill="#fff" transform="rotate(-28 50 52)" filter="url(#ta-band)" />
           </mask>
           <linearGradient id="ta-sky" x1="0" y1="0" x2="1" y2="1">
             <stop offset="0" stopColor={mix(c[0], "#000000", 0.78)} />
             <stop offset="1" stopColor="#04060f" />
           </linearGradient>
         </defs>
         <rect width="100" height="100" fill="url(#ta-sky)" />
         <rect width="100" height="100" fill={c[0]} fillOpacity=".55" filter="url(#ta-milk)" mask="url(#ta-bandmask)" />
         <ellipse cx="50" cy="52" rx="46" ry="6" fill={c[1]} fillOpacity=".3" transform="rotate(-28 50 52)" filter="url(#ta-band)" />
         <g>
           {stars.map((s, i) => (
             <circle key={i} cx={f(s.x)} cy={f(s.y)} r={s.s.toFixed(2)} fill={s.w} fillOpacity={s.o.toFixed(2)} />
           ))}
         </g>
         <g filter="url(#ta-glow)">
           {bright.map((s, i) => (
             <circle key={i} cx={f(s.x)} cy={f(s.y)} r={s.s.toFixed(2)} fill="#fff" />
           ))}
         </g>
       </svg>
     );
   }
   
   /* ---------- tropic: big leaves, lit (dark) or cast as shadows (light) ---------- */
   
   function Leaf({ len, wid, rot, c, shade, u }: { len: number; wid: number; rot: number; c: Palette; shade?: boolean; u: string }) {
     const d = `M0,0 C${f(len * 0.25)},${f(-wid)} ${f(len * 0.7)},${f(-wid * 1.1)} ${f(len)},0 C${f(len * 0.7)},${f(wid * 0.9)} ${f(len * 0.25)},${f(wid)} 0,0Z`;
     const slits = Array.from({ length: 9 }, (_, i) => {
       const x = len * (0.14 + i * 0.09);
       const w = wid * (0.95 - Math.abs(i - 4) * 0.12);
       return { x, w };
     });
     return (
       <g transform={`rotate(${rot})`}>
         <path d={d} fill={shade ? c[3] : `url(#ta-tl-${u})`} />
         {!shade && <path d={`M0,0 L${f(len)},0`} stroke={mix(c[0], "#ffffff", 0.35)} strokeOpacity=".5" strokeWidth=".7" />}
         <g stroke={shade ? "#000" : c[3]} strokeOpacity={shade ? 0 : 0.55} strokeWidth=".9" strokeLinecap="round">
           {slits.map((s, i) => (
             <g key={i}>
               <path d={`M${f(s.x)},0 L${f(s.x + len * 0.07)},${f(-s.w * 0.86)}`} />
               <path d={`M${f(s.x)},0 L${f(s.x + len * 0.07)},${f(s.w * 0.8)}`} />
             </g>
           ))}
         </g>
       </g>
     );
   }
   
   function Tropic({ c, mode }: { c: Palette; mode: "light" | "dark" }) {
     const dark = mode === "dark";
     const u = c[0].slice(1) + c[1].slice(1);
     const corners = [
       { k: "tl", sx: 1, sy: -1, w: [12, 38, 34], seed: 1 },
       { k: "br", sx: -1, sy: 1, w: [14, 44, 40], seed: 2 },
       { k: "tr", sx: -1, sy: -1, w: [8, 20, 18], seed: 3 },
       { k: "bl", sx: 1, sy: 1, w: [8, 18, 16], seed: 4 },
     ] as const;
     const sets: Record<string, [number, number, number][]> = {
       tl: [[92, 26, -80], [84, 24, -48], [76, 22, -14], [62, 18, 22]],
       br: [[104, 28, -82], [94, 26, -50], [84, 24, -16], [66, 20, 20]],
       tr: [[70, 20, -78], [60, 18, -42]],
       bl: [[64, 18, -74], [54, 16, -36]],
     };
     return (
       <>
         {corners.map((o) => (
           <svg
             key={o.k}
             viewBox="0 0 120 120"
             aria-hidden="true"
             data-corner={o.k}
             data-w={o.w.join(",")}
             data-sx={o.sx}
             data-sy={o.sy}
             data-bleed="8"
             className="absolute"
             style={{
               [o.k[0] === "t" ? "top" : "bottom"]: "-0.5rem",
               [o.k[1] === "l" ? "left" : "right"]: "-0.5rem",
               width: `clamp(${o.w[0]}rem, ${o.w[1]}vw, ${o.w[2]}rem)`,
               height: "auto",
               transform: `scale(${o.sx}, ${o.sy})`,
               opacity: dark ? 0.95 : 0.34,
               filter: dark ? undefined : "blur(1.4px)",
             }}
           >
             <defs>
               <linearGradient id={`ta-tl-${u}`} x1="0" y1="0" x2="1" y2="0">
                 <stop offset="0" stopColor={c[0]} />
                 <stop offset=".6" stopColor={c[1]} />
                 <stop offset="1" stopColor={mix(c[0], c[3], 0.5)} />
               </linearGradient>
             </defs>
             <g transform="translate(6 114)">
               {sets[o.k].map(([len, wid, rot], i) => (
                 <Leaf key={i} len={len} wid={wid} rot={rot} c={c} shade={!dark} u={u} />
               ))}
             </g>
           </svg>
         ))}
       </>
     );
   }
   
   /* ---------- backdrop ---------- */
   
   export function ArtBackdrop({ spec }: { spec: ArtSpec }): ReactNode {
     return (
       <div
         aria-hidden="true"
         className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
         style={{ background: spec.base }}
       >
         {spec.kind === "aura" && <Aura c={spec.colors} mode={spec.mode} />}
         {spec.kind === "botanical" && <Botanical c={spec.colors} />}
         {spec.kind === "terrazzo" && <Terrazzo c={spec.colors} />}
         {spec.kind === "arches" && <Arches c={spec.colors} mode={spec.mode} />}
         {spec.kind === "waves" && <Waves c={spec.colors} />}
         {spec.kind === "milkyway" && <MilkyWay c={spec.colors} />}
         {spec.kind === "tropic" && <Tropic c={spec.colors} mode={spec.mode} />}
       </div>
     );
   }