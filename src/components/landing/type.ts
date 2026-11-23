/**
 * The landing's display type, in one place.
 *
 * The marketing page is the one part of the product that is allowed to speak
 * louder than the app scale — `PAGE_TITLE` in `Container.tsx` is 24 / 28 / 32,
 * and a hero at that size would read as a page header with a paragraph under
 * it, not as a pitch. So the landing keeps its own `clamp()`s, but they live
 * here rather than in nine `className` strings: every section heading on the
 * page used to spell out its own clamp by hand, which meant a change to the
 * page's voice was nine edits that could quietly drift apart.
 *
 * All three were a step larger before (hero 2.6 → 4.9rem, sections
 * 2.2 → 3.05rem) and were crowding their own copy: at 1250px a section heading
 * stood 49px tall over a 16px paragraph. They are now about 15–18% down — still
 * clearly the marketing voice, still one clear step above the app, just not
 * shouting over the words underneath.
 *
 * The ratios matter more than the numbers, so keep them together: `HERO_TITLE`
 * is the top of the page, `PAGE_HEADING` is a standalone marketing page's title
 * (the four under `PageShell`), and `SECTION_HEADING` is every block heading
 * between them.
 */

/**
 * The hero's type at hero volume — size, leading and tracking, no family and no
 * weight. The landing hero composes it with `font-display`; the published
 * Moment page borrows the size alone, because that page draws its title in the
 * font the host chose. One clamp, so the two can't drift apart.
 */
export const HERO_SIZE =
  "text-[clamp(2.25rem,5.4vw,4.1rem)] leading-[1.02] tracking-[-0.035em]";

/** The landing hero — the largest type in the product. */
export const HERO_TITLE = `font-display ${HERO_SIZE} font-bold`;

/** A standalone marketing page's title — contact, waitlist, terms, privacy. */
export const PAGE_HEADING =
  "font-display text-[clamp(1.95rem,4.5vw,2.9rem)] font-bold leading-[1.02] tracking-[-0.035em]";

/** A section heading on the landing: features, how it works, the closing pitch. */
export const SECTION_HEADING =
  "font-display text-[clamp(1.9rem,4.2vw,2.6rem)] font-bold leading-[1.02] tracking-[-0.035em]";
