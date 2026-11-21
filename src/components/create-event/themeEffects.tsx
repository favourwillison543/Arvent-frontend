/* Large ambient effects (spotlights, fireworks, confetti) drawn in code.
   Tuned to be quiet: muted metallic palettes, small slow particles, soft light.
   Particle artwork comes from effectGlyphs.tsx (shaded, not flat icons). */

   import type { CSSProperties } from "react";

   import { effects } from "./effects";
   import DesignerArtwork from "./DesignerArtwork";

   import { Aurora, RefinedEffect, SOFT } from "./refinedEffects";
   import { boxLayer, CONFETTI, fixedLayer, NOISE, rng } from "./themeLayers";
import EffectGlyph from "./EffectGlyphs";
   
   /* ------------------------------------------------------------------ */
   /* Effects: particles with depth, sway and tumble                      */
   /* ------------------------------------------------------------------ */
   
   /* Muted, metallic palettes: champagne, rose gold, dusty tones, silver. */
   const PALETTES: Record<string, string[]> = {
     confetti: ["#d9b868", "#ecd9a8", "#cfa896", "#b9a2b8", "#e8e2d6", "#b8944c"],
     money: ["#7fae8c", "#9cc4a6", "#5f946f", "#bcd8c2"],
     balloons: ["#d9bfa8", "#c9a48e", "#b8a0b6", "#a3b6c4"],
     hearts: ["#d98a94", "#c9788a", "#e6b0b6", "#b8687a"],
     music: ["#b8a2d6", "#98b4c6", "#c9a88e", "#c8b480"],
     stars: ["#ecd9a8", "#f6e8c6", "#d9b868", "#f4efe4"],
     sparkle: ["#f6e8c6", "#ecd9a8", "#f4efe4", "#e8cdc0"],
     petals: ["#e8c0c4", "#d9a4ae", "#f0d6d8", "#d4b0c4"],
     leaves: ["#b8744a", "#a05a38", "#c9964c", "#885038"],
     snow: ["#f4f6fa", "#dde8f6", "#c8d8ee"],
     bats: ["#6f6a82", "#5a5570", "#8a85a0"],
     ghosts: ["#dcdaea", "#c8c4dc", "#e6e4f2"],
     spiders: ["#a8a3b8", "#8f8aa6", "#b87a4a"],
   };
   
   /* Three quiet bursts instead of six. */
   const BURSTS: [number, number][] = [
     [24, 28],
     [70, 22],
     [48, 42],
   ];
   
   /* ----- Light beams: slow, soft searchlights from the sides ----- */
   
   type Beam = {
     side: "l" | "r";
     /** vertical position of the light source, % of the screen height */
     top: number;
     /** aim, in degrees: positive on the left side points down-right */
     angle: number;
     color: string;
     /** how far the beam swings each way, degrees */
     sway: number;
     dur: number;
     delay: number;
   };
   
   const BEAMS: Record<string, Beam[]> = {
     beams: [
       { side: "l", top: 4, angle: 27, color: "rgba(224,194,128,.22)", sway: 4, dur: 16, delay: 0 },
       { side: "r", top: 10, angle: -25, color: "rgba(190,170,196,.18)", sway: 4, dur: 18, delay: -6 },
     ],
     stage: [
       { side: "l", top: -10, angle: 60, color: "rgba(240,216,160,.22)", sway: 4, dur: 16, delay: 0 },
       { side: "r", top: -10, angle: -60, color: "rgba(240,196,170,.18)", sway: 4, dur: 18, delay: -7 },
     ],
     neon: [
       { side: "l", top: 80, angle: -33, color: "rgba(200,110,160,.2)", sway: 4, dur: 16, delay: 0 },
       { side: "r", top: 84, angle: 31, color: "rgba(110,160,200,.18)", sway: 4, dur: 18, delay: -7 },
     ],
   };
   
   function Beams({ layer, beams }: { layer: string; beams: Beam[] }) {
     return (
       <div aria-hidden className={layer}>
         {beams.map((b, i) => {
           const left = b.side === "l";
           const wedge = left
             ? "polygon(0 46%, 100% 0, 100% 100%, 0 54%)"
             : "polygon(100% 46%, 0 0, 0 100%, 100% 54%)";
           const core = left
             ? "polygon(0 48.5%, 100% 28%, 100% 72%, 0 51.5%)"
             : "polygon(100% 48.5%, 0 28%, 0 72%, 100% 51.5%)";
           const dir = left ? "to right" : "to left";
           return (
             <span
               key={i}
               className="evb"
               style={
                 {
                   [left ? "left" : "right"]: "-4vmax",
                   top: `calc(${b.top}% - 17vmax)`,
                   width: "125vmax",
                   height: "34vmax",
                   transformOrigin: left ? "0% 50%" : "100% 50%",
                   "--a": `${b.angle}deg`,
                   "--s": `${b.sway}deg`,
                   animationDuration: `${b.dur}s`,
                   animationDelay: `${b.delay}s`,
                 } as CSSProperties
               }
             >
               <span
                 className="evb-cone"
                 style={{
                   clipPath: wedge,
                   background: `linear-gradient(${dir}, ${b.color}, transparent 88%)`,
                 }}
               />
               <span
                 className="evb-cone"
                 style={{
                   clipPath: core,
                   background: `linear-gradient(${dir}, rgba(255,255,255,.12), transparent 66%)`,
                 }}
               />
               <span
                 className="evb-cone evb-haze"
                 style={{
                   clipPath: wedge,
                   backgroundImage: `repeating-linear-gradient(${dir}, transparent 0 7%, rgba(255,255,255,.035) 7% 9.5%, transparent 9.5% 15%)`,
                 }}
               />
             </span>
           );
         })}
       </div>
     );
   }
   
   /** Three gold bursts that fan out and fade. */
   function Fireworks({ layer }: { layer: string }) {
     const colors = ["#d9b868", "#ecd9a8", "#cfa896", "#f4efe4"];
     return (
       <div aria-hidden className={layer}>
         {BURSTS.map(([x, y], b) => (
           <span key={b} className="evx-fw" style={{ left: `${x}%`, top: `${y}%` }}>
             {Array.from({ length: 16 }, (_, i) => (
               <i
                 key={i}
                 style={
                   {
                     "--a": `${i * 22.5}deg`,
                     "--d": `${96 + (i % 3) * 30}px`,
                     "--c": colors[(b + (i % 2)) % colors.length],
                     "--dl": `${(-b * 1.1).toFixed(1)}s`,
                   } as CSSProperties
                 }
               />
             ))}
           </span>
         ))}
       </div>
     );
   }
   
   /** Keeps the effect inside its parent instead of covering the whole screen. */
   export function Effect({
     id,
     contained,
   }: {
     id: string;
     contained?: boolean;
   }) {
     const layer = contained ? boxLayer : fixedLayer;
   
     if (id === "grain") {
       return (
         <div
           aria-hidden
           className={`${layer} opacity-[.14] mix-blend-overlay`}
           style={{ backgroundImage: NOISE }}
         />
       );
     }
   
     if (id === "glow") {
       return (
         <div aria-hidden className={layer}>
           <div className="ev-orb absolute -left-24 top-[8%] size-[26rem] rounded-full bg-[#d9b868]/10 blur-[100px]" />
           <div className="ev-orb ev-orb2 absolute -right-24 top-[45%] size-[26rem] rounded-full bg-[#b89490]/10 blur-[110px]" />
         </div>
       );
     }
   
     const def = effects.find((e) => e.id === id);
   
     if (BEAMS[id]) return <Beams layer={layer} beams={BEAMS[id]} />;
     if (!def?.motion) return null;
     if (id === "fireworks") return <Fireworks layer={layer} />;
     if (id === "aurora") return <Aurora layer={layer} />;
     if (SOFT[id]) return <RefinedEffect id={id} layer={layer} />;
   
     const palette = PALETTES[id] ?? CONFETTI;
     const kind =
       id === "sparkle" || id === "stars"
         ? "twinkle"
         : def.motion === "float"
           ? "drift"
           : def.motion;
     // Fewer pieces: the screen should feel dressed, not busy.
     const count =
       kind === "fall" ? 16 : kind === "rise" ? 12 : kind === "twinkle" ? 18 : 9;
     const r = rng(id.length * 97 + 13);
   
     return (
       <div aria-hidden className={layer}>
         {Array.from({ length: count }, (_, i) => {
           const depth = r(); // 0 = far away, 1 = right in front
           // Small pieces (10-26px): far ones are tiny and soft, near ones larger.
           const size = Math.round(9 + Math.pow(depth, 1.4) * 17);
           const x = (r() * 100).toFixed(1);
           const y = (r() * 86).toFixed(1);
           // Slower, calmer movement.
           const dur =
             kind === "twinkle"
               ? 3.6 + r() * 4
               : kind === "drift"
                 ? 18 + r() * 12
                 : 28 - depth * 10 + r() * 4;
           // Negative delay = already mid-flight on load, so the screen is never empty.
           const delay = -(r() * dur);
           const swayDur = 5 + r() * 4;
           const color = palette[i % palette.length];
           const glyph = (
             <EffectGlyph
               id={id}
               i={i}
               color={color}
               fallback={<DesignerArtwork name={def.icon} variant="solid" className="size-full" />}
             />
           );
   
           const outer: CSSProperties = {
             left: `${x}%`,
             top: kind === "drift" || kind === "twinkle" ? `${y}%` : undefined,
             width: size,
             height: size,
             color,
             opacity:
               kind === "twinkle"
                 ? undefined
                 : Number((0.3 + depth * 0.45).toFixed(2)),
             // Depth of field: distant and very close pieces are soft.
             filter:
               depth < 0.28 ? "blur(1.6px)" : depth > 0.9 ? "blur(2.2px)" : undefined,
             animationDuration: `${dur.toFixed(1)}s`,
             animationDelay: `${delay.toFixed(1)}s`,
           };
   
           if (kind === "twinkle") {
             return (
               <span key={i} className="evx evx-twinkle" style={outer}>
                 {glyph}
               </span>
             );
           }
   
           return (
             <span key={i} className={`evx evx-${kind}`} style={outer}>
               <span
                 className="evx-in"
                 style={
                   {
                     "--sway": `${Math.round(8 + r() * 20)}px`,
                     "--rot": `${Math.round(6 + r() * 14)}deg`,
                     animationDuration: `${swayDur.toFixed(1)}s`,
                     animationDelay: `${(-r() * swayDur).toFixed(1)}s`,
                   } as CSSProperties
                 }
               >
                 {glyph}
               </span>
             </span>
           );
         })}
       </div>
     );
   }