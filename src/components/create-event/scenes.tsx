/* Painted scenes: smoke, fire, aurora, ski, golf and friends.
   Each scene is selected by theme id through SCENE_BY_THEME.
   Palettes are muted and shapes are softened (blur, gradients) so they sit
   behind the invitation like atmosphere rather than cartoon decoration. */

   import type { CSSProperties } from "react";

   import { fixedLayer, rng } from "./themeLayers";
   
   /* ------------------------------------------------------------------ */
   /* Scenes: illustrated, moving backgrounds (smoke, fire, skiers, …)    */
   /* A scene sits on top of the theme's own background, below the effect */
   /* ------------------------------------------------------------------ */
   
   export type SceneId =
     | "smoke"
     | "haunted"
     | "fire"
     | "aurora"
     | "violet"
     | "waves"
     | "stars"
     | "clouds"
     | "rays"
     | "sheen"
     | "ski"
     | "golf";
   
   /** Which scene each theme gets. Themes not listed here keep their quiet glow. */
   export const SCENE_BY_THEME: Record<string, SceneId> = {
     midnight: "smoke",
     noir: "smoke",
     graphite: "smoke",
     "ink-wash": "smoke",
     smoke: "smoke",
     checker: "smoke",
     ember: "fire",
     ruby: "fire",
     copper: "fire",
     rust: "fire",
     "template-owambe": "fire",
     "template-suya": "fire",
     aurora: "aurora",
     plum: "violet",
     velvet: "violet",
     orchid: "violet",
     aubergine: "violet",
     "moment-save-date": "violet",
     ocean: "waves",
     lagoon: "waves",
     cobalt: "waves",
     petrol: "waves",
     "night-sky": "stars",
     sky: "clouds",
     mist: "clouds",
     fog: "clouds",
     "sea-glass": "clouds",
     "template-brunch": "clouds",
     "template-beach": "clouds",
     sunrise: "rays",
     "template-sundown": "rays",
     terracotta: "rays",
     apricot: "rays",
     "citrus-grove": "rays",
     "moment-milestone": "rays",
     holographic: "sheen",
     marble: "sheen",
     "scene-haunted": "haunted",
     "scene-snow": "ski",
     "scene-fairway": "golf",
   };
   
   /** Scenes that bring their own base color (they are whole themes, not overlays). */
   export const SCENE_BASE: Record<string, { mode: "light" | "dark"; base: string }> = {
     "scene-haunted": { mode: "dark", base: "#0e0d12" },
     "scene-snow": { mode: "light", base: "#dfe2e6" },
     "scene-fairway": { mode: "light", base: "#a9cf8e" },
   };
   
   /** One wavy band, 1200 wide with a 600 period, so sliding it by half loops forever. */
   function wavePath(amp: number, y0: number, bottom: number) {
     let d = `M0,${y0}`;
     for (let i = 0; i < 4; i++) {
       const x = i * 300;
       const dir = i % 2 === 0 ? -1 : 1;
       d += ` C${x + 100},${y0 + dir * amp} ${x + 200},${y0 + dir * amp} ${x + 300},${y0}`;
     }
     return `${d} L1200,${bottom} L0,${bottom} Z`;
   }
   
   /* ----- Smoke (+ cobwebs for Haunted) ----- */
   
   function Web({ className }: { className?: string }) {
     const spokes = [0, 1, 2, 3, 4, 5].map((k) => (k * 18 * Math.PI) / 180);
     const rings = [30, 62, 96, 132, 170];
     const P = (rad: number, a: number) => [rad * Math.cos(a), rad * Math.sin(a)];
     const f = (n: number) => n.toFixed(1);
     return (
       <svg
         viewBox="0 0 200 200"
         className={className}
         fill="none"
         stroke="currentColor"
         strokeWidth=".7"
         aria-hidden="true"
       >
         {spokes.map((a, i) => (
           <line key={i} x1="0" y1="0" x2={f(190 * Math.cos(a))} y2={f(190 * Math.sin(a))} />
         ))}
         {rings.map((rad) => {
           const start = P(rad, spokes[0]);
           let d = `M${f(start[0])},${f(start[1])}`;
           for (let k = 0; k < spokes.length - 1; k++) {
             const c = P(rad * 0.88, (spokes[k] + spokes[k + 1]) / 2);
             const e = P(rad, spokes[k + 1]);
             d += ` Q${f(c[0])},${f(c[1])} ${f(e[0])},${f(e[1])}`;
           }
           return <path key={rad} d={d} />;
         })}
       </svg>
     );
   }
   
   function Smoke({ webs }: { webs?: boolean }) {
     const r = rng(5);
     return (
       <div aria-hidden className={fixedLayer}>
         {Array.from({ length: 10 }, (_, i) => {
           const dur = 16 + r() * 12;
           return (
             <span
               key={i}
               className="evs-smoke"
               style={
                 {
                   left: `${(i * 10 + r() * 6 - 4).toFixed(1)}%`,
                   width: `${(9 + r() * 13).toFixed(1)}vw`,
                   animationDuration: `${dur.toFixed(1)}s`,
                   animationDelay: `${(-r() * dur).toFixed(1)}s`,
                   "--sx": `${(r() * 8 - 4).toFixed(1)}vw`,
                 } as CSSProperties
               }
             />
           );
         })}
         {webs && (
           <>
             <div className="absolute left-0 top-0 w-[clamp(14rem,32vw,30rem)]">
               <Web className="evs-web block w-full" />
             </div>
             <div className="absolute right-0 top-0 w-[clamp(12rem,28vw,26rem)] -scale-x-100">
               <Web className="evs-web block w-full" />
             </div>
           </>
         )}
       </div>
     );
   }
   
   /* ----- Fire: soft, blurred tongues over a warm glow ----- */
   
   function flamePath(seed: number, n: number, minH: number, maxH: number) {
     const r = rng(seed);
     const w = 1000 / n;
     const f = (v: number) => v.toFixed(0);
     const baseY = 300 - minH;
     let d = `M0,300 L0,${f(baseY)}`;
     for (let i = 0; i < n; i++) {
       const x0 = i * w;
       const x1 = x0 + w;
       const tipX = x0 + w * (0.25 + r() * 0.35);
       const tipY = 300 - (minH + r() * (maxH - minH));
       // Left edge climbs almost straight up, right edge curls over and drops:
       // each tongue leans, so it reads as flame rather than a mountain.
       d += ` Q${f(x0 + w * 0.05)},${f(tipY + (baseY - tipY) * 0.62)} ${f(tipX)},${f(tipY)}`;
       d += ` Q${f(tipX + w * (0.18 + r() * 0.2))},${f(tipY + (baseY - tipY) * 0.12)} ${f(x1)},${f(baseY)}`;
     }
     return `${d} L1000,300 Z`;
   }
   
   function Fire() {
     const layers = [
       { cls: "evs-flame-1", seed: 3, n: 8, minH: 110, maxH: 250, from: "#4a0e08", to: "#a8301a", o: 0.62, blur: 5 },
       { cls: "evs-flame-2", seed: 8, n: 11, minH: 80, maxH: 210, from: "#a8341a", to: "#d9702a", o: 0.55, blur: 3.5 },
       { cls: "evs-flame-3", seed: 15, n: 14, minH: 50, maxH: 150, from: "#d9782a", to: "#f0c070", o: 0.5, blur: 2 },
     ];
     const r = rng(77);
     return (
       <div aria-hidden className={fixedLayer}>
         <div
           className="absolute inset-x-0 bottom-0 h-[55vh]"
           style={{ background: "radial-gradient(ellipse at 50% 110%, rgba(220,110,40,.38), transparent 62%)" }}
         />
         {layers.map((l, i) => (
           <svg
             key={i}
             viewBox="0 0 1000 300"
             preserveAspectRatio="none"
             className={`evs-flame ${l.cls}`}
             style={{ opacity: l.o, filter: `blur(${l.blur}px)` }}
           >
             <defs>
               <linearGradient id={`evs-fg-${i}`} x1="0" y1="1" x2="0" y2="0">
                 <stop offset="0" stopColor={l.to} />
                 <stop offset="1" stopColor={l.from} />
               </linearGradient>
             </defs>
             <path d={flamePath(l.seed, l.n, l.minH, l.maxH)} fill={`url(#evs-fg-${i})`} />
           </svg>
         ))}
         {Array.from({ length: 14 }, (_, i) => {
           const dur = 5 + r() * 6;
           const size = 2.4 + r() * 2.6;
           return (
             <span
               key={i}
               className="evs-ember"
               style={
                 {
                   left: `${(r() * 100).toFixed(1)}%`,
                   width: size,
                   height: size,
                   animationDuration: `${dur.toFixed(1)}s`,
                   animationDelay: `${(-r() * dur).toFixed(1)}s`,
                   "--ex": `${Math.round(r() * 60 - 30)}px`,
                 } as CSSProperties
               }
             />
           );
         })}
       </div>
     );
   }
   
   /* ----- Aurora curtains (muted, soft) ----- */
   
   function Aurora({ palette }: { palette: "green" | "violet" }) {
     const cols =
       palette === "green"
         ? [["#5fb8a0", "#4a84b0"], ["#8a78c0", "#5fb8a0"], ["#4a84b0", "#8a78c0"]]
         : [["#b86aa8", "#7a68b8"], ["#7a68b8", "#c47ab0"], ["#9a4ab0", "#b86a98"]];
     const specs = [
       { top: "-4%", h: "62vh", dur: 52, rev: false, amp: 46, y0: 90 },
       { top: "6%", h: "54vh", dur: 68, rev: true, amp: 38, y0: 80 },
       { top: "14%", h: "46vh", dur: 84, rev: false, amp: 30, y0: 70 },
     ];
     return (
       <div aria-hidden className={fixedLayer} style={{ filter: "blur(10px)", opacity: 0.8 }}>
         {specs.map((s, i) => (
           <div
             key={i}
             className="evs-aur"
             style={{ top: s.top, height: s.h, width: "100%", animationDelay: `${-i * 3}s` }}
           >
             <svg
               viewBox="0 0 1200 300"
               preserveAspectRatio="none"
               className="evs-scroll"
               style={{
                 animationDuration: `${s.dur}s`,
                 animationDirection: s.rev ? "reverse" : "normal",
               }}
             >
               <defs>
                 <linearGradient id={`evs-ag-${palette}-${i}`} x1="0" y1="0" x2="0" y2="1">
                   <stop offset="0" stopColor={cols[i][0]} stopOpacity=".55" />
                   <stop offset=".55" stopColor={cols[i][1]} stopOpacity=".24" />
                   <stop offset="1" stopColor={cols[i][1]} stopOpacity="0" />
                 </linearGradient>
               </defs>
               <path d={wavePath(s.amp, s.y0, 300)} fill={`url(#evs-ag-${palette}-${i})`} />
             </svg>
           </div>
         ))}
       </div>
     );
   }
   
   /* ----- Sea: deep layered water with lit crests ----- */
   
   function SeaWaves() {
     const layers = [
       { h: "26vh", dur: 38, rev: false, amp: 20, y0: 70, from: "#3a7ca8", to: "#1a4668", o: 0.5 },
       { h: "20vh", dur: 28, rev: true, amp: 16, y0: 60, from: "#2f9a98", to: "#17605e", o: 0.58 },
       { h: "14vh", dur: 20, rev: false, amp: 12, y0: 50, from: "#4a8cc0", to: "#1f4a78", o: 0.7 },
     ];
     return (
       <div aria-hidden className={fixedLayer}>
         {layers.map((l, i) => (
           <div key={i} className="absolute bottom-0 left-0 w-full overflow-hidden" style={{ height: l.h }}>
             <svg
               viewBox="0 0 1200 160"
               preserveAspectRatio="none"
               className="evs-scroll block h-full"
               style={{
                 width: "200vw",
                 animationDuration: `${l.dur}s`,
                 animationDirection: l.rev ? "reverse" : "normal",
               }}
             >
               <defs>
                 <linearGradient id={`evs-sg-${i}`} x1="0" y1="0" x2="0" y2="1">
                   <stop offset="0" stopColor={l.from} />
                   <stop offset="1" stopColor={l.to} />
                 </linearGradient>
               </defs>
               <path d={wavePath(l.amp, l.y0, 160)} fill={`url(#evs-sg-${i})`} fillOpacity={l.o} />
               <path d={wavePath(l.amp, l.y0, l.y0).replace(/ L1200.*$/, "")} fill="none" stroke="#fff" strokeOpacity=".22" strokeWidth="1.2" />
             </svg>
           </div>
         ))}
       </div>
     );
   }
   
   /* ----- Night sky ----- */
   
   function Stars() {
     const r = rng(21);
     return (
       <div aria-hidden className={fixedLayer}>
         <div
           className="absolute inset-0"
           style={{
             background:
               "radial-gradient(ellipse 90% 16% at 50% 50%, rgba(120,140,210,.22), transparent 70%)",
             transform: "rotate(-28deg) scale(1.5)",
           }}
         />
         {Array.from({ length: 70 }, (_, i) => {
           const s = 0.9 + r() * 2;
           const d = 2.5 + r() * 4;
           return (
             <span
               key={i}
               className="evs-star"
               style={{
                 left: `${(r() * 100).toFixed(1)}%`,
                 top: `${(r() * 100).toFixed(1)}%`,
                 width: s,
                 height: s,
                 animationDuration: `${d.toFixed(1)}s`,
                 animationDelay: `${(-r() * d).toFixed(1)}s`,
               }}
             />
           );
         })}
         <span className="evs-shoot" style={{ left: "78%", top: "10%", animationDelay: "-2s" }} />
         <span className="evs-shoot" style={{ left: "92%", top: "34%", animationDuration: "15s", animationDelay: "-9s" }} />
       </div>
     );
   }
   
   /* ----- Clouds: soft, slightly warm ----- */
   
   function Clouds() {
     const items = [
       { y: 8, w: 26, o: 0.55, d: 140, s: -30 },
       { y: 24, w: 16, o: 0.42, d: 110, s: -80 },
       { y: 42, w: 30, o: 0.46, d: 170, s: -120 },
       { y: 60, w: 18, o: 0.38, d: 125, s: -50 },
       { y: 76, w: 24, o: 0.5, d: 150, s: -95 },
       { y: 90, w: 14, o: 0.34, d: 100, s: -10 },
     ];
     return (
       <div aria-hidden className={fixedLayer}>
         {items.map((c, i) => (
           <div
             key={i}
             className="evs-cloud"
             style={{
               top: `${c.y}%`,
               width: `${c.w}vw`,
               opacity: c.o,
               filter: "blur(2.5px)",
               animationDuration: `${c.d}s`,
               animationDelay: `${c.s}s`,
             }}
           >
             <svg viewBox="0 0 200 100" className="block w-full">
               <defs>
                 <linearGradient id={`evs-cg-${i}`} x1="0" y1="0" x2="0" y2="1">
                   <stop offset="0" stopColor="#fbf7ef" />
                   <stop offset="1" stopColor="#dcd6cc" />
                 </linearGradient>
               </defs>
               <g fill={`url(#evs-cg-${i})`}>
                 <circle cx="60" cy="60" r="30" />
                 <circle cx="100" cy="45" r="40" />
                 <circle cx="145" cy="60" r="32" />
                 <rect x="40" y="60" width="130" height="30" rx="15" />
               </g>
             </svg>
           </div>
         ))}
       </div>
     );
   }
   
   /* ----- Sun rays, holographic sheen ----- */
   
   function Rays() {
     return (
       <div aria-hidden className={fixedLayer}>
         <span
           className="evs-rays"
           style={{ left: "calc(88% - 110vmax)", top: "calc(-8% - 110vmax)" }}
         />
       </div>
     );
   }
   
   function Sheen() {
     return (
       <div aria-hidden className={fixedLayer}>
         <span className="evs-sheen" />
       </div>
     );
   }
   
   /* ----- Snow day: skiers and boarders on carved trails ----- */
   
   const TRAILS = [
     "M120,-20 C260,120 80,240 220,380 S420,560 300,700 S120,860 220,1020",
     "M520,-20 C440,140 640,200 560,360 S400,520 520,660 S700,820 600,1020",
     "M880,-20 C800,120 960,260 840,400 S700,560 820,700 S940,880 860,1020",
   ];
   
   const RIDERS = [
     { trail: 0, id: "evs-skier", dur: 24, begin: -4 },
     { trail: 0, id: "evs-boarder", dur: 30, begin: -19 },
     { trail: 1, id: "evs-boarder", dur: 27, begin: -9 },
     { trail: 1, id: "evs-skier", dur: 33, begin: -26 },
     { trail: 2, id: "evs-skier", dur: 22, begin: -13 },
     { trail: 2, id: "evs-boarder", dur: 29, begin: -2 },
   ];
   
   function Ski() {
     return (
       <div aria-hidden className={fixedLayer} style={{ background: "#dfe2e6" }}>
         <svg
           viewBox="0 0 1000 1000"
           preserveAspectRatio="xMidYMid slice"
           className="absolute inset-0 size-full"
         >
           <defs>
             <g id="evs-skier">
               <line x1="-8" y1="1" x2="8" y2="-3" stroke="#5a5090" strokeWidth="2.4" strokeLinecap="round" />
               <rect x="-3.4" y="-17" width="6.8" height="13" rx="3.2" fill="#c47a98" />
               <rect x="-2.6" y="-6" width="5.2" height="7" rx="2" fill="#2f2a4a" />
               <circle cx="0" cy="-21" r="3.7" fill="#8a5a3c" />
               <path d="M-4 -23 h8 v-1.5 a4 3 0 0 0 -8 0z" fill="#4aa890" />
               <line x1="4.2" y1="-14" x2="10" y2="-1" stroke="#555" strokeWidth="1" strokeLinecap="round" />
             </g>
             <g id="evs-boarder">
               <rect x="-9" y="-1.5" width="18" height="3" rx="1.5" fill="#4aa890" transform="rotate(-8)" />
               <rect x="-3.4" y="-17" width="6.8" height="14" rx="3.2" fill="#8a72c0" />
               <rect x="-2.6" y="-6" width="5.2" height="6" rx="2" fill="#2f2a4a" />
               <circle cx="0" cy="-21" r="3.7" fill="#c98f6b" />
               <path d="M-4 -23 h8 v-1.5 a4 3 0 0 0 -8 0z" fill="#d99a4a" />
             </g>
           </defs>
   
           {/* faint contour lines in the corners, like the snow-map reference */}
           <g fill="none" stroke="#8a929c" strokeOpacity=".2" strokeWidth="1.2">
             {[60, 100, 140, 180].map((rad) => (
               <circle key={`a${rad}`} cx="0" cy="0" r={rad} />
             ))}
             {[70, 115, 160, 205].map((rad) => (
               <circle key={`b${rad}`} cx="1000" cy="1000" r={rad} />
             ))}
           </g>
   
           {TRAILS.map((d, i) => (
             <path
               key={i}
               d={d}
               fill="none"
               stroke="#9fb6d4"
               strokeWidth="5"
               strokeLinecap="round"
               strokeOpacity=".8"
             />
           ))}
   
           {RIDERS.map((rd, i) => (
             <g key={i}>
               <animateMotion
                 path={TRAILS[rd.trail]}
                 dur={`${rd.dur}s`}
                 begin={`${rd.begin}s`}
                 repeatCount="indefinite"
               />
               <use href={`#${rd.id}`} transform="scale(1.7)" />
             </g>
           ))}
         </svg>
       </div>
     );
   }
   
   /* ----- Fairway: pixel-art golf course (muted greens) ----- */
   
   const GRASS = `url("data:image/svg+xml,${encodeURIComponent(
     "<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' shape-rendering='crispEdges'><g fill='#8dba76'><rect x='3' y='6' width='1' height='1'/><rect x='5' y='6' width='1' height='1'/><rect x='4' y='7' width='1' height='1'/><rect x='15' y='15' width='1' height='1'/><rect x='17' y='15' width='1' height='1'/><rect x='16' y='16' width='1' height='1'/></g><g fill='#d4e8bc'><rect x='10' y='3' width='1' height='1'/><rect x='20' y='9' width='1' height='1'/><rect x='7' y='19' width='1' height='1'/><rect x='19' y='21' width='1' height='1'/></g></svg>",
   )}")`;
   
   function Fairway() {
     const cols = 120;
     const rows = 68;
     const field = (x: number, y: number) =>
       Math.sin(x * 0.085 + y * 0.04) +
       Math.sin(y * 0.11 - x * 0.03 + 1.3) +
       Math.sin((x + y) * 0.05 + 2);
     const light = "#b8d9a0";
     const dark = "#94bd7c";
     const runs: { x: number; y: number; w: number; c: string }[] = [];
     for (let y = 0; y < rows; y++) {
       let x = 0;
       while (x < cols) {
         const v = field(x, y);
         const c = v > 1 ? light : v < -1.1 ? dark : "";
         let w = 1;
         while (x + w < cols) {
           const v2 = field(x + w, y);
           const c2 = v2 > 1 ? light : v2 < -1.1 ? dark : "";
           if (c2 !== c) break;
           w++;
         }
         if (c) runs.push({ x, y, w, c });
         x += w;
       }
     }
     return (
       <svg
         viewBox={`0 0 ${cols} ${rows}`}
         preserveAspectRatio="xMidYMid slice"
         shapeRendering="crispEdges"
         className="absolute inset-0 size-full"
       >
         {runs.map((run, i) => (
           <rect key={i} x={run.x} y={run.y} width={run.w} height={1} fill={run.c} />
         ))}
       </svg>
     );
   }
   
   function Golf() {
     return (
       <div aria-hidden className={fixedLayer} style={{ background: "#a9cf8e" }}>
         <Fairway />
         <div className="evs-grass" style={{ backgroundImage: GRASS }} />
         <span className="evs-shadow" style={{ top: "18%", width: "22vw", height: "9vw", animationDuration: "75s", animationDelay: "-20s" }} />
         <span className="evs-shadow" style={{ top: "58%", width: "16vw", height: "7vw", animationDuration: "95s", animationDelay: "-60s" }} />
       </div>
     );
   }
   
   export function Scene({ id }: { id: SceneId }) {
     switch (id) {
       case "smoke":
         return <Smoke />;
       case "haunted":
         return <Smoke webs />;
       case "fire":
         return <Fire />;
       case "aurora":
         return <Aurora palette="green" />;
       case "violet":
         return <Aurora palette="violet" />;
       case "waves":
         return <SeaWaves />;
       case "stars":
         return <Stars />;
       case "clouds":
         return <Clouds />;
       case "rays":
         return <Rays />;
       case "sheen":
         return <Sheen />;
       case "ski":
         return <Ski />;
       case "golf":
         return <Golf />;
       default:
         return null;
     }
   }