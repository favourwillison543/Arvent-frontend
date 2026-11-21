/* The poster catalogue: every design, keyed by the ids declared in posters.ts.

   How the scenes are built (so new ones match):
   - Every illustrated scene is an <XArt/> drawn in a 100 x 125 box. The square
     poster shows y 12.5 to 112.5, so the subject sits in the top two thirds
     and the bottom stays calm for the title and details.
   - <Scene> adds the shared filters and a vignette. Inside a scene, the
     look comes from the same few moves: a gradient backdrop, blurred "bokeh"
     lights for depth, a surface line with a soft shadow and a faint
     reflection, and subjects shaded with gradients (never flat fills).
   - Each poster keeps to one hero object and a tight palette.
   - The hexes in this file are paint, not tokens. A poster's colours are the
     drawing itself — they describe light, cloth and shadow in a scene — so they
     are deliberately outside `globals.css`: the interface reads `--poster-ink`,
     a poster mixes its own. `posterKit.tsx` and `DesignerArtwork.tsx` are the
     same kind of file. */

   import type { CSSProperties, ReactNode } from "react";

   import { Art, Details, InvitedTag, Sparkle, Sprig, Stack, Title, cq, fill, type Ctx } from "./posterKit";
   
   /* ---------- colour + gradient helpers ---------- */
   
   const hex = (c: string) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));
   const mix = (a: string, b: string, t: number) => {
     const A = hex(a);
     const B = hex(b);
     return "#" + A.map((v, i) => Math.round(v + (B[i] - v) * t).toString(16).padStart(2, "0")).join("");
   };
   const rnd = (n: number) => {
     const s = Math.sin(n * 127.1 + 311.7) * 43758.5453;
     return s - Math.floor(s);
   };
   
   type Stop = [number, string, number?];
   
   const LG = ({
     id,
     s,
     x1 = 0,
     y1 = 0,
     x2 = 0,
     y2 = 1,
     u,
   }: {
     id: string;
     s: Stop[];
     x1?: number;
     y1?: number;
     x2?: number;
     y2?: number;
     u?: "userSpaceOnUse";
   }) => (
     <linearGradient id={id} x1={x1} y1={y1} x2={x2} y2={y2} gradientUnits={u}>
       {s.map(([o, c, a], i) => (
         <stop key={i} offset={o} stopColor={c} stopOpacity={a ?? 1} />
       ))}
     </linearGradient>
   );
   
   const RG = ({
     id,
     s,
     cx = 0.5,
     cy = 0.5,
     r = 0.5,
   }: {
     id: string;
     s: Stop[];
     cx?: number;
     cy?: number;
     r?: number;
   }) => (
     <radialGradient id={id} cx={cx} cy={cy} r={r}>
       {s.map(([o, c, a], i) => (
         <stop key={i} offset={o} stopColor={c} stopOpacity={a ?? 1} />
       ))}
     </radialGradient>
   );
   
   /* ---------- shared effects ---------- */
   
   /** Subtle paper/print grain laid over the artwork. Place after <Art>. */
   function Grain({ o = 0.14 }: { o?: number }) {
     return (
       <svg
         aria-hidden="true"
         style={{ ...fill, width: "100%", height: "100%", pointerEvents: "none", mixBlendMode: "overlay", opacity: o }}
       >
         <filter id="evp-grain">
           <feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" stitchTiles="stitch" />
           <feColorMatrix type="saturate" values="0" />
         </filter>
         <rect width="100%" height="100%" filter="url(#evp-grain)" />
       </svg>
     );
   }
   
   const blur = (id: string, sd: number) => (
     <filter id={id} x="-60%" y="-60%" width="220%" height="220%">
       <feGaussianBlur stdDeviation={sd} />
     </filter>
   );
   
   /** Shared blur filters and the vignette gradient. */
   function Fx() {
     return (
       <defs>
         {blur("evp-b05", 0.5)}
         {blur("evp-b1", 1)}
         {blur("evp-b2", 2)}
         {blur("evp-b4", 4)}
         {blur("evp-b8", 8)}
         <radialGradient id="evp-vig" cx="0.5" cy="0.45" r="0.78">
           <stop offset="0.5" stopColor="#000" stopOpacity="0" />
           <stop offset="1" stopColor="#000" stopOpacity="0.7" />
         </radialGradient>
       </defs>
     );
   }
   
   /** Every illustrated scene lives inside this: filters in, vignette on top. */
   const Scene = ({ children, vig = 0.9 }: { children: ReactNode; vig?: number }) => (
     <>
       <Fx />
       {children}
       <rect width="100" height="125" fill="url(#evp-vig)" opacity={vig} />
     </>
   );
   
   /** Out-of-focus lights: [x, y, r, colour, opacity] */
   const Bokeh = ({ dots }: { dots: [number, number, number, string, number][] }) => (
     <g filter="url(#evp-b2)">
       {dots.map(([x, y, r, c, o], i) => (
         <circle key={i} cx={x} cy={y} r={r} fill={c} fillOpacity={o} />
       ))}
     </g>
   );
   
   const Glow = ({ x, y, r, c, o = 0.3, b = 8 }: { x: number; y: number; r: number; c: string; o?: number; b?: 2 | 4 | 8 }) => (
     <circle cx={x} cy={y} r={r} fill={c} fillOpacity={o} filter={`url(#evp-b${b})`} />
   );
   
   const Shadow = ({ x, y, rx, ry, o = 0.5 }: { x: number; y: number; rx: number; ry: number; o?: number }) => (
     <ellipse cx={x} cy={y} rx={rx} ry={ry} fill="#000" fillOpacity={o} filter="url(#evp-b2)" />
   );
   
   /** Glossy balloon with a lit side and a shaded side. */
   const Gloss = ({ x, y, c, s = 1 }: { x: number; y: number; c: string; s?: number }) => {
     const id = `evp-gb-${c.slice(1)}`;
     return (
       <g transform={`translate(${x} ${y}) scale(${s})`}>
         <defs>
           <radialGradient id={id} cx=".35" cy=".3" r=".8">
             <stop offset="0" stopColor={mix(c, "#ffffff", 0.6)} />
             <stop offset=".45" stopColor={c} />
             <stop offset="1" stopColor={mix(c, "#000000", 0.38)} />
           </radialGradient>
         </defs>
         <path d="M0,-9 C6,-9 8,-3 8,1 C8,7 3,11 0,12 C-3,11 -8,7 -8,1 C-8,-3 -6,-9 0,-9Z" fill={`url(#${id})`} />
         <path d="M0,12 l-1.7,2.5 h3.4z" fill={mix(c, "#000000", 0.25)} />
         <path d="M0,14.5 C-2,20 2,24 0,32" fill="none" stroke="#ffffff" strokeOpacity=".55" strokeWidth=".3" />
         <ellipse cx="-3.2" cy="-3.4" rx="1.3" ry="2.8" fill="#fff" fillOpacity=".6" transform="rotate(22 -3.2 -3.4)" />
         <circle cx="-4.6" cy="2.2" r=".6" fill="#fff" fillOpacity=".45" />
       </g>
     );
   };
   
   const diamond = "M0,-2.4 L2.4,0 L0,2.4 L-2.4,0Z";
   
   /** Art on top, tilted title + details at the bottom. */
   export function TiltedTitle(c: Ctx, art: ReactNode, textColor?: string) {
     const { ink, rotation = 0 } = c.poster;
     return (
       <>
         <Art>{art}</Art>
         <Grain o={0.12} />
         <Stack justify="flex-end" align="flex-start" padY={8} gap={2}>
           <InvitedTag accent={textColor ?? ink} small={c.small} />
           <div style={{ transform: `rotate(${rotation}deg)`, maxWidth: "100%" }}>
             <Title c={c} mult={1.05} style={{ color: textColor ?? ink, textTransform: "uppercase", fontWeight: 900 }} />
           </div>
           <Details c={c} style={{ color: textColor ?? ink }} />
         </Stack>
       </>
     );
   }
   
   /* =====================================================================
      ILLUSTRATED SCENES
      ===================================================================== */
   
   /* ---- Birthday cake: candlelit on a dark table ---- */
   function Drips({
     cx,
     cy,
     rx,
     ry,
     step,
     r,
     color,
     dy,
   }: {
     cx: number;
     cy: number;
     rx: number;
     ry: number;
     step: number;
     r: number;
     color: string;
     dy: number;
   }) {
     const out: ReactNode[] = [];
     for (let x = cx - rx + step * 0.7; x < cx + rx - step * 0.3; x += step) {
       const y = cy + ry * Math.sqrt(Math.max(0, 1 - ((x - cx) / rx) ** 2)) + dy;
       out.push(<circle key={x} cx={x} cy={y} r={r} fill={color} />);
     }
     return <>{out}</>;
   }
   
   const CakeBody = () => (
     <g>
       <ellipse cx="50" cy="66.4" rx="33" ry="4.2" fill="url(#evp-ck-plate)" />
       <path d="M24,52 V66 A26,3.6 0 0 0 76,66 V52Z" fill="url(#evp-ck-pink)" />
       <Drips cx={50} cy={52} rx={26} ry={3.6} step={5.2} r={2.4} color="#fff1f4" dy={1.2} />
       <ellipse cx="50" cy="52" rx="26" ry="3.6" fill="#fff6f8" />
       <path d="M34,38 V52 A16,2.8 0 0 0 66,52 V38Z" fill="url(#evp-ck-cream)" />
       <Drips cx={50} cy={38} rx={16} ry={2.8} step={4} r={1.9} color="#ff9cc6" dy={1} />
       <ellipse cx="50" cy="38" rx="16" ry="2.8" fill="#ffb6d3" />
       <rect x="30.6" y="53" width="2.6" height="12" rx="1.3" fill="#fff" fillOpacity=".22" />
       {[44, 50, 56].map((x) => (
         <g key={x}>
           <rect x={x - 1} y="27" width="2" height="11.4" rx=".5" fill="url(#evp-ck-candle)" />
           <rect x={x - 1} y="30" width="2" height="1.1" fill="#ff7ab8" fillOpacity=".8" />
           <rect x={x - 1} y="34" width="2" height="1.1" fill="#ff7ab8" fillOpacity=".8" />
           <ellipse cx={x} cy="24.4" rx="1.4" ry="2.7" fill="url(#evp-ck-flame)" />
         </g>
       ))}
     </g>
   );
   
   const CakeArt = () => (
     <Scene>
       <defs>
         <LG id="evp-ck-bg" s={[[0, "#2e1324"], [1, "#0c0608"]]} />
         <LG id="evp-ck-table" s={[[0, "#33202b"], [1, "#0d070a"]]} />
         <LG id="evp-ck-plate" s={[[0, "#fffaf0"], [1, "#cfc2b0"]]} />
         <LG id="evp-ck-pink" x2={1} y2={0} s={[[0, "#ffb0d2"], [0.35, "#ff78ae"], [1, "#b83a78"]]} />
         <LG id="evp-ck-cream" x2={1} y2={0} s={[[0, "#fff8ea"], [0.4, "#f3dcbb"], [1, "#bf9c70"]]} />
         <LG id="evp-ck-candle" x2={1} y2={0} s={[[0, "#ffffff"], [1, "#d9c8b6"]]} />
         <RG id="evp-ck-flame" s={[[0, "#fffbe0"], [0.5, "#ffd25a"], [1, "#ff8a2a"]]} />
       </defs>
       <rect width="100" height="125" fill="url(#evp-ck-bg)" />
       <Glow x={50} y={34} r={30} c="#ff9a6a" o={0.2} />
       <Bokeh
         dots={[
           [16, 30, 8, "#ff7ab8", 0.35],
           [84, 26, 10, "#ffb36b", 0.3],
           [72, 52, 5, "#ff7ab8", 0.3],
           [26, 52, 6, "#ffd27a", 0.25],
           [52, 16, 6, "#ff9ac8", 0.22],
           [92, 56, 4, "#ffd27a", 0.3],
         ]}
       />
       <rect y="66" width="100" height="60" fill="url(#evp-ck-table)" />
       <rect y="66" width="100" height=".35" fill="#ffd2e2" fillOpacity=".25" />
       <g transform="translate(0 132.8) scale(1 -1)" opacity=".15" filter="url(#evp-b1)">
         <CakeBody />
       </g>
       <Shadow x={50} y={68.5} rx={36} ry={3.4} />
       <CakeBody />
       {[44, 50, 56].map((x) => (
         <Glow key={x} x={x} y={24.6} r={5} c="#ffd27a" o={0.45} b={2} />
       ))}
     </Scene>
   );
   export const ChikaCard = (c: Ctx) => TiltedTitle(c, <CakeArt />);
   
   /* ---- Talking drum, owambe ---- */
   const DrumBody = () => (
     <g>
       <path d="M36,24 C40,32 44,36 44,42 C44,48 40,52 36,60 L64,60 C60,52 56,48 56,42 C56,36 60,32 64,24Z" fill="url(#evp-dr-body)" />
       <path d="M36,60 A14,3.4 0 0 0 64,60Z" fill="url(#evp-dr-hoop)" />
       <g fill="none" stroke="#f0cf7a" strokeWidth=".5" strokeOpacity=".85" strokeLinecap="round">
         {[-12, -8, -4, 0, 4, 8].map((i) => (
           <g key={i}>
             <path d={`M${50 + i},26 Q50,43 ${50 + i + 4},58`} />
             <path d={`M${50 + i + 4},26 Q50,43 ${50 + i},58`} />
           </g>
         ))}
       </g>
       <path d="M44.4,40 C48,43 52,43 55.6,40 L55.8,44 C52,47 48,47 44.2,44Z" fill="url(#evp-dr-hoop)" />
       <ellipse cx="50" cy="24" rx="14" ry="3.8" fill="url(#evp-dr-head)" stroke="#e8c068" strokeWidth=".8" />
       <ellipse cx="50" cy="24" rx="10" ry="2.5" fill="none" stroke="#7a4a1a" strokeWidth=".4" strokeOpacity=".6" />
     </g>
   );
   
   const DrumArt = () => (
     <Scene>
       <defs>
         <LG id="evp-dr-bg" s={[[0, "#2e1a0a"], [1, "#0c0603"]]} />
         <LG id="evp-dr-floor" s={[[0, "#2a1708"], [1, "#090402"]]} />
         <LG id="evp-dr-body" x2={1} y2={0} s={[[0, "#2a1204"], [0.3, "#9a5a1c"], [0.5, "#d99a3e"], [0.72, "#7a4012"], [1, "#1f0d03"]]} />
         <LG id="evp-dr-hoop" x2={1} y2={0} s={[[0, "#6a4a14"], [0.5, "#f2cf7a"], [1, "#6a4a14"]]} />
         <RG id="evp-dr-head" cx={0.45} cy={0.4} r={0.7} s={[[0, "#f6e6c0"], [0.7, "#d9b57a"], [1, "#a47a3c"]]} />
         <RG id="evp-dr-ball" cx={0.35} cy={0.3} s={[[0, "#e6b270"], [1, "#6a3a12"]]} />
       </defs>
       <rect width="100" height="125" fill="url(#evp-dr-bg)" />
       <path d="M44,8 L18,70 L82,70 L56,8Z" fill="#f6d56a" fillOpacity=".08" filter="url(#evp-b2)" />
       <Glow x={50} y={44} r={28} c="#e0a040" o={0.25} />
       <Bokeh
         dots={[
           [14, 30, 6, "#f6d56a", 0.25],
           [86, 26, 7, "#e0a040", 0.25],
           [20, 56, 4, "#f6d56a", 0.2],
           [82, 54, 5, "#f6d56a", 0.22],
         ]}
       />
       <rect y="62" width="100" height="64" fill="url(#evp-dr-floor)" />
       <rect y="62" width="100" height=".35" fill="#f6d56a" fillOpacity=".3" />
       <g transform="translate(0 124) scale(1 -1)" opacity=".2" filter="url(#evp-b1)">
         <DrumBody />
       </g>
       <Shadow x={50} y={62.2} rx={20} ry={2.6} o={0.7} />
       <DrumBody />
       <path d="M84,17 C76,19 70,23 65,28" fill="none" stroke="#d9a64a" strokeWidth="1.5" strokeLinecap="round" />
       <circle cx="85" cy="16.6" r="2.8" fill="url(#evp-dr-ball)" />
       <g fill="none" stroke="#f6d56a" strokeLinecap="round" strokeOpacity=".55">
         <path d="M26,32 Q19,44 26,56" strokeWidth=".7" />
         <path d="M74,32 Q81,44 74,56" strokeWidth=".7" />
       </g>
       <g fill="none" stroke="#f6d56a" strokeWidth=".4" strokeOpacity=".6">
         <rect x="5" y="14" width="90" height="98" />
         <rect x="7.4" y="16.4" width="85.2" height="93.2" strokeOpacity=".5" />
       </g>
       {[[5, 14], [95, 14], [5, 112], [95, 112]].map(([x, y], i) => (
         <path key={i} d={diamond} transform={`translate(${x} ${y})`} fill="#f6d56a" />
       ))}
     </Scene>
   );
   export const OwambeNights = (c: Ctx) => TiltedTitle(c, <DrumArt />);
   
   /* ---- Brunch: clinking flutes in morning light ---- */
   const Flute = ({ x, y, r }: { x: number; y: number; r: number }) => (
     <g transform={`translate(${x} ${y}) rotate(${r})`}>
       <path d="M-4.4,-18 L4.4,-18 L3.6,9 C3.4,13 1.4,15 0,15 C-1.4,15 -3.4,13 -3.6,9Z" fill="url(#evp-br-glass)" stroke="#b88a4c" strokeOpacity=".7" strokeWidth=".45" />
       <path d="M-4,-7 L4,-7 L3.3,9 C3.1,12.6 1.3,14.2 0,14.2 C-1.3,14.2 -3.1,12.6 -3.3,9Z" fill="url(#evp-br-liq)" />
       <ellipse cx="0" cy="-7" rx="4" ry=".9" fill="#ffe08a" />
       <rect x="-3.2" y="-16" width="1" height="22" rx=".5" fill="#fff" fillOpacity=".65" />
       {[[-1, 2, 0.5], [1.2, 6, 0.42], [-0.4, 9, 0.35], [1, -2, 0.4], [0.2, 4, 0.3], [-1.4, -4, 0.34]].map(([bx, by, br], i) => (
         <circle key={i} cx={bx} cy={by} r={br} fill="#fff" fillOpacity=".85" />
       ))}
       <rect x="-.5" y="15" width="1" height="11" fill="#fff" fillOpacity=".75" stroke="#b88a4c" strokeOpacity=".5" strokeWidth=".3" />
       <ellipse cx="0" cy="26.6" rx="6" ry="1.5" fill="url(#evp-br-glass)" stroke="#b88a4c" strokeOpacity=".6" strokeWidth=".4" />
     </g>
   );
   
   const BrunchArt = () => (
     <Scene vig={0.35}>
       <defs>
         <LG id="evp-br-wall" s={[[0, "#ffeccd"], [1, "#ffd6a0"]]} />
         <LG id="evp-br-table" s={[[0, "#f4c88e"], [1, "#d89a58"]]} />
         <LG id="evp-br-glass" x2={1} y2={0} s={[[0, "#ffffff", 0.7], [0.5, "#ffffff", 0.15], [1, "#ffffff", 0.55]]} />
         <LG id="evp-br-liq" s={[[0, "#ffd36a"], [1, "#ff9a2e"]]} />
         <RG id="evp-br-orange" cx={0.35} cy={0.3} r={0.8} s={[[0, "#ffc46a"], [0.5, "#f08a1c"], [1, "#a8470a"]]} />
         <RG id="evp-br-cut" s={[[0, "#fff1c8"], [0.6, "#ffb347"], [1, "#e8761a"]]} />
       </defs>
       <rect width="100" height="125" fill="url(#evp-br-wall)" />
       <path d="M60,0 L30,70 L52,70 L84,0Z" fill="#fff" fillOpacity=".25" filter="url(#evp-b2)" />
       <Bokeh
         dots={[
           [14, 28, 9, "#ffffff", 0.55],
           [82, 22, 11, "#fff4c0", 0.55],
           [68, 48, 6, "#ffffff", 0.4],
           [28, 50, 5, "#ffe0a0", 0.45],
           [92, 48, 7, "#ffffff", 0.35],
         ]}
       />
       <rect y="62" width="100" height="64" fill="url(#evp-br-table)" />
       <rect y="62" width="100" height=".4" fill="#fff" fillOpacity=".5" />
       {/* whole orange */}
       <Shadow x={80} y={65.4} rx={9} ry={1.8} o={0.35} />
       <circle cx="80" cy="57" r="8" fill="url(#evp-br-orange)" />
       <ellipse cx="78" cy="53" rx="2.4" ry="1.4" fill="#fff" fillOpacity=".4" transform="rotate(-30 78 53)" />
       <ellipse cx="83" cy="49.6" rx="4" ry="1.7" fill="#5a8a2e" transform="rotate(-24 83 49.6)" />
       {/* orange wheel leaning on the table */}
       <Shadow x={17} y={65.4} rx={8} ry={1.6} o={0.3} />
       <circle cx="17" cy="58" r="7.4" fill="#e8761a" />
       <circle cx="17" cy="58" r="6.5" fill="#fff4d6" />
       <circle cx="17" cy="58" r="5.8" fill="url(#evp-br-cut)" />
       {Array.from({ length: 8 }, (_, i) => (
         <line key={i} x1="17" y1="58" x2={17 + 5.8 * Math.cos((i * Math.PI) / 4)} y2={58 + 5.8 * Math.sin((i * Math.PI) / 4)} stroke="#fff4d6" strokeWidth=".45" />
       ))}
       {/* flutes */}
       <Shadow x={38} y={66.6} rx={7} ry={1.3} o={0.3} />
       <Shadow x={62} y={66.6} rx={7} ry={1.3} o={0.3} />
       <Flute x={43} y={40} r={11} />
       <Flute x={57} y={40} r={-11} />
       {[[50, 17, 0.7], [47, 14.4, 0.5], [53.4, 15, 0.55], [50.6, 12.4, 0.4]].map(([x, y, r], i) => (
         <circle key={i} cx={x} cy={y} r={r} fill="#ffb347" fillOpacity=".8" />
       ))}
     </Scene>
   );
   export const SundayBrunch = (c: Ctx) => TiltedTitle(c, <BrunchArt />);
   
   /* ---- End of an era: cassette under neon ---- */
   const CassetteBody = () => (
     <g transform="rotate(-7 50 40)">
       <rect x="18" y="20" width="64" height="40" rx="4" fill="url(#evp-cs-body)" />
       <rect x="18" y="20" width="64" height="40" rx="4" fill="none" stroke="#14141c" strokeOpacity=".5" strokeWidth=".6" />
       <rect x="19" y="21" width="62" height="1.4" rx=".7" fill="#fff" fillOpacity=".4" />
       <rect x="23" y="24" width="54" height="22" rx="2" fill="url(#evp-cs-label)" />
       <rect x="23" y="24" width="54" height="5" fill="#b79bff" fillOpacity=".85" />
       <path d="M27,34 H48 M27,38 H42" stroke="#14141c" strokeOpacity=".7" strokeWidth=".55" strokeLinecap="round" />
       <rect x="30" y="36" width="40" height="9" rx="4.5" fill="#12101c" />
       <rect x="38" y="39.4" width="24" height="2.2" fill="#4a3426" />
       {[38, 62].map((cx) => (
         <g key={cx}>
           <circle cx={cx} cy="40.5" r="3.7" fill="url(#evp-cs-reel)" />
           {Array.from({ length: 6 }, (_, i) => (
             <rect key={i} x="-.3" y="-3.6" width=".6" height="1.5" fill="#12101c" transform={`translate(${cx} 40.5) rotate(${i * 60})`} />
           ))}
           <circle cx={cx} cy="40.5" r="1" fill="#12101c" />
         </g>
       ))}
       <path d="M28,60 L34,51 H66 L72,60Z" fill="#241e34" />
       <circle cx="41" cy="56" r="1.5" fill="#0c0a14" />
       <circle cx="59" cy="56" r="1.5" fill="#0c0a14" />
       <g fill="#14141c" fillOpacity=".5">
         <circle cx="21" cy="23" r=".9" />
         <circle cx="79" cy="23" r=".9" />
         <circle cx="21" cy="57" r=".9" />
         <circle cx="79" cy="57" r=".9" />
       </g>
     </g>
   );
   
   const CassetteArt = () => (
     <Scene>
       <defs>
         <LG id="evp-cs-bg" s={[[0, "#261a46"], [1, "#0b0814"]]} />
         <LG id="evp-cs-floor" s={[[0, "#1d1430"], [1, "#07050c"]]} />
         <LG id="evp-cs-edge" x2={1} y2={0} s={[[0, "#ff4fa0", 0], [0.5, "#ff4fa0", 0.55], [1, "#33d6ff", 0]]} />
         <LG id="evp-cs-body" s={[[0, "#ffa3cc"], [1, "#d63f7d"]]} />
         <LG id="evp-cs-label" s={[[0, "#fff8ec"], [1, "#e6d8c4"]]} />
         <RG id="evp-cs-reel" cx={0.4} cy={0.35} s={[[0, "#ffffff"], [1, "#b9b0cc"]]} />
       </defs>
       <rect width="100" height="125" fill="url(#evp-cs-bg)" />
       <Glow x={50} y={40} r={30} c="#ff4fa0" o={0.2} />
       <Bokeh
         dots={[
           [14, 30, 8, "#ff4fa0", 0.4],
           [86, 26, 10, "#33d6ff", 0.3],
           [76, 54, 6, "#8a5bff", 0.38],
           [28, 16, 5, "#ff4fa0", 0.3],
           [10, 56, 5, "#33d6ff", 0.28],
         ]}
       />
       <rect y="64" width="100" height="62" fill="url(#evp-cs-floor)" />
       <rect y="64" width="100" height=".5" fill="url(#evp-cs-edge)" />
       <g transform="translate(0 128) scale(1 -1)" opacity=".16" filter="url(#evp-b1)">
         <CassetteBody />
       </g>
       <Shadow x={50} y={64.6} rx={30} ry={2} o={0.7} />
       <CassetteBody />
       <path d="M66,58 C78,62 86,64 76,68 C66,72 58,66 48,68" fill="none" stroke="#0a0810" strokeWidth="1.5" strokeLinecap="round" />
       <path d="M66,57.4 C78,61.4 86,63.4 76,67.4 C66,71.4 58,65.4 48,67.4" fill="none" stroke="#9a86b0" strokeOpacity=".4" strokeWidth=".3" />
     </Scene>
   );
   export const EndOfAnEra = (c: Ctx) => TiltedTitle(c, <CassetteArt />);
   
   /* ---- Rooftop sundown ---- */
   function Skyline({
     seed,
     base,
     min,
     max,
     color,
     o = 1,
     windows,
   }: {
     seed: number;
     base: number;
     min: number;
     max: number;
     color: string;
     o?: number;
     windows?: boolean;
   }) {
     const out: ReactNode[] = [];
     let x = -2;
     let i = 0;
     while (x < 100) {
       const w = 5 + rnd(seed + i) * 5;
       const h = min + rnd(seed + i + 50) * (max - min);
       out.push(<rect key={`b${i}`} x={x} y={base - h} width={w + 0.4} height={h + (125 - base)} fill={color} />);
       if (windows) {
         for (let k = 0; k < 3; k++) {
           for (let j = 0; j < Math.floor(h / 6); j++) {
             if (rnd(seed + i * 7 + k * 3 + j) > 0.55) {
               out.push(<rect key={`w${i}-${k}-${j}`} x={x + 1 + k * 2.6} y={base - h + 3 + j * 5.4} width="1.2" height="1.8" fill="#ffd070" fillOpacity=".85" />);
             }
           }
         }
       }
       x += w;
       i++;
     }
     return <g opacity={o}>{out}</g>;
   }
   
   const SundownArt = () => (
     <Scene vig={0.6}>
       <defs>
         <LG id="evp-sd-sky" s={[[0, "#1c1848"], [0.3, "#5d2c78"], [0.46, "#c94668"], [0.56, "#ff7e4a"], [0.62, "#ffb35e"], [1, "#ffd890"]]} />
         <RG id="evp-sd-sun" cx={0.5} cy={0.5} s={[[0, "#fffbe0"], [0.55, "#ffd070"], [1, "#ff9a3c"]]} />
       </defs>
       <rect width="100" height="125" fill="url(#evp-sd-sky)" />
       <Glow x={50} y={68} r={34} c="#ffb35e" o={0.55} />
       <circle cx="50" cy="68" r="17" fill="url(#evp-sd-sun)" />
       <g filter="url(#evp-b2)">
         <ellipse cx="22" cy="50" rx="24" ry="2.4" fill="#ff9a7a" fillOpacity=".55" />
         <ellipse cx="78" cy="44" rx="26" ry="2" fill="#ffb08a" fillOpacity=".5" />
         <ellipse cx="62" cy="58" rx="30" ry="1.8" fill="#ffd09a" fillOpacity=".5" />
         <ellipse cx="30" cy="34" rx="22" ry="1.6" fill="#a85a9a" fillOpacity=".5" />
         <ellipse cx="74" cy="28" rx="20" ry="1.4" fill="#8a4a9a" fillOpacity=".45" />
       </g>
       <Skyline seed={3} base={100} min={12} max={22} color="#8a3f6a" o={0.85} />
       <Skyline seed={11} base={106} min={20} max={34} color="#5a2a62" />
       <Skyline seed={29} base={118} min={28} max={46} color="#241238" windows />
       {/* palm */}
       <path d="M92,125 C92,100 88,74 84,54" fill="none" stroke="#140a1e" strokeWidth="2.4" strokeLinecap="round" />
       <g transform="translate(84 54)" fill="#140a1e">
         {[-170, -135, -100, -55, -15, 25].map((r) => (
           <ellipse key={r} cx="9" cy="0" rx="10" ry="2.2" transform={`rotate(${r})`} />
         ))}
         <circle r="1.8" />
       </g>
       <path d="M18,40 q2,-3 4,0 q2,-3 4,0" fill="none" stroke="#2a1438" strokeWidth=".6" strokeLinecap="round" />
       <path d="M30,32 q1.6,-2.4 3.2,0 q1.6,-2.4 3.2,0" fill="none" stroke="#2a1438" strokeWidth=".5" strokeLinecap="round" />
     </Scene>
   );
   export const RooftopSundown = (c: Ctx) => TiltedTitle(c, <SundownArt />);
   
   /* ---- Oktoberfest: pretzel + stein ---- */
   const OktoberfestArt = () => (
     <Scene>
       <defs>
         <LG id="evp-ok-bg" s={[[0, "#14594a"], [1, "#07261e"]]} />
         <LG id="evp-ok-wood" s={[[0, "#8a5428"], [1, "#3e2210"]]} />
         <LG id="evp-ok-board" s={[[0, "#e6c48a"], [1, "#b88a52"]]} />
         <LG id="evp-ok-pretzel" x1={0} y1={-12} x2={0} y2={26} u="userSpaceOnUse" s={[[0, "#f0b050"], [1, "#b8641c"]]} />
         <LG id="evp-ok-beer" s={[[0, "#ffe27a"], [0.55, "#e8941c"], [1, "#b8650c"]]} />
         <LG id="evp-ok-glass" x2={1} y2={0} s={[[0, "#fff6e0", 0.35], [0.4, "#fff6e0", 0], [1, "#fff6e0", 0.25]]} />
       </defs>
       <rect width="100" height="125" fill="url(#evp-ok-bg)" />
       <Bokeh
         dots={[
           [16, 44, 8, "#ffcf6a", 0.25],
           [84, 40, 9, "#ffb347", 0.22],
           [60, 30, 5, "#ffe08a", 0.2],
           [34, 28, 5, "#ffcf6a", 0.2],
         ]}
       />
       {/* bunting */}
       <path d="M0,14 Q50,34 100,14" fill="none" stroke="#e8d8b0" strokeOpacity=".7" strokeWidth=".4" />
       {[0.06, 0.16, 0.26, 0.36, 0.46, 0.56, 0.66, 0.76, 0.86, 0.96].map((t, i) => {
         const x = 100 * t;
         const y = 14 + 40 * t * (1 - t);
         return (
           <path key={i} d={`M${x - 3.8},${y} L${x + 3.8},${y} L${x},${y + 9}Z`} fill={i % 2 ? "#fff6e0" : "#2f86d6"} fillOpacity=".95" />
         );
       })}
       <rect y="62" width="100" height="64" fill="url(#evp-ok-wood)" />
       <path d="M0,62 H100" stroke="#ffd9a0" strokeOpacity=".3" strokeWidth=".4" />
       <path d="M0,76 H100 M0,92 H100 M0,108 H100" stroke="#000" strokeOpacity=".28" strokeWidth=".35" />
       <path d="M24,76 V92 M70,92 V108 M44,62 V76" stroke="#000" strokeOpacity=".22" strokeWidth=".3" />
       {/* board + pretzel */}
       <Shadow x={38} y={65.6} rx={30} ry={3.4} o={0.55} />
       <ellipse cx="38" cy="64" rx="29" ry="4.4" fill="url(#evp-ok-board)" />
       <g transform="translate(38 44) scale(.82)">
         <path d="M-14,26 C-30,22 -34,-2 -20,-8 C-8,-12 -2,-2 0,6 C2,-2 8,-12 20,-8 C34,-2 30,22 14,26" fill="none" stroke="#6b3410" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" />
         <path d="M-22,14 C-10,30 10,30 22,14" fill="none" stroke="#6b3410" strokeWidth="9" strokeLinecap="round" />
         <path d="M-14,26 C-30,22 -34,-2 -20,-8 C-8,-12 -2,-2 0,6 C2,-2 8,-12 20,-8 C34,-2 30,22 14,26" fill="none" stroke="url(#evp-ok-pretzel)" strokeWidth="6.4" strokeLinecap="round" strokeLinejoin="round" />
         <path d="M-22,14 C-10,30 10,30 22,14" fill="none" stroke="url(#evp-ok-pretzel)" strokeWidth="6.4" strokeLinecap="round" />
         <path d="M-27,-3 C-23,-9 -15,-9 -11,-4" fill="none" stroke="#ffd68a" strokeOpacity=".8" strokeWidth="1.3" strokeLinecap="round" />
         <path d="M27,-3 C23,-9 15,-9 11,-4" fill="none" stroke="#ffd68a" strokeOpacity=".8" strokeWidth="1.3" strokeLinecap="round" />
         {[[-27, 4, 20], [-18, -7, -10], [27, 4, -20], [18, -7, 10], [-8, 24, 0], [8, 24, 0], [0, 5, 40], [-12, 18, 30], [12, 18, -30]].map(([x, y, r], i) => (
           <rect key={i} x="-1.2" y="-.5" width="2.4" height="1" rx=".4" fill="#fff6e0" transform={`translate(${x} ${y}) rotate(${r})`} />
         ))}
       </g>
       {/* stein */}
       <Shadow x={80} y={66.2} rx={14} ry={2.4} o={0.6} />
       <path d="M88,42 H92 Q97,42 97,49 Q97,57 92,57 H88" fill="none" stroke="#fff6e0" strokeOpacity=".7" strokeWidth="2.2" />
       <path d="M68,36 H88 V63 Q88,65 86,65 H70 Q68,65 68,63Z" fill="url(#evp-ok-beer)" />
       <path d="M68,36 H88 V63 Q88,65 86,65 H70 Q68,65 68,63Z" fill="url(#evp-ok-glass)" stroke="#fff6e0" strokeOpacity=".5" strokeWidth=".5" />
       <rect x="68.6" y="60" width="18.8" height="4.6" rx="1" fill="#fff6e0" fillOpacity=".22" />
       <rect x="70.4" y="39" width="1.8" height="20" rx=".9" fill="#fff" fillOpacity=".4" />
       {[[76, 58, 0.5], [80, 52, 0.4], [83, 46, 0.45], [75, 44, 0.35], [84, 56, 0.35]].map(([x, y, r], i) => (
         <circle key={i} cx={x} cy={y} r={r} fill="#fff6e0" fillOpacity=".55" />
       ))}
       <rect x="68" y="33" width="20" height="5" fill="#fffaf0" />
       {[[70, 34.4, 3.8], [75.4, 31.4, 4.8], [81.4, 31.2, 5], [86.2, 34.2, 3.8]].map(([x, y, r], i) => (
         <circle key={i} cx={x} cy={y} r={r} fill="#fffaf0" />
       ))}
       {[[73, 36, 2.4], [79, 35, 2.6], [84, 36.4, 2.2]].map(([x, y, r], i) => (
         <circle key={i} cx={x} cy={y} r={r} fill="#eadfc6" fillOpacity=".7" />
       ))}
     </Scene>
   );
   export const Oktoberfest = (c: Ctx) => TiltedTitle(c, <OktoberfestArt />);
   
   /* ---- Ramen night ---- */
   const RamenArt = () => (
     <Scene>
       <defs>
         <LG id="evp-rm-bg" s={[[0, "#6e1410"], [1, "#1c0606"]]} />
         <LG id="evp-rm-counter" s={[[0, "#5a2c14"], [1, "#1a0b05"]]} />
         <RG id="evp-rm-head" cx={0.4} cy={0.3} r={0.8} s={[[0, "#3a3a46"], [1, "#0b0b0f"]]} />
         <RG id="evp-rm-iris" s={[[0, "#ffe27a"], [1, "#d98a1a"]]} />
         <LG id="evp-rm-bowl" x2={1} y2={0} s={[[0, "#bfae8e"], [0.35, "#fff8e8"], [0.7, "#eadbbd"], [1, "#a89878"]]} />
         <LG id="evp-rm-broth" s={[[0, "#f0b25a"], [1, "#b76a1e"]]} />
         <RG id="evp-rm-yolk" cx={0.4} cy={0.35} s={[[0, "#ffcf5a"], [1, "#e8861a"]]} />
       </defs>
       <rect width="100" height="125" fill="url(#evp-rm-bg)" />
       <Glow x={50} y={34} r={28} c="#ff7a4a" o={0.25} />
       <Bokeh
         dots={[
           [14, 26, 8, "#ff6a3a", 0.38],
           [86, 24, 9, "#ffb347", 0.3],
           [72, 52, 5, "#ff5a2a", 0.3],
           [26, 54, 4, "#ffb347", 0.3],
           [90, 54, 5, "#ff8a3a", 0.25],
         ]}
       />
       <rect y="62" width="100" height="64" fill="url(#evp-rm-counter)" />
       <rect y="62" width="100" height=".4" fill="#ffb98a" fillOpacity=".3" />
       {/* steam */}
       <g fill="none" stroke="#fff1d6" strokeOpacity=".32" strokeWidth="2.2" strokeLinecap="round" filter="url(#evp-b1)">
         <path d="M20,44 C15,36 25,32 20,22" />
         <path d="M80,44 C75,36 85,32 80,24" />
         <path d="M66,38 C62,32 70,28 66,20" />
       </g>
       {/* cat */}
       <path d="M37,25 L34.5,12 L46,20Z" fill="#14141a" />
       <path d="M63,25 L65.5,12 L54,20Z" fill="#14141a" />
       <path d="M37.6,22 L36.6,15.6 L42,19.4Z" fill="#7a3a3a" fillOpacity=".7" />
       <path d="M62.4,22 L63.4,15.6 L58,19.4Z" fill="#7a3a3a" fillOpacity=".7" />
       <path d="M34.5,12 L46,20 M65.5,12 L54,20" stroke="#ff9a6a" strokeOpacity=".5" strokeWidth=".5" />
       <ellipse cx="50" cy="31" rx="15" ry="12.5" fill="url(#evp-rm-head)" />
       <circle cx="44" cy="30" r="3.7" fill="url(#evp-rm-iris)" />
       <circle cx="56" cy="30" r="3.7" fill="url(#evp-rm-iris)" />
       <ellipse cx="44" cy="30" rx="1.1" ry="2.8" fill="#0b0b0f" />
       <ellipse cx="56" cy="30" rx="1.1" ry="2.8" fill="#0b0b0f" />
       <circle cx="42.8" cy="28.6" r=".9" fill="#fff" />
       <circle cx="54.8" cy="28.6" r=".9" fill="#fff" />
       <path d="M48.6,35 h2.8 l-1.4,1.7z" fill="#c9667a" />
       <g stroke="#fff1d6" strokeOpacity=".6" strokeWidth=".3" strokeLinecap="round">
         <path d="M29,33 H38 M29.6,37 L38,35.4" />
         <path d="M71,33 H62 M70.4,37 L62,35.4" />
       </g>
       {/* chopsticks + noodles */}
       <g stroke="#d9a35a" strokeWidth="1.4" strokeLinecap="round">
         <path d="M90,13 L63,42" />
         <path d="M94,17 L67,45" />
       </g>
       <g stroke="#f3d29a" strokeOpacity=".5" strokeWidth=".35" strokeLinecap="round">
         <path d="M89.4,12.6 L62.6,41.4" />
         <path d="M93.4,16.6 L66.6,44.4" />
       </g>
       <g fill="none" stroke="#f0c46a" strokeWidth="1.3" strokeLinecap="round">
         <path d="M63,41 C57,45 66,48 60,53" />
         <path d="M65,43 C60,47 68,50 63,55" />
         <path d="M67,44 C62,49 70,51 66,56" />
       </g>
       {/* bowl */}
       <Shadow x={50} y={66.4} rx={32} ry={3} o={0.6} />
       <rect x="40" y="62" width="20" height="3.6" rx="1.8" fill="#2a2450" />
       <path d="M20,46 C20,58 32,64 50,64 C68,64 80,58 80,46Z" fill="url(#evp-rm-bowl)" />
       <path d="M21.4,53 C27,60 36,62 50,62 C64,62 73,60 78.6,53" fill="none" stroke="#2a2a6a" strokeWidth="1.4" />
       <path d="M23,56.6 C29,62 37,64 50,64 C63,64 71,62 77,56.6" fill="none" stroke="#c2531b" strokeWidth=".8" />
       <ellipse cx="50" cy="46" rx="30" ry="5" fill="#fff1d6" />
       <ellipse cx="50" cy="46.4" rx="27" ry="3.7" fill="url(#evp-rm-broth)" />
       <circle cx="42" cy="46.6" r="3" fill="#fff" />
       <path d="M40.4,46.6 a1.6,1.6 0 1 1 1.6,1.6" fill="none" stroke="#e0607f" strokeWidth=".7" strokeLinecap="round" />
       <ellipse cx="58" cy="46.8" rx="3.6" ry="2.4" fill="#fff" />
       <circle cx="58" cy="46.8" r="1.4" fill="url(#evp-rm-yolk)" />
       <rect x="45" y="44.6" width="4" height="3.6" rx=".4" fill="#1d3a22" />
       {[[51.6, 47.4], [53.4, 46], [47.8, 49]].map(([x, y], i) => (
         <circle key={i} cx={x} cy={y} r=".7" fill="#7ab04c" />
       ))}
       <ellipse cx="34" cy="44.2" rx="5" ry="3.2" fill="url(#evp-rm-head)" />
       <ellipse cx="66" cy="44.2" rx="5" ry="3.2" fill="url(#evp-rm-head)" />
     </Scene>
   );
   export const RamenNight = (c: Ctx) => TiltedTitle(c, <RamenArt />);
   
   /* ---- Halloween: pumpkin under a full moon ---- */
   const Bat = ({ x, y, s = 1 }: { x: number; y: number; s?: number }) => (
     <path
       d="M0,0 C-2,-3 -5,-3 -9,0 C-6,-1 -4,0 -3,2.4 C-2,1.2 -1,1.2 0,2.4 C1,1.2 2,1.2 3,2.4 C4,0 6,-1 9,0 C5,-3 2,-3 0,0Z"
       transform={`translate(${x} ${y}) scale(${s})`}
       fill="#07030f"
     />
   );
   
   const HalloweenArt = () => (
     <Scene>
       <defs>
         <LG id="evp-hw-sky" s={[[0, "#1d0e3c"], [1, "#0a0414"]]} />
         <LG id="evp-hw-ground" s={[[0, "#150a2a"], [1, "#050210"]]} />
         <RG id="evp-hw-moon" cx={0.38} cy={0.35} r={0.75} s={[[0, "#fffbe6"], [0.6, "#ecd790"], [1, "#cdb468"]]} />
         <RG id="evp-hw-lobe" cx={0.5} cy={0.4} r={0.65} s={[[0, "#ffb347"], [0.55, "#f0700f"], [1, "#8f2f05"]]} />
         <LG id="evp-hw-stem" x2={1} y2={0} s={[[0, "#7a8a2a"], [1, "#3a4a14"]]} />
         <RG id="evp-hw-face" s={[[0, "#fff0a8"], [1, "#ff9a2e"]]} />
       </defs>
       <rect width="100" height="125" fill="url(#evp-hw-sky)" />
       <Glow x={70} y={30} r={26} c="#fff0b0" o={0.28} />
       <circle cx="70" cy="30" r="15" fill="url(#evp-hw-moon)" />
       <g fill="#c9b062" fillOpacity=".5" filter="url(#evp-b05)">
         <circle cx="65" cy="25" r="2.6" />
         <circle cx="75" cy="34" r="3.2" />
         <circle cx="73" cy="23" r="1.5" />
         <circle cx="63" cy="35" r="1.8" />
       </g>
       <g filter="url(#evp-b2)">
         <ellipse cx="62" cy="38" rx="20" ry="1.6" fill="#1d0e3c" fillOpacity=".6" />
         <ellipse cx="84" cy="22" rx="14" ry="1.2" fill="#1d0e3c" fillOpacity=".55" />
       </g>
       <g stroke="#fff" strokeOpacity=".28" strokeWidth=".3" fill="none">
         <path d="M0,12.5 L24,12.5 M0,12.5 L22,26 M0,12.5 L12,34 M0,12.5 L0,38" />
         <path d="M8,12.5 Q8,18 0,20 M15,12.5 Q14,22 0,28 M22,12.5 Q20,28 0,36" />
       </g>
       <rect y="66" width="100" height="60" fill="url(#evp-hw-ground)" />
       <g filter="url(#evp-b4)" fill="#8a6aff">
         <ellipse cx="28" cy="67" rx="38" ry="3.4" fillOpacity=".2" />
         <ellipse cx="80" cy="68" rx="34" ry="3" fillOpacity=".16" />
       </g>
       {/* pumpkin */}
       <Shadow x={42} y={66.4} rx={24} ry={3} o={0.7} />
       <ellipse cx="31" cy="51" rx="11" ry="14" fill="url(#evp-hw-lobe)" />
       <ellipse cx="53" cy="51" rx="11" ry="14" fill="url(#evp-hw-lobe)" />
       <ellipse cx="42" cy="51" rx="13" ry="15.5" fill="url(#evp-hw-lobe)" />
       <g fill="none" stroke="#7a2a04" strokeOpacity=".55" strokeWidth=".6" strokeLinecap="round">
         <path d="M33,37 C28,46 28,58 33,66" />
         <path d="M51,37 C56,46 56,58 51,66" />
         <path d="M42,36 C41,48 41,58 42,66" strokeOpacity=".3" />
       </g>
       <path d="M40,36 C40,31 42,29 46,28 L47.4,30.4 C45,31 44.6,32.6 44.6,36Z" fill="url(#evp-hw-stem)" />
       <Glow x={42} y={52} r={12} c="#ffb030" o={0.5} b={4} />
       <g fill="url(#evp-hw-face)">
         <path d="M35.5,47 l3.3,-5.6 l3.3,5.6Z" />
         <path d="M43.2,47 l3.3,-5.6 l3.3,5.6Z" />
         <path d="M40.2,51 l1.8,-2.8 l1.8,2.8Z" />
         <path d="M31,55 H53 L50.6,60.6 L47.4,57.2 L44.2,61.4 L41,57.2 L37.8,61.4 L34.6,57.2Z" />
       </g>
       <Bat x={20} y={24} s={1.3} />
       <Bat x={52} y={16} s={1} />
       <Bat x={88} y={56} s={1.1} />
     </Scene>
   );
   export const PumpkinParty = (c: Ctx) => TiltedTitle(c, <HalloweenArt />);
   
   /* =====================================================================
      MORE SCENES
      ===================================================================== */
   
   const star = (cx: number, cy: number, R: number, r: number) =>
     Array.from({ length: 10 }, (_, i) => {
       const a = -Math.PI / 2 + (i * Math.PI) / 5;
       const rad = i % 2 ? r : R;
       return `${(cx + rad * Math.cos(a)).toFixed(2)},${(cy + rad * Math.sin(a)).toFixed(2)}`;
     }).join(" ");
   
   /* ---- Beach day ---- */
   const BeachArt = () => (
     <Scene vig={0.55}>
       <defs>
         <LG id="evp-bc-sky" s={[[0, "#1d5fa8"], [0.3, "#5aa0d8"], [0.416, "#fbbf7a"], [1, "#fbbf7a"]]} />
         <LG id="evp-bc-sea" s={[[0, "#1fa6c8"], [1, "#0a5a86"]]} />
         <LG id="evp-bc-sand" s={[[0, "#e8b070"], [0.5, "#a86c34"], [1, "#4a2a12"]]} />
         <RG id="evp-bc-sun" s={[[0, "#fffbe0"], [1, "#ffcf6a"]]} />
       </defs>
       <rect width="100" height="125" fill="url(#evp-bc-sky)" />
       <Glow x={50} y={50} r={24} c="#ffcf7a" o={0.6} />
       <circle cx="50" cy="50" r="7.5" fill="url(#evp-bc-sun)" />
       <g filter="url(#evp-b2)">
         <ellipse cx="24" cy="30" rx="22" ry="1.8" fill="#fff" fillOpacity=".35" />
         <ellipse cx="80" cy="24" rx="20" ry="1.5" fill="#ffd9b0" fillOpacity=".4" />
       </g>
       <rect y="52" width="100" height="26" fill="url(#evp-bc-sea)" />
       <g filter="url(#evp-b05)" fill="#ffe2a0">
         <rect x="44" y="53.6" width="12" height="1" fillOpacity=".8" />
         <rect x="45.5" y="56" width="9" height="1" fillOpacity=".6" />
         <rect x="46.5" y="59" width="7" height="1" fillOpacity=".5" />
         <rect x="47.5" y="63" width="5" height="1" fillOpacity=".4" />
       </g>
       <g fill="none" stroke="#fff" strokeOpacity=".3" strokeWidth=".4" strokeLinecap="round">
         <path d="M6,58 q4,-1.4 8,0 t8,0" />
         <path d="M70,62 q4,-1.4 8,0 t8,0" />
         <path d="M24,68 q4,-1.4 8,0 t8,0" />
       </g>
       <path d="M0,74 Q25,70 50,74 T100,72 V125 H0Z" fill="url(#evp-bc-sand)" />
       <path d="M0,74 Q25,70 50,74 T100,72" fill="none" stroke="#fff" strokeOpacity=".8" strokeWidth="1.4" filter="url(#evp-b05)" />
       <path d="M0,77 Q25,73.4 50,77 T100,75.4" fill="none" stroke="#fff" strokeOpacity=".35" strokeWidth=".8" filter="url(#evp-b05)" />
       {/* palm */}
       <path d="M10,80 C12,62 16,46 26,30" fill="none" stroke="#4a2a12" strokeWidth="3" strokeLinecap="round" />
       <path d="M10.6,80 C12.6,62 16.6,46 26.6,30" fill="none" stroke="#b08050" strokeOpacity=".7" strokeWidth=".9" strokeLinecap="round" />
       <g transform="translate(26 30)">
         {[-175, -140, -105, -60, -20, 20].map((r) => (
           <ellipse key={r} cx="9" cy="0" rx="11" ry="2.4" fill="#1d5a2a" transform={`rotate(${r})`} />
         ))}
         {[-160, -120, -75, -35, 5].map((r) => (
           <ellipse key={r} cx="8" cy="-.6" rx="9" ry="1.3" fill="#3aa04a" fillOpacity=".7" transform={`rotate(${r})`} />
         ))}
         <circle cx="-1.6" cy="2.4" r="1.7" fill="#4a2a12" />
         <circle cx="1.6" cy="3" r="1.7" fill="#4a2a12" />
       </g>
       {/* umbrella */}
       <Shadow x={80} y={77} rx={13} ry={1.8} o={0.35} />
       <path d="M79,76 L77,38" stroke="#efe6d4" strokeWidth=".9" />
       <polygon points="77,34 61,49 69,47 77,49.6" fill="#ff6a5a" />
       <polygon points="77,34 69,47 77,49.6" fill="#f8efe0" />
       <polygon points="77,34 77,49.6 85,47" fill="#ff6a5a" />
       <polygon points="77,34 85,47 93,49" fill="#f8efe0" />
       <path d="M61,49 Q65,46 69,47 Q73,45 77,49.6 Q81,45 85,47 Q89,46 93,49" fill="none" stroke="#000" strokeOpacity=".15" strokeWidth=".4" />
     </Scene>
   );
   export const BeachDay = (c: Ctx) => TiltedTitle(c, <BeachArt />);
   
   /* ---- Housewarming: lit windows at dusk ---- */
   const HouseArt = () => (
     <Scene>
       <defs>
         <LG id="evp-hs-sky" s={[[0, "#1b2850"], [0.5, "#5a4a7a"], [1, "#2a2038"]]} />
         <LG id="evp-hs-wall" x2={1} y2={0} s={[[0, "#e8c9a0"], [1, "#b88a5a"]]} />
         <LG id="evp-hs-roof" s={[[0, "#8a3a2c"], [1, "#4a1c16"]]} />
         <RG id="evp-hs-win" s={[[0, "#fff4b8"], [1, "#ffb347"]]} />
         <LG id="evp-hs-door" x2={1} y2={0} s={[[0, "#2f7a78"], [1, "#164a4a"]]} />
         <LG id="evp-hs-grass" s={[[0, "#1c3028"], [1, "#050a08"]]} />
         <LG id="evp-hs-spill" s={[[0, "#ffcf6a", 0.5], [1, "#ffcf6a", 0]]} />
         <RG id="evp-hs-tree" cx={0.4} cy={0.35} s={[[0, "#2f6a3a"], [1, "#0e2a18"]]} />
       </defs>
       <rect width="100" height="125" fill="url(#evp-hs-sky)" />
       <circle cx="84" cy="24" r="5" fill="#fff4d0" />
       <Glow x={84} y={24} r={12} c="#fff4d0" o={0.25} />
       <Bokeh
         dots={[
           [14, 34, 6, "#ffcf6a", 0.3],
           [90, 46, 7, "#ffb347", 0.28],
           [10, 56, 4, "#ffcf6a", 0.25],
           [40, 14, 5, "#ffffff", 0.2],
         ]}
       />
       <rect y="64" width="100" height="62" fill="url(#evp-hs-grass)" />
       {/* house */}
       <rect x="62" y="22" width="6" height="14" fill="#6a2a22" />
       <rect x="28" y="40" width="44" height="26" fill="url(#evp-hs-wall)" />
       <polygon points="22,42 50,18 78,42" fill="url(#evp-hs-roof)" />
       <rect x="22" y="41" width="56" height="2" fill="#2a0e0a" fillOpacity=".5" />
       <Glow x={38} y={52} r={9} c="#ffcf6a" o={0.45} b={4} />
       <Glow x={62} y={52} r={9} c="#ffcf6a" o={0.45} b={4} />
       {[33, 57].map((x) => (
         <g key={x}>
           <rect x={x} y="47" width="10" height="10" fill="url(#evp-hs-win)" stroke="#5a3a22" strokeWidth=".8" />
           <path d={`M${x + 5},47 V57 M${x},52 H${x + 10}`} stroke="#5a3a22" strokeWidth=".6" />
         </g>
       ))}
       <path d="M46,66 H54 L63,82 H37Z" fill="url(#evp-hs-spill)" filter="url(#evp-b1)" />
       <rect x="46" y="50" width="8" height="16" rx="3.6" fill="url(#evp-hs-door)" />
       <circle cx="52.2" cy="59" r=".7" fill="#ffd27a" />
       <rect x="44.5" y="66.4" width="11" height="2.2" rx=".6" fill="#8a5a2c" />
       {/* pots */}
       {[40, 60].map((x) => (
         <g key={x}>
           <path d={`M${x - 2.4},62 h4.8 l-.8,4 h-3.2Z`} fill="#b0562c" />
           <ellipse cx={x - 1.4} cy="60" rx="2.6" ry="1.1" fill="#3a8a4a" transform={`rotate(-30 ${x - 1.4} 60)`} />
           <ellipse cx={x + 1.4} cy="60" rx="2.6" ry="1.1" fill="#4aa05a" transform={`rotate(30 ${x + 1.4} 60)`} />
         </g>
       ))}
       {/* tree */}
       <rect x="86" y="50" width="2.4" height="16" fill="#3a2414" />
       <circle cx="87" cy="44" r="9" fill="url(#evp-hs-tree)" />
       <circle cx="82" cy="50" r="6" fill="url(#evp-hs-tree)" />
       <circle cx="92" cy="50" r="6" fill="url(#evp-hs-tree)" />
       {/* string lights */}
       <path d="M0,22 Q12,34 24,40 M76,40 Q90,30 100,22" fill="none" stroke="#fff" strokeOpacity=".4" strokeWidth=".3" />
       {[[4, 25.4], [10, 30.4], [16, 35], [21, 38.6], [80, 38.4], [86, 34], [92, 29.4], [97, 25]].map(([x, y], i) => (
         <g key={i}>
           <Glow x={x} y={y} r={2.2} c="#ffe08a" o={0.6} b={2} />
           <circle cx={x} cy={y} r=".9" fill="#fff4c0" />
         </g>
       ))}
     </Scene>
   );
   export const Housewarming = (c: Ctx) => TiltedTitle(c, <HouseArt />);
   
   /* ---- Small gathering: candlelit table ---- */
   const Wineglass = ({ x }: { x: number }) => (
     <g transform={`translate(${x} 34)`}>
       <path d="M-5.4,0 C-5.4,9 -2.8,13 0,13 C2.8,13 5.4,9 5.4,0Z" fill="url(#evp-sg-glass)" stroke="#fff" strokeOpacity=".5" strokeWidth=".4" />
       <path d="M-5,4.4 C-4.6,10 -2.6,12.4 0,12.4 C2.6,12.4 4.6,10 5,4.4Z" fill="url(#evp-sg-wine)" />
       <rect x="-3.8" y="1" width="1" height="10" rx=".5" fill="#fff" fillOpacity=".5" />
       <rect x="-.4" y="13" width=".8" height="15" fill="#fff" fillOpacity=".7" />
       <ellipse cx="0" cy="28.4" rx="5" ry="1.2" fill="url(#evp-sg-glass)" stroke="#fff" strokeOpacity=".4" strokeWidth=".3" />
     </g>
   );
   
   const GatheringArt = () => (
     <Scene>
       <defs>
         <LG id="evp-sg-bg" s={[[0, "#2a1608"], [1, "#0c0603"]]} />
         <LG id="evp-sg-table" s={[[0, "#4a2a14"], [1, "#150a05"]]} />
         <LG id="evp-sg-bottle" x2={1} y2={0} s={[[0, "#0a2418"], [0.3, "#2e7a52"], [1, "#0a2418"]]} />
         <LG id="evp-sg-candle" x2={1} y2={0} s={[[0, "#fff8e8"], [1, "#d9c8a8"]]} />
         <LG id="evp-sg-glass" x2={1} y2={0} s={[[0, "#fff", 0.45], [0.5, "#fff", 0.08], [1, "#fff", 0.35]]} />
         <LG id="evp-sg-wine" s={[[0, "#a8284a"], [1, "#5a0e24"]]} />
         <RG id="evp-sg-flame" s={[[0, "#fffbe0"], [0.5, "#ffd25a"], [1, "#ff8a2a"]]} />
       </defs>
       <rect width="100" height="125" fill="url(#evp-sg-bg)" />
       <Glow x={48} y={44} r={28} c="#ff9a4a" o={0.3} />
       <Bokeh
         dots={[
           [14, 30, 8, "#ffb347", 0.3],
           [88, 28, 9, "#ffcf6a", 0.28],
           [22, 54, 5, "#ff9a4a", 0.25],
           [86, 54, 6, "#ffb347", 0.25],
           [56, 16, 5, "#ffe08a", 0.22],
         ]}
       />
       <rect y="62" width="100" height="64" fill="url(#evp-sg-table)" />
       <rect y="62" width="100" height=".4" fill="#ffcf9a" fillOpacity=".3" />
       <ellipse cx="48" cy="64" rx="26" ry="3" fill="#ffb347" fillOpacity=".22" filter="url(#evp-b2)" />
       {/* bottle */}
       <Shadow x={27} y={63} rx={9} ry={1.6} o={0.6} />
       <path d="M22,62 V38 Q22,34 25,31 V22 H29 V31 Q32,34 32,38 V62Z" fill="url(#evp-sg-bottle)" />
       <rect x="24.6" y="20.4" width="4.8" height="4" rx=".6" fill="#c9a24a" />
       <rect x="22.6" y="44" width="8.8" height="10" fill="#f4e9d2" />
       <path d="M24.4,47 H29.6 M24.4,49.6 H29.6 M25.6,52 H28.4" stroke="#6a4a2a" strokeOpacity=".7" strokeWidth=".4" />
       <rect x="23.4" y="36" width="1.2" height="24" rx=".6" fill="#fff" fillOpacity=".3" />
       {/* candles */}
       {[[44, 14], [52, 9]].map(([x, h]) => (
         <g key={x}>
           <ellipse cx={x} cy="62.4" rx="3.4" ry=".9" fill="#b8903a" />
           <rect x={x - 1.8} y={62 - h} width="3.6" height={h} fill="url(#evp-sg-candle)" />
           <Glow x={x} y={62 - h - 3} r={7} c="#ffb347" o={0.55} b={4} />
           <ellipse cx={x} cy={62 - h - 2.8} rx="1.3" ry="2.6" fill="url(#evp-sg-flame)" />
         </g>
       ))}
       {/* glasses */}
       <Shadow x={64} y={63} rx={6} ry={1.2} o={0.5} />
       <Shadow x={77} y={63} rx={6} ry={1.2} o={0.5} />
       <Wineglass x={64} />
       <Wineglass x={77} />
     </Scene>
   );
   export const SmallGathering = (c: Ctx) => TiltedTitle(c, <GatheringArt />);
   
   /* ---- Graduation ---- */
   const GraduationArt = () => (
     <Scene>
       <defs>
         <LG id="evp-gr-bg" s={[[0, "#0d1b3d"], [1, "#050b1c"]]} />
         <LG id="evp-gr-table" s={[[0, "#14213f"], [1, "#050914"]]} />
         <LG id="evp-gr-board" s={[[0, "#2e3858"], [1, "#0a0f1f"]]} />
         <LG id="evp-gr-base" x2={1} y2={0} s={[[0, "#0a0f1f"], [0.4, "#222c48"], [1, "#05080f"]]} />
         <LG id="evp-gr-gold" s={[[0, "#fff0b8"], [0.5, "#d4b24a"], [1, "#8a6a1a"]]} />
         <LG id="evp-gr-paper" s={[[0, "#fffaf0"], [1, "#d8c8a8"]]} />
       </defs>
       <rect width="100" height="125" fill="url(#evp-gr-bg)" />
       <Glow x={50} y={36} r={30} c="#d4b24a" o={0.2} />
       <Bokeh
         dots={[
           [14, 28, 7, "#f4e3a1", 0.28],
           [86, 26, 8, "#d4b24a", 0.28],
           [76, 56, 5, "#f4e3a1", 0.25],
           [22, 54, 5, "#d4b24a", 0.25],
           [58, 14, 4, "#ffffff", 0.2],
         ]}
       />
       <rect y="62" width="100" height="64" fill="url(#evp-gr-table)" />
       <rect y="62" width="100" height=".4" fill="#f4e3a1" fillOpacity=".3" />
       {/* diploma */}
       <Shadow x={50} y={64.6} rx={30} ry={2} o={0.7} />
       <rect x="24" y="55.6" width="52" height="7.4" rx="3.4" fill="url(#evp-gr-paper)" />
       <ellipse cx="24.6" cy="59.3" rx="2.2" ry="3.7" fill="#e8d8b8" />
       <ellipse cx="75.4" cy="59.3" rx="2.2" ry="3.7" fill="#e8d8b8" />
       <path d="M24.6,59.3 m-1,0 a1,1.8 0 1 0 2,0" fill="none" stroke="#a89878" strokeWidth=".3" />
       <rect x="47.6" y="55" width="4.8" height="8.6" fill="#b52a3a" />
       <circle cx="50" cy="59.3" r="1.3" fill="#d4384a" />
       {/* cap */}
       <path d="M32,38 V49 Q50,58 68,49 V38 L50,44Z" fill="url(#evp-gr-base)" />
       <polygon points="16,31 50,44 50,47.4 16,34.4" fill="#05080f" />
       <polygon points="50,44 84,31 84,34.4 50,47.4" fill="#0a0f1f" />
       <polygon points="50,17 84,31 50,44 16,31" fill="url(#evp-gr-board)" />
       <polygon points="50,17 84,31 50,44 16,31" fill="none" stroke="#f4e3a1" strokeOpacity=".35" strokeWidth=".3" />
       <polygon points="50,19 74,28.6 50,38 28,28.6" fill="#fff" fillOpacity=".05" />
       <circle cx="50" cy="31" r="1.5" fill="url(#evp-gr-gold)" />
       <path d="M50,31 L80,32.6 V46" fill="none" stroke="url(#evp-gr-gold)" strokeWidth=".9" strokeLinecap="round" strokeLinejoin="round" />
       <rect x="78.6" y="44" width="2.8" height="2.6" rx=".6" fill="url(#evp-gr-gold)" />
       <path d="M78.8,46.6 V52 M79.6,46.6 V53 M80.4,46.6 V52.6 M81.2,46.6 V51.6" stroke="#d4b24a" strokeWidth=".4" strokeLinecap="round" />
     </Scene>
   );
   export const GraduationDay = (c: Ctx) => TiltedTitle(c, <GraduationArt />);
   
   /* ---- Christmas party ---- */
   const ChristmasArt = () => {
     const tiers: [number, number, number][] = [
       [18, 36, 12],
       [26, 48, 17],
       [36, 62, 22],
     ];
     const lights: ReactNode[] = [];
     let n = 0;
     tiers.forEach(([ay, by, hw], t) => {
       for (let i = 0; i < 7; i++) {
         const y = ay + 4 + rnd(t * 20 + i) * (by - ay - 6);
         const span = (hw * (y - ay)) / (by - ay);
         const x = 50 + (rnd(t * 20 + i + 70) - 0.5) * 2 * span * 0.85;
         const col = ["#ff4a4a", "#ffd23f", "#ffffff", "#4ad0ff"][n % 4];
         lights.push(
           <g key={n}>
             <Glow x={x} y={y} r={2} c={col} o={0.7} b={2} />
             <circle cx={x} cy={y} r=".8" fill={col} />
           </g>,
         );
         n++;
       }
     });
     return (
       <Scene>
         <defs>
           <LG id="evp-xm-bg" s={[[0, "#0e3a2c"], [1, "#04150f"]]} />
           <LG id="evp-xm-floor" s={[[0, "#2a1a10"], [1, "#0a0604"]]} />
           <LG id="evp-xm-tree" x2={1} y2={0} s={[[0, "#2aa55a"], [0.5, "#16703a"], [1, "#0a3a1e"]]} />
           <LG id="evp-xm-gold" s={[[0, "#fff0b8"], [1, "#c9962a"]]} />
         </defs>
         <rect width="100" height="125" fill="url(#evp-xm-bg)" />
         <Glow x={50} y={40} r={30} c="#ffcf6a" o={0.14} />
         <Bokeh
           dots={[
             [14, 30, 7, "#ff4a4a", 0.3],
             [86, 28, 8, "#ffd23f", 0.3],
             [20, 56, 5, "#ffd23f", 0.25],
             [82, 56, 6, "#ff4a4a", 0.25],
             [70, 14, 4, "#ffffff", 0.2],
             [30, 14, 4, "#4ad0ff", 0.25],
           ]}
         />
         <rect y="66" width="100" height="60" fill="url(#evp-xm-floor)" />
         <rect y="66" width="100" height=".4" fill="#ffcf9a" fillOpacity=".25" />
         <Shadow x={50} y={67.4} rx={30} ry={2.4} o={0.7} />
         <rect x="47.6" y="60" width="4.8" height="7" fill="#4a2a14" />
         {tiers.map(([ay, by, hw]) => (
           <polygon key={ay} points={`50,${ay} ${50 + hw},${by} ${50 - hw},${by}`} fill="url(#evp-xm-tree)" />
         ))}
         <g fill="none" stroke="#ffd27a" strokeOpacity=".7" strokeWidth=".5" strokeLinecap="round">
           <path d="M40,34 Q50,38 60,34" />
           <path d="M34,46 Q50,52 66,46" />
           <path d="M28,60 Q50,68 72,60" />
         </g>
         {lights}
         <Glow x={50} y={16} r={7} c="#ffd23f" o={0.7} b={4} />
         <polygon points={star(50, 16, 5.2, 2.2)} fill="url(#evp-xm-gold)" />
         {/* gifts */}
         <rect x="20" y="52" width="16" height="14" rx=".6" fill="#c8283a" />
         <rect x="26.6" y="52" width="2.8" height="14" fill="#ffd27a" />
         <rect x="20" y="57" width="16" height="2.4" fill="#ffd27a" />
         <path d="M28,52 q-4,-4 -2,-5 q3,0 2,5 M28,52 q4,-4 2,-5 q-3,0 -2,5" fill="#ffd27a" />
         <rect x="64" y="56" width="16" height="10" rx=".6" fill="#e8b84a" />
         <rect x="70.6" y="56" width="2.8" height="10" fill="#1d7a44" />
         <path d="M72,56 q-4,-4 -2,-5 q3,0 2,5 M72,56 q4,-4 2,-5 q-3,0 -2,5" fill="#1d7a44" />
         <rect x="38" y="60" width="9" height="6" rx=".5" fill="#f4efe4" />
         <rect x="41.6" y="60" width="1.8" height="6" fill="#c8283a" />
       </Scene>
     );
   };
   export const ChristmasParty = (c: Ctx) => TiltedTitle(c, <ChristmasArt />);
   
   /* ---- Pool party: seen from above ---- */
   const PoolArt = () => (
     <Scene vig={0.5}>
       <defs>
         <LG id="evp-pl-water" s={[[0, "#3ccbe4"], [0.6, "#1796c0"], [1, "#0a5a86"]]} />
         <LG id="evp-pl-deck" s={[[0, "#f6eedc"], [1, "#d9ccb0"]]} />
         <RG id="evp-pl-ring" cx={0.4} cy={0.35} r={0.8} s={[[0, "#ffa8be"], [0.55, "#ff6a8a"], [1, "#c02a58"]]} />
         <RG id="evp-pl-ball" cx={0.35} cy={0.3} s={[[0, "#fff6b8"], [1, "#e8a21a"]]} />
       </defs>
       <rect width="100" height="125" fill="url(#evp-pl-water)" />
       <g fill="none" stroke="#fff" strokeOpacity=".26" strokeWidth=".7" strokeLinecap="round" filter="url(#evp-b05)">
         <path d="M-4,34 q10,-6 20,0 t20,0 t20,0 t20,0 t20,0" />
         <path d="M-4,52 q10,-6 20,0 t20,0 t20,0 t20,0 t20,0" />
         <path d="M-4,70 q10,-6 20,0 t20,0 t20,0 t20,0 t20,0" />
         <path d="M6,44 q8,-5 16,0 t16,0 t16,0 t16,0 t16,0" />
         <path d="M6,62 q8,-5 16,0 t16,0 t16,0 t16,0 t16,0" />
       </g>
       <Glow x={20} y={30} r={10} c="#ffffff" o={0.3} b={4} />
       <Glow x={80} y={56} r={9} c="#ffffff" o={0.22} b={4} />
       {/* deck */}
       <rect y="0" width="100" height="21" fill="url(#evp-pl-deck)" />
       <path d="M0,21 H100" stroke="#fff" strokeWidth=".8" />
       <path d="M0,12.5 H100 M20,0 V21 M40,0 V21 M60,0 V21 M80,0 V21" stroke="#b9a888" strokeOpacity=".5" strokeWidth=".3" />
       <rect y="21" width="100" height="3" fill="#000" fillOpacity=".18" filter="url(#evp-b1)" />
       {/* ring float */}
       <circle cx="53" cy="49" r="16" fill="#000" fillOpacity=".25" filter="url(#evp-b2)" />
       <circle cx="50" cy="44" r="16" fill="url(#evp-pl-ring)" />
       <circle cx="50" cy="44" r="6.4" fill="#1796c0" />
       <circle cx="50" cy="44" r="6.4" fill="none" stroke="#7a1030" strokeOpacity=".5" strokeWidth="1" />
       <circle cx="50" cy="44" r="11.2" fill="none" stroke="#fff" strokeOpacity=".85" strokeWidth="1.6" strokeDasharray="3 5.6" />
       <ellipse cx="42" cy="34" rx="5.4" ry="1.8" fill="#fff" fillOpacity=".55" transform="rotate(-38 42 34)" />
       {/* ball */}
       <circle cx="83" cy="62" r="5" fill="#000" fillOpacity=".2" filter="url(#evp-b1)" transform="translate(1.4 2)" />
       <circle cx="82" cy="60" r="5" fill="url(#evp-pl-ball)" />
       <path d="M77.4,58 Q82,62 86.4,58" fill="none" stroke="#fff" strokeOpacity=".7" strokeWidth=".6" />
     </Scene>
   );
   export const PoolParty = (c: Ctx) => TiltedTitle(c, <PoolArt />);
   
   /* ---- Suya night ---- */
   const Skewer = ({ y, s = 1, o = 1 }: { y: number; s?: number; o?: number }) => (
     <g opacity={o}>
       <line x1="8" y1={y} x2="92" y2={y} stroke="#c9a46a" strokeWidth=".9" strokeLinecap="round" />
       {[22, 31, 40, 49, 58, 67, 76].map((x, i) => (
         <g key={x}>
           <rect x={x - 4.2 * s} y={y - 3.4 * s} width={8.4 * s} height={6.8 * s} rx={2 * s} fill="url(#evp-sy-meat)" />
           <rect x={x - 3.6 * s} y={y - 3 * s} width={2.4 * s} height={1.2 * s} rx=".6" fill="#fff" fillOpacity=".18" />
           <circle cx={x + 1 * s} cy={y + 1 * s} r=".8" fill="#1a0a04" fillOpacity=".6" />
           <circle cx={x - 2 * s} cy={y + 1.6 * s} r=".6" fill="#1a0a04" fillOpacity=".5" />
           {[0, 1, 2, 3].map((k) => (
             <circle key={k} cx={x - 3 * s + rnd(i * 9 + k) * 6 * s} cy={y - 2.4 * s + rnd(i * 9 + k + 30) * 5 * s} r=".45" fill="#ff8a2a" fillOpacity=".9" />
           ))}
         </g>
       ))}
     </g>
   );
   
   const SuyaArt = () => (
     <Scene>
       <defs>
         <LG id="evp-sy-bg" s={[[0, "#2a140a"], [1, "#0a0503"]]} />
         <LG id="evp-sy-box" s={[[0, "#2e2e34"], [1, "#0c0c10"]]} />
         <LG id="evp-sy-coal" s={[[0, "#ffb347"], [0.5, "#ff5a1a"], [1, "#a8200a"]]} />
         <LG id="evp-sy-meat" s={[[0, "#c0622e"], [1, "#5a2410"]]} />
         <LG id="evp-sy-flame" s={[[0, "#ffe27a"], [0.5, "#ff8a2a"], [1, "#e0301a", 0.2]]} />
       </defs>
       <rect width="100" height="125" fill="url(#evp-sy-bg)" />
       <Glow x={50} y={56} r={34} c="#ff6a1a" o={0.35} />
       <Bokeh
         dots={[
           [14, 28, 7, "#ff8a2a", 0.28],
           [86, 26, 8, "#ffb347", 0.25],
           [20, 50, 4, "#ff6a1a", 0.25],
           [84, 48, 5, "#ff8a2a", 0.22],
         ]}
       />
       <g fill="none" stroke="#fff" strokeOpacity=".12" strokeWidth="3" strokeLinecap="round" filter="url(#evp-b2)">
         <path d="M36,32 C30,26 42,22 36,14" />
         <path d="M62,34 C56,28 68,24 62,16" />
       </g>
       {/* grill */}
       <rect x="10" y="52" width="80" height="14" fill="url(#evp-sy-box)" />
       <rect x="10" y="52" width="80" height="1.4" fill="#5a5a62" />
       <rect x="12" y="54" width="76" height="9" fill="url(#evp-sy-coal)" filter="url(#evp-b1)" />
       <g fill="#ffd27a" fillOpacity=".7">
         {[18, 28, 37, 46, 55, 65, 74, 83].map((x, i) => (
           <circle key={x} cx={x} cy={56 + (i % 3) * 2.4} r=".9" />
         ))}
       </g>
       {/* flames behind skewers */}
       <g filter="url(#evp-b05)">
         {[20, 32, 44, 56, 68, 80].map((x, i) => (
           <path key={x} d={`M${x - 4},53 C${x - 4},46 ${x - 1},44 ${x},38 C${x + 1},44 ${x + 4},46 ${x + 4},53Z`} fill="url(#evp-sy-flame)" opacity={0.9 - (i % 2) * 0.2} />
         ))}
       </g>
       <Skewer y={39} s={0.88} o={0.9} />
       <Skewer y={47} />
       <g fill="#ffb347">
         {[[16, 30, 0.6], [44, 24, 0.5], [70, 28, 0.6], [86, 36, 0.5], [30, 40, 0.4], [58, 18, 0.5]].map(([x, y, r], i) => (
           <circle key={i} cx={x} cy={y} r={r} fillOpacity=".9" />
         ))}
       </g>
     </Scene>
   );
   export const SuyaNight = (c: Ctx) => TiltedTitle(c, <SuyaArt />);
   
   /* ---- Movie night ---- */
   const popcorn = Array.from({ length: 26 }, (_, i) => ({
     x: 37 + rnd(i) * 26,
     y: 28 + rnd(i + 60) * 14,
     r: 3 + rnd(i + 90) * 1.8,
   })).sort((a, b) => a.y - b.y);
   
   const MovieArt = () => (
     <Scene>
       <defs>
         <LG id="evp-mv-bg" s={[[0, "#0f1a3a"], [1, "#05070f"]]} />
         <LG id="evp-mv-seat" s={[[0, "#5a1620"], [1, "#1a0508"]]} />
         <RG id="evp-mv-pop" cx={0.4} cy={0.35} s={[[0, "#fffbe8"], [0.7, "#f6e2a4"], [1, "#d9a84a"]]} />
         <LG id="evp-mv-shade" x2={1} y2={0} s={[[0, "#000", 0.35], [0.3, "#000", 0], [0.7, "#000", 0], [1, "#000", 0.4]]} />
       </defs>
       <rect width="100" height="125" fill="url(#evp-mv-bg)" />
       <Glow x={50} y={26} r={30} c="#9ac8ff" o={0.22} />
       <path d="M50,0 L8,70 L92,70Z" fill="#cfe4ff" fillOpacity=".1" filter="url(#evp-b2)" />
       <Bokeh
         dots={[
           [14, 36, 6, "#ffd23f", 0.25],
           [86, 34, 7, "#9ac8ff", 0.25],
           [20, 56, 4, "#ffffff", 0.2],
           [82, 54, 5, "#ffd23f", 0.22],
         ]}
       />
       <rect x="0" y="12.5" width="100" height="7" fill="#05070f" />
       {Array.from({ length: 16 }, (_, i) => (
         <rect key={i} x={2 + i * 6.2} y="14.4" width="3" height="3.2" rx=".5" fill="#2a3150" />
       ))}
       <rect y="64" width="100" height="62" fill="url(#evp-mv-seat)" />
       <rect y="64" width="100" height=".4" fill="#ff8a9a" fillOpacity=".3" />
       <Shadow x={50} y={65.6} rx={20} ry={2} o={0.7} />
       {/* bucket */}
       {Array.from({ length: 6 }, (_, i) => {
         const tx = 35 + i * 5;
         const bx = 39 + i * (22 / 6);
         return <polygon key={i} points={`${tx},40 ${tx + 5},40 ${bx + 22 / 6},64 ${bx},64`} fill={i % 2 ? "#f8f2e6" : "#d6232a"} />;
       })}
       <polygon points="35,40 65,40 61,64 39,64" fill="url(#evp-mv-shade)" />
       <rect x="34" y="38.4" width="32" height="2.6" rx="1" fill="#e8e0d0" />
       {/* popcorn */}
       {popcorn.map((p, i) => (
         <circle key={i} cx={p.x} cy={p.y} r={p.r} fill="url(#evp-mv-pop)" />
       ))}
       {popcorn.filter((_, i) => i % 4 === 0).map((p, i) => (
         <circle key={i} cx={p.x + 0.8} cy={p.y + 0.6} r="0.8" fill="#d9a84a" fillOpacity=".8" />
       ))}
     </Scene>
   );
   export const MovieNight = (c: Ctx) => TiltedTitle(c, <MovieArt />);
   
   /* ---- Karaoke night ---- */
   const KaraokeArt = () => (
     <Scene>
       <defs>
         <LG id="evp-kr-bg" s={[[0, "#1a0838"], [1, "#07020f"]]} />
         <LG id="evp-kr-floor" s={[[0, "#24104a"], [1, "#07020f"]]} />
         <LG id="evp-kr-edge" x2={1} y2={0} s={[[0, "#ff4fa0", 0], [0.5, "#ff4fa0", 0.7], [1, "#33d6ff", 0]]} />
         <RG id="evp-kr-head" cx={0.38} cy={0.32} r={0.8} s={[[0, "#f4f4fa"], [1, "#6a6a82"]]} />
         <LG id="evp-kr-body" x2={1} y2={0} s={[[0, "#0a0a10"], [0.35, "#3a3a4c"], [1, "#050508"]]} />
         <clipPath id="evp-kr-c">
           <circle cx="0" cy="-14" r="9" />
         </clipPath>
       </defs>
       <rect width="100" height="125" fill="url(#evp-kr-bg)" />
       <Glow x={50} y={36} r={28} c="#ff4fa0" o={0.2} />
       <circle cx="50" cy="36" r="25" fill="none" stroke="#ff4fa0" strokeWidth="3.4" strokeOpacity=".7" filter="url(#evp-b2)" />
       <circle cx="50" cy="36" r="25" fill="none" stroke="#ffd0e6" strokeWidth=".7" />
       <path d="M50,36 m-31,0 a31,31 0 0 1 40,-29" fill="none" stroke="#33d6ff" strokeWidth="3" strokeOpacity=".6" filter="url(#evp-b2)" />
       <path d="M50,36 m-31,0 a31,31 0 0 1 40,-29" fill="none" stroke="#d0f4ff" strokeWidth=".6" />
       <Bokeh
         dots={[
           [12, 28, 6, "#33d6ff", 0.3],
           [88, 30, 7, "#ff4fa0", 0.3],
           [84, 58, 5, "#ffd23f", 0.28],
           [16, 58, 5, "#ff4fa0", 0.28],
         ]}
       />
       <rect y="66" width="100" height="60" fill="url(#evp-kr-floor)" />
       <rect y="66" width="100" height=".6" fill="url(#evp-kr-edge)" />
       <g transform="translate(50 42) rotate(22)">
         <path d="M-5,-6 L5,-6 L3.6,18 Q0,21 -3.6,18Z" fill="url(#evp-kr-body)" />
         <rect x="-5.6" y="-7.4" width="11.2" height="2.4" rx="1" fill="#c9c9d6" />
         <rect x="-4.4" y="2" width="8.8" height="1.4" fill="#c9c9d6" fillOpacity=".8" />
         <circle cx="0" cy="-14" r="9" fill="url(#evp-kr-head)" />
         <g clipPath="url(#evp-kr-c)" stroke="#2a2a3a" strokeOpacity=".45" strokeWidth=".35" fill="none">
           {[-6, -3, 0, 3, 6].map((d) => (
             <path key={`v${d}`} d={`M${d},-24 V-4`} />
           ))}
           {[-20, -17, -14, -11, -8].map((d) => (
             <path key={`h${d}`} d={`M-10,${d} H10`} />
           ))}
         </g>
         <ellipse cx="-3" cy="-17.6" rx="2.6" ry="1.5" fill="#fff" fillOpacity=".7" transform="rotate(-30 -3 -17.6)" />
       </g>
     </Scene>
   );
   export const KaraokeNight = (c: Ctx) => TiltedTitle(c, <KaraokeArt />);
   
   /* ---- Japa send-off: suitcase + passport ---- */
   const SendoffArt = () => (
     <Scene>
       <defs>
         <LG id="evp-so-sky" s={[[0, "#1e2f66"], [0.3, "#5a5a9a"], [0.46, "#f0a070"], [1, "#f0a070"]]} />
         <LG id="evp-so-floor" s={[[0, "#2a2038"], [1, "#0c0814"]]} />
         <LG id="evp-so-case" x2={1} y2={0} s={[[0, "#2f8f8a"], [0.5, "#3aaaa4"], [1, "#145a58"]]} />
         <LG id="evp-so-pass" s={[[0, "#1f3a7a"], [1, "#0e1f4a"]]} />
         <LG id="evp-so-gold" s={[[0, "#fff0b8"], [1, "#b8902a"]]} />
       </defs>
       <rect width="100" height="125" fill="url(#evp-so-sky)" />
       <Glow x={50} y={56} r={30} c="#ffb98a" o={0.4} />
       <g filter="url(#evp-b2)">
         <ellipse cx="24" cy="38" rx="22" ry="2" fill="#fff" fillOpacity=".3" />
         <ellipse cx="76" cy="46" rx="24" ry="1.8" fill="#ffd9b0" fillOpacity=".4" />
       </g>
       <path d="M16,50 C34,42 52,36 70,29" fill="none" stroke="#fff" strokeOpacity=".5" strokeWidth="1.4" filter="url(#evp-b1)" />
       <path d="M0,-0 L10,-1.6 L12,-6 L14,-6 L12.6,-1.4 L20,-0.6 L20,0.8 L12.6,1.6 L14,6 L12,6 L10,1.4 L0,0.8Z" fill="#fff" fillOpacity=".95" transform="translate(70 26) rotate(-24) scale(.9)" />
       <rect y="64" width="100" height="62" fill="url(#evp-so-floor)" />
       <rect y="64" width="100" height=".4" fill="#ffb98a" fillOpacity=".3" />
       {/* suitcase */}
       <Shadow x={46} y={65.6} rx={26} ry={2.4} o={0.7} />
       <path d="M42,30 V26 Q42,23 45,23 H55 Q58,23 58,26 V30" fill="none" stroke="#1a100a" strokeWidth="1.8" />
       <rect x="26" y="30" width="44" height="34" rx="3.4" fill="url(#evp-so-case)" />
       <rect x="35" y="30" width="2.6" height="34" fill="#0a3a38" fillOpacity=".45" />
       <rect x="58.4" y="30" width="2.6" height="34" fill="#0a3a38" fillOpacity=".45" />
       <rect x="27" y="31" width="42" height="1.4" rx=".7" fill="#fff" fillOpacity=".3" />
       {[[30, 34], [66, 34], [30, 60], [66, 60]].map(([x, y], i) => (
         <circle key={i} cx={x} cy={y} r="1.5" fill="url(#evp-so-gold)" />
       ))}
       <rect x="44.6" y="44" width="6.8" height="3.4" rx=".8" fill="url(#evp-so-gold)" />
       {/* stickers */}
       <g transform="rotate(-8 41 54)">
         <rect x="37" y="51.6" width="9" height="5.6" fill="#fff" />
         <rect x="37" y="51.6" width="3" height="5.6" fill="#008751" />
         <rect x="43" y="51.6" width="3" height="5.6" fill="#008751" />
       </g>
       <circle cx="58" cy="52" r="3" fill="#e84a4a" />
       <polygon points={star(52, 38, 2.6, 1.1)} fill="#ffd23f" />
       {/* passport */}
       <g transform="rotate(9 82 54)">
         <rect x="77" y="44" width="12" height="18" rx="1" fill="#000" fillOpacity=".3" filter="url(#evp-b1)" transform="translate(1 1.4)" />
         <rect x="76" y="43" width="12" height="18" rx="1" fill="url(#evp-so-pass)" />
         <circle cx="82" cy="50" r="2.6" fill="none" stroke="url(#evp-so-gold)" strokeWidth=".6" />
         <path d="M79.6,57 H84.4" stroke="#d4b24a" strokeWidth=".5" />
       </g>
     </Scene>
   );
   export const JapaSendoff = (c: Ctx) => TiltedTitle(c, <SendoffArt />);
   
   /* =====================================================================
      DESIGN DIRECTIONS
      ===================================================================== */
   
   /* ---- Editorial (typographic) ---- */
   export function Editorial(c: Ctx) {
     const { ink } = c.poster;
     return (
       <>
         <Art>
           <rect x="6" y="14" width="88" height="97" fill="none" stroke={ink} strokeWidth=".3" />
           <path d="M6,24 H94 M6,102 H94" stroke={ink} strokeWidth=".3" />
         </Art>
         <Grain o={0.18} />
         <div
           style={{
             ...fill,
             display: "flex",
             flexDirection: "column",
             justifyContent: "space-between",
             alignItems: "center",
             padding: `${cq(8.5)} ${cq(9)}`,
           }}
         >
           <InvitedTag accent={ink} small={c.small} />
           <Title
             c={c}
             mult={1.05}
             style={{
               color: ink,
               textAlign: "center",
               textTransform: "uppercase",
               fontWeight: 900,
               letterSpacing: cq(-0.2),
               transform: "scaleY(1.3)",
             }}
           />
           <Details c={c} align="center" style={{ color: ink }} />
         </div>
       </>
     );
   }
   
   /* ---- Grand affair: gold rings on burgundy ---- */
   const corner = (x: number, y: number, sx: number, sy: number, color: string) => (
     <g key={`${x}-${y}`} transform={`translate(${x} ${y}) scale(${sx} ${sy})`} fill="none" stroke={color} strokeWidth=".45">
       <path d="M0,0 H16 M0,0 V16" />
       <path d="M3,3 H11 M3,3 V11" strokeOpacity=".7" />
       <path d="M6,6 C10,6 11,10 8,11 C5,12 4,8 7,8" strokeOpacity=".9" />
       <circle cx="16" cy="0" r=".9" fill={color} />
       <circle cx="0" cy="16" r=".9" fill={color} />
     </g>
   );
   
   const RingsArt = ({ accent }: { accent: string }) => (
     <Scene vig={0.8}>
       <defs>
         <LG id="evp-ga-gold" s={[[0, "#fff0b8"], [0.4, "#e0b24a"], [1, "#8a5f16"]]} />
         <LG id="evp-ga-gold2" x2={1} y2={1} s={[[0, "#8a5f16"], [0.5, "#f6dc88"], [1, "#8a5f16"]]} />
       </defs>
       <Glow x={50} y={36} r={26} c="#ff6a7a" o={0.16} />
       <Glow x={50} y={36} r={16} c="#f4dfae" o={0.14} b={4} />
       <Bokeh
         dots={[
           [16, 30, 6, "#f4dfae", 0.2],
           [86, 30, 7, "#f4dfae", 0.18],
           [20, 64, 4, "#f4dfae", 0.15],
           [82, 64, 5, "#f4dfae", 0.15],
         ]}
       />
       <rect x="4" y="14" width="92" height="97" fill="none" stroke={accent} strokeWidth=".5" />
       <rect x="6.5" y="16.5" width="87" height="92" fill="none" stroke={accent} strokeWidth=".25" strokeOpacity=".7" />
       {corner(8, 18, 1, 1, accent)}
       {corner(92, 18, -1, 1, accent)}
       {corner(8, 107, 1, -1, accent)}
       {corner(92, 107, -1, -1, accent)}
       {/* rings: shaded band + bright edge */}
       <g fill="none">
         <circle cx="43.5" cy="40" r="10" stroke="#5a3a0c" strokeWidth="3" strokeOpacity=".6" transform="translate(.4 .6)" />
         <circle cx="56.5" cy="40" r="10" stroke="#5a3a0c" strokeWidth="3" strokeOpacity=".6" transform="translate(.4 .6)" />
         <circle cx="43.5" cy="40" r="10" stroke="url(#evp-ga-gold)" strokeWidth="2.4" />
         <circle cx="56.5" cy="40" r="10" stroke="url(#evp-ga-gold2)" strokeWidth="2.4" />
         <path d="M48.2,31.2 A10,10 0 0 1 51.5,34" stroke="url(#evp-ga-gold)" strokeWidth="2.4" />
         <circle cx="43.5" cy="40" r="9.2" stroke="#fff" strokeOpacity=".35" strokeWidth=".3" />
         <circle cx="56.5" cy="40" r="9.2" stroke="#fff" strokeOpacity=".3" strokeWidth=".3" />
       </g>
       {/* stone */}
       <Glow x={56.5} y={29.6} r={4} c="#ffffff" o={0.6} b={2} />
       <path d="M53.6,29 L55,26.6 H58 L59.4,29 L56.5,34.4Z" fill="#bfe0ff" />
       <path d="M53.6,29 H59.4 L56.5,34.4Z" fill="#8fb8e0" />
       <path d="M53.6,29 L55,26.6 H58 L59.4,29Z" fill="#ffffff" fillOpacity=".85" />
       <path d="M56.5,29 L56.5,34.4 M55,26.6 L56.5,29 L58,26.6" stroke="#5a7aa0" strokeOpacity=".5" strokeWidth=".25" />
       <Sparkle x={61} y={25} s={2.2} fill="#ffffff" />
       <Sprig x={22} y={74} rot={-12} s={0.6} color={accent} />
       <Sprig x={78} y={74} rot={12} s={0.6} color={accent} flip />
     </Scene>
   );
   export function GrandAffair(c: Ctx) {
     const { accent, ink } = c.poster;
     return (
       <>
         <Art>
           <RingsArt accent={accent} />
         </Art>
         <Grain o={0.12} />
         <Stack justify="center" align="center" padY={14} padX={14} gap={3}>
           <div style={{ height: cq(18) }} />
           <InvitedTag accent={accent} small={c.small} />
           <Title c={c} mult={0.82} style={{ color: ink, textAlign: "center", textTransform: "uppercase", letterSpacing: cq(0.9), fontWeight: 500 }} />
           <Details c={c} align="center" style={{ color: ink }} />
         </Stack>
       </>
     );
   }
   
   /* ---- Birthday energy: glossy balloons ---- */
   const BirthdayArt = () => (
     <Scene vig={0.25}>
       <defs>
         <LG id="evp-be-bg" s={[[0, "#fffaf0"], [1, "#ffeccc"]]} />
       </defs>
       <rect width="100" height="125" fill="url(#evp-be-bg)" />
       <path d="M0,12 H42 L0,46Z" fill="#00b8f0" />
       <path d="M100,12 V42 L72,12Z" fill="#ff2d8a" />
       <path d="M0,125 V104 L100,88 V125Z" fill="#ffd23f" />
       <path d="M0,125 V114 L100,100 V108 L0,125Z" fill="#ff2d8a" fillOpacity=".9" />
       {[[30, 22, 20, "#ff2d8a"], [48, 18, 70, "#00b8f0"], [12, 52, 40, "#ffd23f"], [20, 74, 10, "#00b8f0"]].map(([x, y, r, col], i) => (
         <path key={i} d="M0,-2.6 L2.4,1.8 L-2.4,1.8Z" transform={`translate(${x} ${y}) rotate(${r})`} fill={String(col)} />
       ))}
       <Shadow x={78} y={74} rx={20} ry={2} o={0.12} />
       <Gloss x={72} y={36} c="#ff2d8a" s={1.55} />
       <Gloss x={56} y={32} c="#ffb800" s={1.15} />
       <Gloss x={89} y={48} c="#00b8f0" s={1.2} />
     </Scene>
   );
   export function BirthdayEnergy(c: Ctx) {
     const { accent } = c.poster;
     return (
       <>
         <Art>
           <BirthdayArt />
         </Art>
         <Stack justify="center" align="flex-start" padY={8} gap={2}>
           <InvitedTag accent="#1a1a2e" small={c.small} />
           <div style={{ transform: "rotate(-6deg)", maxWidth: "100%" }}>
             <Title
               c={c}
               mult={1.1}
               style={{
                 color: accent,
                 textTransform: "uppercase",
                 fontWeight: 900,
                 fontStyle: "italic",
                 WebkitTextStroke: `${cq(0.7)} #ff2d8a`,
                 paintOrder: "stroke fill",
                 textShadow: `${cq(0.8)} ${cq(0.8)} 0 #ff2d8a, ${cq(1.4)} ${cq(1.4)} 0 #00b8f0`,
               } as CSSProperties}
             />
           </div>
         </Stack>
         <div style={{ position: "absolute", left: cq(8), bottom: cq(6) }}>
           <Details c={c} style={{ color: "#1a1a2e" }} />
         </div>
       </>
     );
   }
   
   /* ---- Aso oke heritage ---- */
   export function AsoOkeHeritage(c: Ctx) {
     const { ink, accent } = c.poster;
     return (
       <>
         <Art>
           <defs>
             <pattern id="evp-weave" width="10" height="10" patternUnits="userSpaceOnUse">
               <rect width="10" height="10" fill="#1c1a4a" />
               <rect width="10" height="3" fill="#c2531b" />
               <rect y="4" width="10" height=".8" fill="#f6d56a" />
               <path d="M0,7 L2.5,5.5 L5,7 L7.5,5.5 L10,7 V10 H0Z" fill="#f4e6c4" fillOpacity=".85" />
             </pattern>
           </defs>
           <rect x="5" y="15" width="90" height="95" fill="url(#evp-weave)" />
           <rect x="5" y="15" width="90" height="95" fill="none" stroke="#f6d56a" strokeWidth=".6" />
           <Sparkle x={14} y={23} s={2.6} fill="#f6d56a" />
           <Sparkle x={86} y={102} s={2.6} fill="#f6d56a" />
         </Art>
         <Stack justify="center" align="center" padX={15} padY={16}>
           <div
             style={{
               background: "#fbf1d9",
               padding: `${cq(6)} ${cq(5)}`,
               width: "100%",
               display: "flex",
               flexDirection: "column",
               alignItems: "center",
               gap: cq(2.2),
               boxShadow: `0 0 0 ${cq(0.9)} #fbf1d9, 0 0 0 ${cq(1.4)} #c98a1f`,
             }}
           >
             <InvitedTag accent={accent} small={c.small} />
             <Title c={c} mult={0.85} style={{ color: ink, textAlign: "center", textTransform: "uppercase", fontWeight: 800 }} />
             <div style={{ width: cq(12), height: 1, background: accent }} />
             <Details c={c} align="center" style={{ color: ink }} />
           </div>
         </Stack>
       </>
     );
   }
   
   /* ---- Garden table: a place setting from above ---- */
   const GardenTableArt = () => {
     const leaves: [number, number, number, string][] = [
       [-5, -3, 20, "#7a9a52"],
       [4, -4, -30, "#9ab66e"],
       [-2, 3, 70, "#8aa65e"],
       [6, 2, -60, "#6e8a4a"],
       [-7, 3, -20, "#9ab66e"],
       [1, 0, 100, "#7a9a52"],
     ];
     const cutlery = (dx: number, dy: number, col: string, hi: string) => (
       <g transform={`translate(${dx} ${dy})`}>
         <path d="M24,22 V31 Q24,35 26.4,35 Q28.8,35 28.8,31 V22" fill="none" stroke={col} strokeWidth=".9" strokeLinecap="round" />
         <path d="M26.4,35 V60" stroke={col} strokeWidth="1.7" strokeLinecap="round" />
         <path d="M74.6,22 C79,28 79,42 75,52 H73 V22Z" fill={col} />
         <path d="M74,52 V61" stroke={col} strokeWidth="1.8" strokeLinecap="round" />
         <path d="M25.6,36 V58" stroke={hi} strokeWidth=".35" strokeLinecap="round" strokeOpacity=".9" />
         <path d="M73.8,24 V50" stroke={hi} strokeWidth=".35" strokeOpacity=".9" />
       </g>
     );
     return (
       <Scene vig={0.4}>
         <defs>
           <LG id="evp-gt-linen" s={[[0, "#f8efdc"], [1, "#e9dcc0"]]} />
           <pattern id="evp-gt-weave" width="1.4" height="1.4" patternUnits="userSpaceOnUse">
             <path d="M0,0.7 H1.4 M0.7,0 V1.4" stroke="#8a7a5a" strokeOpacity=".1" strokeWidth=".2" />
           </pattern>
           <RG id="evp-gt-plate" cx={0.45} cy={0.4} r={0.7} s={[[0, "#ffffff"], [0.85, "#f1ebe0"], [1, "#d9cfbb"]]} />
           <RG id="evp-gt-well" s={[[0, "#fbf7ee"], [1, "#e6dfd0"]]} />
           <RG id="evp-gt-wine" cx={0.4} cy={0.35} s={[[0, "#b13a52"], [1, "#5a1022"]]} />
           <LG id="evp-gt-napkin" x2={1} y2={0} s={[[0, "#c9d3b4"], [0.5, "#dde5c9"], [1, "#b4c09c"]]} />
         </defs>
         <rect width="100" height="125" fill="url(#evp-gt-linen)" />
         <rect width="100" height="125" fill="url(#evp-gt-weave)" />
         {/* napkin */}
         <g transform="rotate(-6 26 46)">
           <rect x="14.5" y="29" width="24" height="36" rx="1" fill="#000" fillOpacity=".12" filter="url(#evp-b1)" transform="translate(1 1.4)" />
           <rect x="14" y="28" width="24" height="36" rx="1" fill="url(#evp-gt-napkin)" />
           <rect x="14" y="36" width="24" height="1" fill="#000" fillOpacity=".08" />
         </g>
         {/* cutlery with soft shadows */}
         <g filter="url(#evp-b05)" opacity=".28">
           {cutlery(1.2, 1.4, "#000", "#000")}
         </g>
         {cutlery(0, 0, "#cfcfc7", "#ffffff")}
         {/* plate */}
         <circle cx="52.5" cy="45" r="21" fill="#000" fillOpacity=".2" filter="url(#evp-b2)" />
         <circle cx="50" cy="42" r="21" fill="url(#evp-gt-plate)" />
         <circle cx="50" cy="42" r="13" fill="url(#evp-gt-well)" />
         <circle cx="50" cy="42" r="13" fill="none" stroke="#b9ad96" strokeOpacity=".5" strokeWidth=".3" />
         {leaves.map(([x, y, r, col], i) => (
           <ellipse key={i} cx={50 + x} cy={42 + y} rx="4.2" ry="1.7" fill={col} transform={`rotate(${r} ${50 + x} ${42 + y})`} />
         ))}
         {[[47, 40, 1.8], [54, 44, 1.6], [51, 47, 1.4]].map(([x, y, r], i) => (
           <g key={i}>
             <circle cx={x} cy={y} r={r} fill="#d9442f" />
             <circle cx={x - r * 0.35} cy={y - r * 0.35} r={r * 0.3} fill="#fff" fillOpacity=".6" />
           </g>
         ))}
         {/* wine glass from above */}
         <circle cx="87.4" cy="31.4" r="5.8" fill="#000" fillOpacity=".18" filter="url(#evp-b1)" />
         <circle cx="86" cy="30" r="6.4" fill="#fff" fillOpacity=".5" stroke="#b9ad96" strokeOpacity=".7" strokeWidth=".4" />
         <circle cx="86" cy="30" r="4" fill="url(#evp-gt-wine)" />
         <path d="M83.2,28 q1.8,-1.8 3.6,-1" fill="none" stroke="#fff" strokeOpacity=".7" strokeWidth=".6" strokeLinecap="round" />
         {/* foliage + flowers, each with a drop shadow */}
         <g transform="translate(1.4 1.6)" opacity=".22" filter="url(#evp-b1)">
           <Sprig x={10} y={112} rot={16} s={1.2} color="#000" />
           <Sprig x={90} y={112} rot={-16} s={1.2} color="#000" flip />
         </g>
         <Sprig x={10} y={112} rot={16} s={1.2} color="#6e8a4a" />
         <Sprig x={90} y={112} rot={-16} s={1.2} color="#6e8a4a" flip />
         {[[18, 20, "#f6a3bd"], [84, 62, "#ffd36a"], [14, 60, "#ffd36a"], [64, 18, "#f6a3bd"]].map(([x, y, col], i) => (
           <g key={i} transform={`translate(${x} ${y})`}>
             <g transform="translate(.8 1)" opacity=".25" filter="url(#evp-b05)">
               {[0, 72, 144, 216, 288].map((r) => (
                 <ellipse key={r} cx="0" cy="-2.6" rx="1.6" ry="2.6" fill="#000" transform={`rotate(${r})`} />
               ))}
             </g>
             {[0, 72, 144, 216, 288].map((r) => (
               <ellipse key={r} cx="0" cy="-2.6" rx="1.6" ry="2.6" fill={String(col)} transform={`rotate(${r})`} />
             ))}
             <circle r="1.2" fill="#fff0b8" />
           </g>
         ))}
       </Scene>
     );
   };
   export function GardenNote(c: Ctx) {
     const { ink, accent } = c.poster;
     return (
       <>
         <Art>
           <GardenTableArt />
         </Art>
         <Grain o={0.14} />
         <Stack justify="flex-end" align="center" padY={9} padX={12} gap={2.4}>
           <InvitedTag accent={accent} small={c.small} />
           <Title c={c} mult={0.95} style={{ color: ink, textAlign: "center", fontWeight: 300, letterSpacing: cq(0.3) }} />
           <div style={{ width: cq(10), height: 1, background: accent }} />
           <Details c={c} align="center" style={{ color: ink }} />
         </Stack>
       </>
     );
   }
   
   /* ---- Brutalist ---- */
   export function Brutalist(c: Ctx) {
     const { accent } = c.poster;
     return (
       <>
         <Art>
           <g stroke="#ffffff" strokeOpacity=".28" strokeWidth=".25">
             <path d="M0,18 H100 M0,62 H100 M0,106 H100" />
             <path d="M34,0 V125 M68,0 V125" />
           </g>
           <rect x="68" y="0" width="32" height="18" fill={accent} />
           <rect x="0" y="106" width="34" height="19" fill="#ffffff" />
           <path d="M0,62 H34 V80 H0Z" fill="#ffffff" fillOpacity=".12" />
         </Art>
         <Grain o={0.2} />
         <div style={{ ...fill, display: "flex", flexDirection: "column", justifyContent: "space-between", padding: cq(4) }}>
           <div style={{ height: cq(10), display: "flex", justifyContent: "flex-end", alignItems: "center", paddingRight: cq(2) }}>
             <InvitedTag accent="#0d0d0d" small={c.small} />
           </div>
           <Title
             c={c}
             mult={1.02}
             style={{
               color: "#fff",
               textTransform: "uppercase",
               fontWeight: 900,
               lineHeight: 0.88,
               letterSpacing: cq(-0.2),
               transform: "scaleY(1.2)",
               transformOrigin: "left center",
             }}
           />
           <Details c={c} style={{ color: "#fff", paddingLeft: cq(36), paddingBottom: cq(1) }} />
         </div>
       </>
     );
   }
   
   /* ---- Little moments: teddy bear ---- */
   const TeddyArt = () => (
     <Scene vig={0.3}>
       <defs>
         <LG id="evp-tb-bg" s={[[0, "#fde7d6"], [1, "#f4c8ae"]]} />
         <LG id="evp-tb-blanket" s={[[0, "#fff5e8"], [1, "#f0d6bd"]]} />
         <RG id="evp-tb-fur" cx={0.4} cy={0.3} r={0.8} s={[[0, "#e2ac78"], [0.6, "#c98b5a"], [1, "#9a6234"]]} />
         <RG id="evp-tb-snout" cx={0.45} cy={0.35} r={0.7} s={[[0, "#fbe6c8"], [1, "#e4be94"]]} />
         <LG id="evp-tb-bow" s={[[0, "#ffb3c4"], [1, "#e0607f"]]} />
       </defs>
       <rect width="100" height="125" fill="url(#evp-tb-bg)" />
       <Bokeh
         dots={[
           [18, 28, 9, "#ffffff", 0.6],
           [84, 22, 11, "#ffffff", 0.5],
           [72, 54, 6, "#cfe9f6", 0.6],
           [26, 52, 5, "#ffffff", 0.5],
           [92, 50, 6, "#ffe9a8", 0.5],
         ]}
       />
       <rect y="64" width="100" height="62" fill="url(#evp-tb-blanket)" />
       <rect y="64" width="100" height=".4" fill="#fff" fillOpacity=".7" />
       <path d="M0,76 H100 M0,92 H100 M0,108 H100" stroke="#d9b896" strokeOpacity=".35" strokeWidth=".3" strokeDasharray="1.6 1.6" />
       {/* balloons held in the right paw */}
       <path d="M70,40 L64,54 M62,34 L64,54" stroke="#fff" strokeOpacity=".7" strokeWidth=".25" />
       <Gloss x={70} y={26} c="#9ccfe8" s={1} />
       <Gloss x={60} y={22} c="#f2a7a0" s={0.82} />
       {/* bear */}
       <Shadow x={50} y={69} rx={24} ry={3.2} o={0.22} />
       <ellipse cx="42" cy="67.6" rx="6.2" ry="3.8" fill="#a8683a" />
       <ellipse cx="58" cy="67.6" rx="6.2" ry="3.8" fill="#a8683a" />
       <ellipse cx="42" cy="68" rx="3.2" ry="2" fill="#e4be94" />
       <ellipse cx="58" cy="68" rx="3.2" ry="2" fill="#e4be94" />
       <ellipse cx="50" cy="58" rx="13.6" ry="11.6" fill="url(#evp-tb-fur)" />
       <ellipse cx="50" cy="60" rx="8" ry="7" fill="url(#evp-tb-snout)" />
       <ellipse cx="36.5" cy="55" rx="4.4" ry="7" fill="url(#evp-tb-fur)" transform="rotate(24 36.5 55)" />
       <ellipse cx="63.5" cy="52" rx="4.4" ry="7" fill="url(#evp-tb-fur)" transform="rotate(-30 63.5 52)" />
       <circle cx="38.6" cy="23" r="5" fill="url(#evp-tb-fur)" />
       <circle cx="61.4" cy="23" r="5" fill="url(#evp-tb-fur)" />
       <circle cx="38.6" cy="23.4" r="2.6" fill="#e9a384" />
       <circle cx="61.4" cy="23.4" r="2.6" fill="#e9a384" />
       <circle cx="50" cy="34" r="13.4" fill="url(#evp-tb-fur)" />
       <ellipse cx="50" cy="38.4" rx="6.2" ry="4.8" fill="url(#evp-tb-snout)" />
       <ellipse cx="50" cy="36.2" rx="2.1" ry="1.5" fill="#3a2316" />
       <ellipse cx="49.4" cy="35.7" rx=".7" ry=".4" fill="#fff" fillOpacity=".7" />
       <path d="M50,37.6 V39.4 M47.6,40 Q50,42 52.4,40" fill="none" stroke="#3a2316" strokeWidth=".7" strokeLinecap="round" />
       <circle cx="44" cy="31.4" r="1.5" fill="#2a1810" />
       <circle cx="56" cy="31.4" r="1.5" fill="#2a1810" />
       <circle cx="43.5" cy="30.9" r=".5" fill="#fff" />
       <circle cx="55.5" cy="30.9" r=".5" fill="#fff" />
       <circle cx="42" cy="36.4" r="2" fill="#f2a7a0" fillOpacity=".55" />
       <circle cx="58" cy="36.4" r="2" fill="#f2a7a0" fillOpacity=".55" />
       <path d="M50,47.4 L43.4,44.2 V50.6Z M50,47.4 L56.6,44.2 V50.6Z" fill="url(#evp-tb-bow)" />
       <circle cx="50" cy="47.4" r="1.7" fill="#e0607f" />
     </Scene>
   );
   export function LittleMoments(c: Ctx) {
     const { ink, accent } = c.poster;
     return (
       <>
         <Art>
           <TeddyArt />
         </Art>
         <Grain o={0.1} />
         <Stack justify="flex-end" align="center" padY={8} gap={2.4}>
           <InvitedTag accent={ink} small={c.small} />
           <Title c={c} mult={0.95} style={{ color: ink, textAlign: "center", textTransform: "uppercase", fontWeight: 900, textShadow: `${cq(0.5)} ${cq(0.5)} 0 #ffffff` }} />
           <div style={{ background: accent, borderRadius: cq(3), padding: `${cq(1.4)} ${cq(4)}` }}>
             <Details c={c} align="center" style={{ color: ink }} />
           </div>
         </Stack>
       </>
     );
   }
   
   /* ---- After hours: disco ball ---- */
   const DiscoTiles = () => {
     const tiles: ReactNode[] = [];
     let n = 0;
     for (let x = 31; x < 69; x += 2.7) {
       for (let y = 17; y < 55; y += 2.7) {
         const d = Math.hypot(x + 1.2 - 50, y + 1.2 - 36);
         if (d > 18.6) continue;
         const hl = Math.max(0, Math.min(1, 1 - Math.hypot(x - 43, y - 28) / 30));
         const t = Math.max(0, Math.min(1, hl * 0.9 + (rnd(n) - 0.5) * 0.5));
         const r2 = rnd(n + 400);
         const col = r2 > 0.95 ? "#5ee0ff" : r2 > 0.9 ? "#ff7ac8" : mix("#34344c", "#f2f2ff", t);
         tiles.push(<rect key={n} x={x} y={y} width="2.4" height="2.4" fill={col} />);
         n++;
       }
     }
     return <>{tiles}</>;
   };
   
   const DiscoArt = () => (
     <Scene>
       <defs>
         <LG id="evp-ah-bg" s={[[0, "#14052e"], [0.5, "#3a0f6a"], [1, "#0a0314"]]} />
         <clipPath id="evp-ah-c">
           <circle cx="50" cy="36" r="18.4" />
         </clipPath>
         <RG id="evp-ah-shade" cx={0.35} cy={0.3} r={0.8} s={[[0, "#fff", 0.35], [0.5, "#fff", 0], [1, "#000", 0.6]]} />
         <LG id="evp-ah-beamw" x1={50} y1={36} x2={50} y2={118} u="userSpaceOnUse" s={[[0, "#ffffff", 0.3], [1, "#ffffff", 0]]} />
         <LG id="evp-ah-beamp" x1={50} y1={36} x2={50} y2={118} u="userSpaceOnUse" s={[[0, "#ff5ac8", 0.35], [1, "#ff5ac8", 0]]} />
         <LG id="evp-ah-beamc" x1={50} y1={36} x2={50} y2={118} u="userSpaceOnUse" s={[[0, "#5ee0ff", 0.3], [1, "#5ee0ff", 0]]} />
       </defs>
       <rect width="100" height="125" fill="url(#evp-ah-bg)" />
       <Glow x={50} y={36} r={30} c="#c04aff" o={0.3} />
       <Bokeh
         dots={[
           [14, 30, 8, "#ff5ac8", 0.35],
           [86, 28, 9, "#5ee0ff", 0.3],
           [78, 60, 6, "#ff9a3c", 0.3],
           [22, 62, 5, "#5ee0ff", 0.3],
         ]}
       />
       <g filter="url(#evp-b1)">
         <path d="M50,36 L-8,112 L30,118Z" fill="url(#evp-ah-beamp)" />
         <path d="M50,36 L38,118 L72,118Z" fill="url(#evp-ah-beamw)" />
         <path d="M50,36 L108,102 L100,118Z" fill="url(#evp-ah-beamc)" />
       </g>
       <g filter="url(#evp-b1)" fillOpacity=".5">
         <rect x="8" y="76" width="7" height="7" fill="#ff5ac8" transform="rotate(12 11 80)" />
         <rect x="84" y="86" width="8" height="8" fill="#5ee0ff" transform="rotate(-10 88 90)" />
         <rect x="46" y="96" width="6" height="6" fill="#ffffff" transform="rotate(20 49 99)" />
       </g>
       <path d="M50,12 V17" stroke="#fff" strokeOpacity=".7" strokeWidth=".6" />
       <rect x="48.4" y="15" width="3.2" height="2.4" rx=".6" fill="#8a8aa0" />
       <circle cx="50" cy="36" r="18.8" fill="#12121c" />
       <g clipPath="url(#evp-ah-c)">
         <DiscoTiles />
       </g>
       <circle cx="50" cy="36" r="18.4" fill="url(#evp-ah-shade)" />
       <ellipse cx="43" cy="28" rx="3" ry="1.8" fill="#fff" fillOpacity=".5" transform="rotate(-30 43 28)" />
     </Scene>
   );
   export function AfterHours(c: Ctx) {
     return (
       <>
         <Art>
           <DiscoArt />
         </Art>
         <Grain o={0.22} />
         <Stack justify="flex-end" align="flex-start" padY={8} gap={2}>
           <div style={{ background: "#0a0a12", padding: `${cq(0.8)} ${cq(2)}` }}>
             <InvitedTag accent="#fff" small={c.small} />
           </div>
           <div style={{ background: "#0a0a12", padding: `${cq(2)} ${cq(3)}`, maxWidth: "100%" }}>
             <Title c={c} mult={1} style={{ color: "#fff", textTransform: "uppercase", fontWeight: 900, fontStyle: "italic", letterSpacing: cq(-0.2) }} />
           </div>
           <div style={{ background: "#0a0a12", padding: `${cq(1.4)} ${cq(2.4)}` }}>
             <Details c={c} style={{ color: "#fff" }} />
           </div>
         </Stack>
       </>
     );
   }
   
   /* ---------- fallback ---------- */
   
   export function Plain(c: Ctx) {
     const { ink, accent } = c.poster;
     return (
       <>
         <Art>
           <circle cx="86" cy="26" r="20" fill={accent} fillOpacity=".25" />
           <circle cx="10" cy="104" r="26" fill={accent} fillOpacity=".2" />
         </Art>
         <Stack justify="flex-end" align="flex-start" padY={8} gap={2}>
           <InvitedTag accent={accent} small={c.small} />
           <Title c={c} style={{ color: ink }} />
           <Details c={c} style={{ color: ink }} />
         </Stack>
       </>
     );
   }
   
   export const DESIGNS: Record<string, (c: Ctx) => ReactNode> = {
     "template-chika-poster": ChikaCard,
     "template-owambe-poster": OwambeNights,
     "template-brunch-poster": SundayBrunch,
     "template-era-poster": EndOfAnEra,
     "template-sundown-poster": RooftopSundown,
     "template-oktoberfest-poster": Oktoberfest,
     "template-ramen-poster": RamenNight,
     "template-halloween-poster": PumpkinParty,
     "template-beach-poster": BeachDay,
     "template-housewarming-poster": Housewarming,
     "template-gathering-poster": SmallGathering,
     "template-graduation-poster": GraduationDay,
     "template-christmas-poster": ChristmasParty,
     "template-pool-poster": PoolParty,
     "template-suya-poster": SuyaNight,
     "template-movie-poster": MovieNight,
     "template-karaoke-poster": KaraokeNight,
     "template-sendoff-poster": JapaSendoff,
     "ref-editorial": Editorial,
     "ref-grand-affair": GrandAffair,
     "ref-birthday-energy": BirthdayEnergy,
     "ref-aso-oke": AsoOkeHeritage,
     "ref-garden-note": GardenNote,
     "ref-brutalist": Brutalist,
     "ref-little-moments": LittleMoments,
     "ref-after-hours": AfterHours,
   };
   
   /* Artwork only (no text), used by the preview harness. Safe to delete. */
   export const ART: Record<string, () => ReactNode> = {
     "template-chika-poster": CakeArt,
     "template-owambe-poster": DrumArt,
     "template-brunch-poster": BrunchArt,
     "template-era-poster": CassetteArt,
     "template-sundown-poster": SundownArt,
     "template-oktoberfest-poster": OktoberfestArt,
     "template-ramen-poster": RamenArt,
     "template-halloween-poster": HalloweenArt,
     "template-beach-poster": BeachArt,
     "template-housewarming-poster": HouseArt,
     "template-gathering-poster": GatheringArt,
     "template-graduation-poster": GraduationArt,
     "template-christmas-poster": ChristmasArt,
     "template-pool-poster": PoolArt,
     "template-suya-poster": SuyaArt,
     "template-movie-poster": MovieArt,
     "template-karaoke-poster": KaraokeArt,
     "template-sendoff-poster": SendoffArt,
     "ref-grand-affair": () => <RingsArt accent="#d4a94a" />,
     "ref-birthday-energy": BirthdayArt,
     "ref-garden-note": GardenTableArt,
     "ref-little-moments": TeddyArt,
     "ref-after-hours": DiscoArt,
   };