/* The poster renderer: picks a design from the catalogue, or shows the
   uploaded image when the host supplied one. */

   import type { CSSProperties } from "react";

   import type { PosterDef } from "./posters";
   import { DESIGNS, Plain } from "./posterDesigns";
   import { RATIO, baseSize, fill, type Ctx } from "./posterKit";
   
   export function Poster({
     poster,
     title,
     when,
     where,
     fontClass,
     image,
     small = false,
     ratio = RATIO,
   }: {
     poster: PosterDef;
     title: string;
     when: string;
     where: string;
     fontClass: string;
     image?: string;
     small?: boolean;
     /** Override the square poster box — only for a deliberately cropped card. */
     ratio?: string;
   }) {
     const ctx: Ctx = { poster, title, when, where, fontClass, small, size: baseSize(title) };
     const design = DESIGNS[poster.id] ?? Plain;
     return (
       <div
         style={
           {
             position: "relative",
             width: "100%",
             aspectRatio: ratio,
             overflow: "hidden",
             background: poster.bg,
             color: poster.ink,
             containerType: "inline-size",
           } as CSSProperties
         }
       >
         {image ? (
           // eslint-disable-next-line @next/next/no-img-element
           <img src={image} alt="" style={{ ...fill, width: "100%", height: "100%", objectFit: "cover" }} />
         ) : (
           design(ctx)
         )}
       </div>
     );
   }