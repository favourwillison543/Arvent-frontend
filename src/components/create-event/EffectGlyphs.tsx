/* Refined particle artwork for the falling / rising / drifting effects.
   Each glyph is shaded (a lit side and a shaded side) instead of a flat icon,
   and reads as an object rather than a sticker. Used by themeEffects.tsx;
   effects that are not listed here fall back to the old DesignerArtwork. */

   import type { ReactNode } from "react";

   const hex = (c: string) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));
   const mix = (a: string, b: string, t: number) => {
     const A = hex(a);
     const B = hex(b);
     return "#" + A.map((v, i) => Math.round(v + (B[i] - v) * t).toString(16).padStart(2, "0")).join("");
   };
   
   const Svg = ({ children }: { children: ReactNode }) => (
     <svg viewBox="0 0 24 24" className="size-full" aria-hidden="true">
       {children}
     </svg>
   );
   
   export default function EffectGlyph({
     id,
     i,
     color,
     fallback,
   }: {
     id: string;
     i: number;
     color: string;
     fallback: ReactNode;
   }) {
     const light = mix(color, "#ffffff", 0.5);
     const dark = mix(color, "#000000", 0.32);
     const k = `${id}${color.slice(1)}`;
     const lin = (name: string, a: string, b: string, x2 = 1, y2 = 0) => (
       <linearGradient id={`g-${name}-${k}`} x1="0" y1="0" x2={x2} y2={y2}>
         <stop offset="0" stopColor={a} />
         <stop offset="1" stopColor={b} />
       </linearGradient>
     );
     const rad = (name: string, a: string, b: string, c = b) => (
       <radialGradient id={`r-${name}-${k}`} cx=".35" cy=".3" r=".85">
         <stop offset="0" stopColor={a} />
         <stop offset=".5" stopColor={b} />
         <stop offset="1" stopColor={c} />
       </radialGradient>
     );
   
     switch (id) {
       case "confetti": {
         const v = i % 5;
         if (v === 4) {
           return (
             <Svg>
               <defs>{rad("d", light, color, dark)}</defs>
               <circle cx="12" cy="12" r="4.4" fill={`url(#r-d-${k})`} />
             </Svg>
           );
         }
         if (v % 2 === 1) {
           return (
             <Svg>
               <defs>{lin("rb", light, dark, 0, 1)}</defs>
               <path d="M8,2 C18,7 6,14 16,22" fill="none" stroke={`url(#g-rb-${k})`} strokeWidth="3.2" />
               <path d="M8,2 C18,7 6,14 16,22" fill="none" stroke="#fff" strokeOpacity=".28" strokeWidth=".7" transform="translate(-.7 0)" />
             </Svg>
           );
         }
         return (
           <Svg>
             <defs>{lin("sl", light, dark)}</defs>
             <rect x="9" y="3" width="6" height="18" rx=".7" fill={`url(#g-sl-${k})`} />
             <rect x="9" y="3" width="1.4" height="18" rx=".5" fill="#fff" fillOpacity=".35" />
           </Svg>
         );
       }
       case "balloons":
         return (
           <Svg>
             <defs>{rad("b", light, color, dark)}</defs>
             <path d="M12,1.8 C17,1.8 19,6.4 19,10 C19,15.6 15,18.6 12,19.2 C9,18.6 5,15.6 5,10 C5,6.4 7,1.8 12,1.8Z" fill={`url(#r-b-${k})`} />
             <path d="M12,19.2 l-1.5,2 h3z" fill={dark} />
             <path d="M12,21.2 C10.4,22.4 13.6,22.8 12,24" fill="none" stroke={mix(color, "#ffffff", 0.4)} strokeWidth=".35" />
             <ellipse cx="8.8" cy="7" rx="1.4" ry="2.8" fill="#fff" fillOpacity=".5" transform="rotate(20 8.8 7)" />
           </Svg>
         );
       case "hearts":
         return (
           <Svg>
             <defs>{rad("h", light, color, dark)}</defs>
             <path d="M12,21 C5,15.6 3,12.2 3,8.8 C3,5.8 5.2,4 7.6,4 C9.6,4 11.2,5.2 12,6.8 C12.8,5.2 14.4,4 16.4,4 C18.8,4 21,5.8 21,8.8 C21,12.2 19,15.6 12,21Z" fill={`url(#r-h-${k})`} />
             <ellipse cx="8" cy="8" rx="1.8" ry="1.1" fill="#fff" fillOpacity=".45" transform="rotate(-30 8 8)" />
           </Svg>
         );
       case "music":
         return (
           <Svg>
             <defs>{lin("m", light, color, 0, 1)}</defs>
             <ellipse cx="8" cy="18" rx="3.8" ry="2.8" fill={`url(#g-m-${k})`} transform="rotate(-20 8 18)" />
             <rect x="10.8" y="3.6" width="1.5" height="14.4" fill={color} />
             <path d="M12.3,3.6 C14.4,6 18.6,6.4 18.6,11 C17,8.6 14.6,8.4 12.3,8.4Z" fill={color} />
           </Svg>
         );
       case "stars":
       case "sparkle":
       case "sparks": {
         const big = i % 3 !== 2;
         return (
           <Svg>
             <defs>{rad("s", "#ffffff", light, color)}</defs>
             <path
               d={big ? "M12,1.5 C12.7,8 16,11.3 22.5,12 C16,12.7 12.7,16 12,22.5 C11.3,16 8,12.7 1.5,12 C8,11.3 11.3,8 12,1.5Z" : "M12,5 C12.4,9 15,11.6 19,12 C15,12.4 12.4,15 12,19 C11.6,15 9,12.4 5,12 C9,11.6 11.6,9 12,5Z"}
               fill={`url(#r-s-${k})`}
             />
           </Svg>
         );
       }
       case "petals":
       case "blossom":
         return (
           <Svg>
             <defs>{lin("p", light, dark, 0, 1)}</defs>
             <g transform={`rotate(${(i * 37) % 40 - 20} 12 12)`}>
               <path d="M12,2 C17.4,6 19.6,12.4 12,22 C4.4,12.4 6.6,6 12,2Z" fill={`url(#g-p-${k})`} />
               <path d="M12,5 V19" stroke="#fff" strokeOpacity=".3" strokeWidth=".5" />
             </g>
           </Svg>
         );
       case "leaves":
         return (
           <Svg>
             <defs>{lin("l", light, dark)}</defs>
             <g transform={`rotate(${(i * 53) % 50 - 25} 12 12)`}>
               <path d="M12,22.4 C3.6,16 3.6,6.6 12,1.8 C20.4,6.6 20.4,16 12,22.4Z" fill={`url(#g-l-${k})`} />
               <path d="M12,22.4 V5" stroke={dark} strokeOpacity=".55" strokeWidth=".7" />
               <path d="M12,16 L7.6,12.4 M12,16 L16.4,12.4 M12,11 L8.6,8 M12,11 L15.4,8" stroke={dark} strokeOpacity=".35" strokeWidth=".5" />
             </g>
           </Svg>
         );
       case "snow": {
         if (i % 3 === 0) {
           return (
             <Svg>
               <g stroke={color} strokeWidth="1.2" strokeLinecap="round" fill="none">
                 {[0, 60, 120].map((r) => (
                   <g key={r} transform={`rotate(${r} 12 12)`}>
                     <path d="M12,3 V21" />
                     <path d="M12,6.4 L9.6,4.4 M12,6.4 L14.4,4.4 M12,17.6 L9.6,19.6 M12,17.6 L14.4,19.6" strokeWidth=".8" />
                   </g>
                 ))}
               </g>
             </Svg>
           );
         }
         return (
           <Svg>
             <defs>
               <radialGradient id={`r-sn-${k}`}>
                 <stop offset="0" stopColor="#fff" stopOpacity=".95" />
                 <stop offset="1" stopColor={color} stopOpacity="0" />
               </radialGradient>
             </defs>
             <circle cx="12" cy="12" r="9" fill={`url(#r-sn-${k})`} />
           </Svg>
         );
       }
       case "bats":
         return (
           <Svg>
             <path d="M12,9 C10.5,6.5 8,6 2,8 C4,9 4.5,11 5,13.5 C6.5,12 8,12.2 9,14 L12,12 L15,14 C16,12.2 17.5,12 19,13.5 C19.5,11 20,9 22,8 C16,6 13.5,6.5 12,9Z" fill={color} />
             <path d="M10.5,9 L11,6.5 L12,8 L13,6.5 L13.5,9Z" fill={color} />
           </Svg>
         );
       case "ghosts":
         return (
           <Svg>
             <defs>{lin("gh", "#ffffff", color, 0, 1)}</defs>
             <path d="M12,2.5 C7.5,2.5 5,6 5,10 V20 L7.6,18 L10,20.4 L12,18.4 L14,20.4 L16.4,18 L19,20 V10 C19,6 16.5,2.5 12,2.5Z" fill={`url(#g-gh-${k})`} fillOpacity=".92" />
             <ellipse cx="9.6" cy="10" rx="1.1" ry="1.6" fill={dark} />
             <ellipse cx="14.4" cy="10" rx="1.1" ry="1.6" fill={dark} />
           </Svg>
         );
       case "spiders":
         return (
           <Svg>
             <g stroke={color} strokeWidth=".9" strokeLinecap="round" fill="none">
               <path d="M10,12 C6,9 4,10 3,13 M10,13 C6,12 4,14 3.4,17 M10,14 C7,15 6,18 6.4,21 M10,11 C7.4,7.4 6,6 5,4" />
               <path d="M14,12 C18,9 20,10 21,13 M14,13 C18,12 20,14 20.6,17 M14,14 C17,15 18,18 17.6,21 M14,11 C16.6,7.4 18,6 19,4" />
             </g>
             <circle cx="12" cy="13.4" r="3.4" fill={color} />
             <circle cx="12" cy="8.8" r="2.2" fill={color} />
           </Svg>
         );
       case "money":
         return (
           <Svg>
             <defs>{rad("c", light, color, dark)}</defs>
             <circle cx="12" cy="12" r="8.4" fill={`url(#r-c-${k})`} />
             <circle cx="12" cy="12" r="6.2" fill="none" stroke="#fff" strokeOpacity=".4" strokeWidth=".6" />
             <path d="M12,8 L15,12 L12,16 L9,12Z" fill="#fff" fillOpacity=".4" />
           </Svg>
         );
       case "bubbles": {
         // Glossy spheres: a lit rim, a see-through body and one highlight.
         const r0 = 5.2 + (i % 4) * 1.7;
         return (
           <Svg>
             <defs>{rad("bu", light, color, dark)}</defs>
             <circle cx="12" cy="12" r={r0} fill={`url(#r-bu-${k})`} fillOpacity=".72" />
             <circle cx="12" cy="12" r={r0} fill="none" stroke="#fff" strokeOpacity=".55" strokeWidth=".8" />
             <ellipse
               cx={12 - r0 * 0.36}
               cy={12 - r0 * 0.42}
               rx={r0 * 0.3}
               ry={r0 * 0.2}
               fill="#fff"
               fillOpacity=".62"
               transform={`rotate(-32 ${12 - r0 * 0.36} ${12 - r0 * 0.42})`}
             />
           </Svg>
         );
       }
       // Streamers are always the same long curl, only the hue changes, so they
       // read as ribbons rather than as confetti squares.
       case "streamers":
         return (
           <Svg>
             <defs>{lin("st", light, dark, 0, 1)}</defs>
             <path
               d={i % 2 ? "M8,2 C19,7 5,14 16,22" : "M16,2 C5,7 19,14 8,22"}
               fill="none"
               stroke={`url(#g-st-${k})`}
               strokeWidth="3.4"
               strokeLinecap="round"
             />
             <path
               d={i % 2 ? "M8,2 C19,7 5,14 16,22" : "M16,2 C5,7 19,14 8,22"}
               fill="none"
               stroke="#fff"
               strokeOpacity=".32"
               strokeWidth=".8"
               transform="translate(-.6 0)"
             />
           </Svg>
         );
       case "diamonds":
         return (
           <Svg>
             <defs>{lin("di", light, dark, 0, 1)}</defs>
             <path d="M12,1.6 L20.6,9.2 L12,22.4 L3.4,9.2Z" fill={`url(#g-di-${k})`} />
             <path
               d="M12,1.6 L3.4,9.2 L20.6,9.2 L12,22.4Z"
               fill="none"
               stroke="#fff"
               strokeOpacity=".45"
               strokeWidth=".6"
             />
             <path d="M12,1.6 L12,9.2 L3.4,9.2Z" fill="#fff" fillOpacity=".28" />
           </Svg>
         );
       case "rain":
         return (
           <Svg>
             <defs>{lin("rn", light, dark, 0, 1)}</defs>
             <path
               d="M12,2 C12,2 5.4,9.8 5.4,14.6 C5.4,18.3 8.4,21.2 12,21.2 C15.6,21.2 18.6,18.3 18.6,14.6 C18.6,9.8 12,2 12,2Z"
               fill={`url(#g-rn-${k})`}
             />
             <ellipse cx="9.6" cy="15.2" rx="1.1" ry="1.9" fill="#fff" fillOpacity=".55" />
           </Svg>
         );
       default:
         return <>{fallback}</>;
     }
   }