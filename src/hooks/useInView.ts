"use client";

import { useCallback, useEffect, useState } from "react";

type InViewOptions = {
  /** Fraction of the element that must be visible. Defaults to `0.15`. */
  threshold?: number;
  rootMargin?: string;
  /**
   * Stop observing after the first intersection. Defaults to `true` (reveal
   * animations only ever need to fire once); pass `false` for elements that
   * must track entering *and* leaving the viewport.
   */
  once?: boolean;
};

/**
 * Tracks whether an element is in the viewport.
 *
 * Replaces the hand-rolled `IntersectionObserver` + `useRef` + `useState`
 * blocks that every reveal section used to carry.
 *
 * ```tsx
 * const { ref, inView } = useInView<HTMLElement>({ threshold: 0.1 });
 * return <section ref={ref} className={inView ? "opacity-100" : "opacity-0"} />;
 * ```
 *
 * The `ref` is a callback ref on purpose. Reveal sections are frequently
 * rendered *after* the thing they wait for — a grid that only exists once the
 * query resolves, a tab that mounts on demand — so there is no node on the
 * first render. An effect keyed on `[]` would have found `ref.current === null`,
 * bailed out, and never run again: the section would sit at opacity 0 for good,
 * invisible but still clickable. Keying the effect on the node itself arms the
 * observer the moment the element actually mounts.
 */
export function useInView<T extends HTMLElement = HTMLElement>({
  threshold = 0.15,
  rootMargin = "0px",
  once = true,
}: InViewOptions = {}) {
  const [node, setNode] = useState<T | null>(null);
  const [inView, setInView] = useState(false);

  const ref = useCallback((element: T | null) => setNode(element), []);

  useEffect(() => {
    // `node` is null until the element mounts; a browser without
    // IntersectionObserver simply never reveals (every target browser has it).
    if (!node || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);

          if (once) observer.disconnect();
        } else if (!once) {
          setInView(false);
        }
      },
      { threshold, rootMargin },
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, [node, threshold, rootMargin, once]);

  return { ref, inView };
}
