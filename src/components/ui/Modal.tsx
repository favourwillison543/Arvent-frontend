"use client";

import { ChevronLeft, X } from "lucide-react";
import { useEffect, useRef, type ReactNode } from "react";

import { CARD_TITLE } from "./type";

/**
 * The one dialog chrome.
 *
 * Every modal in the product wears it: the same wash behind, the same surface,
 * border and shadow. It used to be copied per dialog, which is exactly how the
 * blast dialog ended up at `black/70` with a blur while the More menu sat at
 * `black/55` with none, and the guest drawer on `bg-surface` while the blast
 * sheet used `bg-background`.
 */
export const DIALOG_SCRIM = "bg-black/70 backdrop-blur-sm";

export const DIALOG_SURFACE =
  "rounded-sheet border border-border bg-background text-foreground shadow-2xl";

/** Esc closes; the page behind stops scrolling while a dialog is open. */
function useDismiss(onClose: () => void) {
  const closeRef = useRef(onClose);

  useEffect(() => {
    closeRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeRef.current();
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, []);
}

/**
 * The action panels — guests, invite, blast, more — all live in this drawer.
 *
 * They used to be four different shapes: the guest list pinned to the right
 * edge, the invite sheet dead centre, the blast dialog centred but wider, and
 * the More options a floating card near the tab bar. Same card, same header,
 * same padding, right edge, top to bottom.
 */
export function EdgeSheet({
  title,
  subtitle,
  onClose,
  children,
}: {
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: ReactNode;
}) {
  useDismiss(onClose);

  return (
    <>
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className={`fixed inset-0 z-50 cursor-default ${DIALOG_SCRIM}`}
      />
      <section
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="fixed inset-y-0 right-0 z-[51] flex w-full flex-col border-l border-border bg-background text-foreground shadow-2xl sm:w-[min(94vw,720px)]"
      >
        <header className="flex items-center justify-between gap-4 border-b border-border px-5 py-4 sm:px-8">
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="grid size-10 shrink-0 place-items-center rounded-full hover:bg-muted"
          >
            <X aria-hidden="true" size={22} strokeWidth={1.8} />
          </button>
          <div className="min-w-0 text-center">
            <h2 className={`truncate ${CARD_TITLE}`}>
              {title}
            </h2>
            {subtitle && (
              <p className="truncate text-xs text-muted-foreground">{subtitle}</p>
            )}
          </div>
          <span aria-hidden="true" className="size-10 shrink-0" />
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-10 pt-5 sm:px-8">
          {children}
        </div>
      </section>
    </>
  );
}

/**
 * Centered dialog on desktop, bottom sheet on phones.
 * Esc and the backdrop close it; the page behind doesn't scroll.
 */
export function Modal({
  title,
  onClose,
  onBack,
  children,
}: {
  title: string;
  onClose: () => void;
  onBack?: () => void;
  children: ReactNode;
}) {
  useDismiss(onClose);

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center sm:p-6">
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className={`absolute inset-0 cursor-default ${DIALOG_SCRIM}`}
      />
      <section
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="relative flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-3xl bg-background text-foreground shadow-2xl ring-1 ring-border sm:max-h-[85vh] sm:max-w-xl sm:rounded-sheet"
      >
        <header className="grid grid-cols-[2.5rem_1fr_2.5rem] items-center gap-3 border-b border-border px-4 py-3">
          <button
            type="button"
            onClick={onBack ?? onClose}
            aria-label={onBack ? "Back" : "Close"}
            className="grid size-10 place-items-center rounded-full hover:bg-muted"
          >
            {onBack ? (
              <ChevronLeft aria-hidden="true" size={22} strokeWidth={1.8} />
            ) : (
              <X aria-hidden="true" size={22} strokeWidth={1.8} />
            )}
          </button>
          <h2 className={`text-center ${CARD_TITLE}`}>{title}</h2>
          <span aria-hidden="true" />
        </header>
        <div className="overflow-y-auto px-5 pb-6 pt-5">{children}</div>
      </section>
    </div>
  );
}
