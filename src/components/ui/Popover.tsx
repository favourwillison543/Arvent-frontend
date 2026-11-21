"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { CSSProperties, ReactNode, RefObject } from "react";
import { createPortal } from "react-dom";

/** Inline style that can also carry the theme's custom properties. */
type MenuStyle = CSSProperties & Record<`--${string}`, string>;

const HIDDEN: MenuStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  visibility: "hidden",
};

type Props = {
  /** The control the menu hangs off. Read inside effects and handlers only. */
  anchor: RefObject<HTMLElement | null>;
  open: boolean;
  onClose: () => void;
  /** Which edge of the anchor the menu lines up with. */
  align?: "start" | "end";
  minWidth?: number;
  label?: string;
  children: ReactNode;
};

/**
 * A menu anchored to a control.
 *
 * It renders into `document.body` because the create form and both rails live
 * in columns that clip and scroll: a menu positioned `absolute` inside them is
 * cut off at the column's edge, and on a short screen it never reaches the
 * control's options. Fixed positioning measured from the anchor's rect keeps the
 * menu attached to the control wherever that control sits.
 *
 * It is also why the app's dropdowns stopped being `<select>`s: the OS paints
 * `<option>` in its own palette, so on a themed canvas the open list came up
 * white-on-white or black-on-black and no CSS in `.ev` could reach it. This menu
 * is the same glass panel as the rails.
 *
 * Mounted only while open (see `Menu`), so the measurement state never survives
 * a close and a reopen can't flash at the previous control's coordinates.
 */
export default function Popover({
  anchor,
  open,
  onClose,
  align,
  minWidth,
  label,
  children,
}: Props) {
  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <Menu
      anchor={anchor}
      onClose={onClose}
      align={align}
      minWidth={minWidth}
      label={label}
    >
      {children}
    </Menu>,
    document.body,
  );
}

function Menu({
  anchor,
  onClose,
  align = "start",
  minWidth = 0,
  label,
  children,
}: Omit<Props, "open">) {
  const menu = useRef<HTMLDivElement>(null);
  const [style, setStyle] = useState<MenuStyle>(HIDDEN);

  // The anchor is passed in rather than read here: a callback that reads
  // `ref.current` cannot be memoised (the React compiler cannot prove the ref is
  // stable), so the caller hands over the element at the moment it is needed.
  const place = useCallback(
    (el: HTMLElement) => {
      const rect = el.getBoundingClientRect();
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const gap = 6;
      const pad = 8;

      // `visibility: hidden` still lays the menu out, so the first measure is
      // the real one — no flash, no second pass.
      const width = Math.max(
        menu.current?.offsetWidth ?? 0,
        minWidth,
        rect.width,
      );
      const height = menu.current?.offsetHeight ?? 0;

      let left = align === "end" ? rect.right - width : rect.left;
      left = Math.min(Math.max(pad, left), Math.max(pad, vw - width - pad));

      const below = vh - rect.bottom - gap - pad;
      const above = rect.top - gap - pad;
      // Flip above the control when there is more room up there than below — the
      // rail's "Preview" and the form's last rows are both near the fold.
      const flip = height > below && above > below;

      const tokens = getComputedStyle(el);
      const root = getComputedStyle(document.documentElement);
      // Only literals are usable: a token that is itself `var(--x)` would either
      // resolve in the wrong scope or, copied onto the menu, point at itself.
      const literal = (source: CSSStyleDeclaration, name: string) => {
        const value = source.getPropertyValue(name).trim();
        return value && !value.startsWith("var(") ? value : "";
      };

      const ink =
        literal(tokens, "--ink") ||
        tokens.color ||
        literal(root, "--foreground");
      const soft =
        literal(tokens, "--soft") || literal(root, "--muted-foreground");
      const line = literal(tokens, "--line") || literal(root, "--border");
      const panel =
        literal(tokens, "--panel") ||
        literal(root, "--surface") ||
        literal(root, "--background");

      setStyle({
        position: "fixed",
        top: flip ? Math.max(pad, rect.top - gap - height) : rect.bottom + gap,
        left,
        minWidth: width,
        maxHeight: Math.max(140, flip ? above : below),
        visibility: "visible",
        background: panel,
        color: ink,
        borderColor: line,
        // The menu is in `document.body`, outside the themed canvas, so the
        // utilities inside it (`bg-foreground/10` hover, `border-border`, the
        // selected day's `text-background`) would resolve against the app's
        // palette. Re-declaring the canvas tokens here hands the theme down.
        "--foreground": ink,
        "--muted-foreground": soft,
        "--border": line,
        "--background": panel,
        "--surface": panel,
      });
    },
    [align, minWidth],
  );

  // Measure on mount — and mount is the only time it has to happen, because the
  // menu is only ever rendered while it is open.
  useEffect(() => {
    const el = anchor.current;
    if (el) place(el);
  }, [anchor, place]);

  useEffect(() => {
    const follow = () => {
      const el = anchor.current;
      if (el) place(el);
    };

    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (menu.current?.contains(target) || anchor.current?.contains(target))
        return;
      onClose();
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.stopPropagation();
      onClose();
    };
    // Follow the anchor instead of closing on scroll: the form scrolls behind a
    // sticky poster, and a menu that vanishes mid-scroll reads as a dead click.
    const onScroll = (event: Event) => {
      if (menu.current?.contains(event.target as Node)) return;
      follow();
    };

    document.addEventListener("pointerdown", onPointerDown, true);
    document.addEventListener("keydown", onKeyDown, true);
    document.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", follow);

    return () => {
      document.removeEventListener("pointerdown", onPointerDown, true);
      document.removeEventListener("keydown", onKeyDown, true);
      document.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", follow);
    };
  }, [anchor, onClose, place]);

  return (
    <div
      ref={menu}
      role="dialog"
      aria-label={label}
      style={style}
      className="z-[95] overflow-y-auto overscroll-contain rounded-panel border p-1 shadow-[0_20px_55px_rgba(0,0,0,0.35)] backdrop-blur-xl [scrollbar-width:thin]"
    >
      {children}
    </div>
  );
}

