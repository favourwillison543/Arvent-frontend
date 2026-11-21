"use client";

import type { ReactNode } from "react";

/**
 * The one floating bar.
 *
 * The RSVP bar, the memories tray, the guest-list notice, the door's check-in
 * toast and the preview's draft bar were five different recipes at four
 * z-indexes, and only one of them knew about the mobile tab bar. This one does:
 * it lifts itself by `--float-offset` (the tab bar height when the route has
 * one, plus the home indicator), so two bars can never sit on top of each other.
 *
 * It is a pill by default — it floats over themed art and dashboard tiles that
 * are square, so it never reads as another card. `shape="panel"` is the same
 * dock for content that is not one line: the invitation's RSVP bar (a caption
 * over a row of pills) and the memories tray (a title, thumbnails and a form).
 * Those two used to compute the nav offset by hand — one guessed the fallback
 * height, the other simply sat *under* the tab bar on a phone — and both are
 * now docked by the same tokens as the pills.
 *
 * `shape` owns the radius, the width cap and the padding, because those three
 * are the shape; `className` adds structure (alignment, a sticky child) and must
 * not re-state them. Two `max-w-*` or two `p-*` utilities on one element means
 * whichever Tailwind emits later wins, which is not a decision anyone made —
 * the same trap that killed `Container`'s dead `size="narrow"`.
 *
 * What is *not* here, and why (both are in `PROGRESS.md`):
 *
 * - **Messages.** A notice is a message, not a bar. The app mounts exactly one
 *   toast stack (`AppToaster`), so the memories gallery's `role="status"` pill
 *   and the create screen's fixed `role="alert"` were both deleted in its
 *   favour — the create failure with `duration: Infinity`, because it must not
 *   fade before the reader has read it.
 * - **The preview's draft bar.** It is pinned to the *top* of `/create/preview`
 *   as a four-cell instrument (eye · back · memories · create) on a themed
 *   canvas. The dock this component shares is the bottom one.
 */
export default function FloatingBar({
  children,
  label,
  className,
  tone = "surface",
  shape = "pill",
  announce = false,
}: {
  children: ReactNode;
  /** Screen-reader name for the bar as a landmark. */
  label?: string;
  className?: string;
  /** `surface` is the neutral skin; `ink` is the inverted one used over art. */
  tone?: "surface" | "ink";
  /**
   * `pill` is one line (a confirmation, a name). `panel` is a short stack — a
   * caption over controls, or a tray — and takes the sheet radius and a wider
   * cap so it can hold the invitation's pills and the memory thumbnails.
   */
  shape?: "pill" | "panel";
  /**
   * Make the bar a live region. A check-in confirmation has to be *spoken* when
   * it appears — the two door screens relied on `role="status"` for that, so the
   * bar keeps the ability instead of forcing them to re-add their own wrapper.
   */
  announce?: boolean;
}) {
  const tones = {
    surface:
      "border-border bg-background/95 text-foreground shadow-sheet backdrop-blur-xl",
    ink: "border-transparent bg-foreground text-background shadow-sheet",
  } as const;

  const shapes = {
    pill: "max-w-[min(100%,32rem)] items-center gap-3 rounded-full px-3 py-2",
    panel: "max-w-[min(100%,48rem)] flex-col gap-3 rounded-sheet p-4",
  } as const;

  return (
    <div
      className="pointer-events-none fixed inset-x-0 bottom-float z-rail flex justify-center px-3"
      role={announce ? "status" : label ? "region" : undefined}
      aria-label={label}
    >
      <div
        className={[
          "pointer-events-auto flex w-full border",
          shapes[shape],
          tones[tone],
          className,
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {children}
      </div>
    </div>
  );
}
