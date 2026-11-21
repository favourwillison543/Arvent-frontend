import type { CSSProperties } from "react";

type Item = {
  src: string;
  pos: string;
  w: string;
  r: number;
  tone: string;
  label: string;
  hide?: boolean;
};

/**
 * Faded, tilted invitation images behind the hero.
 * Put your images in /public/backdrop/ and set `src`, e.g. "/backdrop/wedding.jpg".
 * Empty `src` shows a soft colour placeholder.
 *
 * The fade is one number — `opacity-15` on the card in the map below. It was
 * `opacity-35`, then `opacity-20`, and each step still left the pastels
 * (fuchsia, violet, teal) reading as coloured blocks behind the headline rather
 * than as a suggestion of paper. At 15% they are texture: identifiable if you
 * look, quiet behind the type. Two overlays under the card list do the rest: a
 * radial wash behind the headline and a bottom fade into the page. Raising or
 * lowering the fade is that one class.
 */
const items: Item[] = [
  {
    src: "",
    pos: "left-[-3%] top-[5%]",
    w: "w-36 sm:w-44",
    r: -12,
    tone: "from-fuchsia-300 to-orange-200",
    label: "Baby shower",
  },
  {
    src: "",
    pos: "left-[11%] top-[36%]",
    w: "w-40",
    r: 8,
    tone: "from-emerald-200 to-lime-200",
    label: "Destination wedding",
    hide: true,
  },
  {
    src: "",
    pos: "left-[-4%] top-[60%]",
    w: "w-32 sm:w-40",
    r: -8,
    tone: "from-amber-200 to-yellow-100",
    label: "Wild one",
  },
  {
    src: "",
    pos: "left-[20%] top-[68%]",
    w: "w-36",
    r: 6,
    tone: "from-sky-200 to-indigo-200",
    label: "Graduation",
    hide: true,
  },
  {
    src: "",
    pos: "right-[-3%] top-[4%]",
    w: "w-36 sm:w-44",
    r: 12,
    tone: "from-violet-300 to-pink-200",
    label: "Anniversary",
  },
  {
    src: "",
    pos: "right-[10%] top-[34%]",
    w: "w-40",
    r: -7,
    tone: "from-orange-200 to-rose-200",
    label: "Owambe",
    hide: true,
  },
  {
    src: "",
    pos: "right-[-4%] top-[58%]",
    w: "w-32 sm:w-40",
    r: 9,
    tone: "from-teal-200 to-cyan-100",
    label: "Brunch",
  },
  {
    src: "",
    pos: "right-[19%] top-[70%]",
    w: "w-36",
    r: -6,
    tone: "from-pink-200 to-amber-100",
    label: "Housewarming",
    hide: true,
  },
];

export default function HeroBackdrop() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
    >
      {items.map((it, i) => (
        <div
          key={i}
          className={`absolute ${it.pos} ${it.w} ${it.hide ? "hidden md:block" : ""}`}
          style={{ rotate: `${it.r}deg` }}
        >
          <div
            className="float-in aspect-square overflow-hidden rounded-panel opacity-15 shadow-lg ring-1 ring-black/5"
            style={{ "--d": `${i * 0.12}s` } as CSSProperties}
          >
            {it.src ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={it.src} alt="" className="size-full object-cover" />
            ) : (
              <div
                className={`grid size-full place-items-center bg-linear-to-br ${it.tone} p-3 text-center font-display text-sm font-bold text-foreground/70`}
              >
                {it.label}
              </div>
            )}
          </div>
        </div>
      ))}
      {/* keep the headline readable, fade out at the bottom */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_55%_42%_at_50%_30%,var(--background),transparent)]" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-linear-to-t from-background to-transparent" />
    </div>
  );
}
