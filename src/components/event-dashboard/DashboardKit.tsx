"use client";

import type { ReactNode } from "react";

export function Glyph({ name, size = 22 }: { name: string; size?: number }) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true as const,
  };
  const paths: Record<string, ReactNode> = {
    home: <path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" />,
    explore: <><circle cx="12" cy="12" r="9" /><path d="m15.5 8.5-2 5-5 2 2-5z" /></>,
    plus: <path d="M12 5v14M5 12h14" />,
    card: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m4 7 8 6 8-6" /></>,
    messages: <><path d="M21 11.5a8.4 8.4 0 0 1-9 8.3 9 9 0 0 1-4-.9L3 21l1.8-4.1A8.2 8.2 0 1 1 21 11.5Z" /><path d="M8 11h8M8 14h5" /></>,
    bell: <><path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" /></>,
    settings: <><circle cx="12" cy="12" r="3" /><path d="m19.4 15 .1.1 1.4 1.1-1.4 2.4-1.7-.7a7.8 7.8 0 0 1-1.7 1l-.3 1.8H11l-.3-1.8a7.8 7.8 0 0 1-1.7-1l-1.7.7-1.4-2.4L7.3 15a7.8 7.8 0 0 1 0-2l-1.4-1.1 1.4-2.4 1.7.7a7.8 7.8 0 0 1 1.7-1l.3-1.8h2.8l.3 1.8a7.8 7.8 0 0 1 1.7 1l1.7-.7 1.4 2.4-1.4 1.1a7.8 7.8 0 0 1-.1 2Z" /></>,
    edit: <><path d="m14 5 5 5M4 20l4-.8L19 8a2.1 2.1 0 0 0-3-3L5 16z" /></>,
    blast: <><path d="M4 14v-4l15-6v16L4 14Z" /><path d="m7 15 2 6h4l-2.5-5M21 9l2-2M21 15l2 2" /></>,
    invite: <><circle cx="9" cy="8" r="4" /><path d="M2 21v-2a7 7 0 0 1 14 0v2M19 8v8M15 12h8" /></>,
    more: <><circle cx="5" cy="12" r="1" /><circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /></>,
    menu: <path d="M3 6h18M3 12h18M3 18h18" />,
    link: <><path d="M10 13a5 5 0 0 0 7.1 0l3-3a5 5 0 0 0-7.1-7.1l-1.7 1.7" /><path d="M14 11a5 5 0 0 0-7.1 0l-3 3a5 5 0 0 0 7.1 7.1l1.7-1.7" /></>,
    close: <path d="m6 6 12 12M18 6 6 18" />,
    back: <path d="m15 5-7 7 7 7" />,
    search: <><circle cx="10.8" cy="10.8" r="6.8" /><path d="m16 16 5 5" /></>,
    image: <><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="m21 15-5-5L5 21" /></>,
  };
  return <svg {...common}>{paths[name] ?? paths.more}</svg>;
}

/* The dialog itself lives in the shared kit; re-exported so dashboard code keeps
   one import path. */
export { Modal } from "@/components/ui/Modal";

/** Prev / Next pager. `page` starts at 0. Renders nothing when everything fits on one page. */
export function Pager({
  page,
  size,
  total,
  onPage,
}: {
  page: number;
  size: number;
  total: number;
  onPage: (page: number) => void;
}) {
  if (total <= size) return null;
  const pages = Math.ceil(total / size);
  const from = page * size + 1;
  const to = Math.min(total, (page + 1) * size);
  const btn =
    "rounded-full bg-muted px-4 py-2 text-sm font-semibold text-foreground transition hover:bg-border disabled:pointer-events-none disabled:opacity-30";
  return (
    <nav aria-label="Pagination" className="mt-4 flex items-center justify-between gap-3">
      <p className="text-sm text-muted-foreground">
        {from}–{to} of {total}
      </p>
      <div className="flex items-center gap-2">
        <button type="button" className={btn} disabled={page === 0} onClick={() => onPage(page - 1)}>
          ‹ Prev
        </button>
        <span className="min-w-12 text-center text-sm font-semibold">
          {page + 1} / {pages}
        </span>
        <button type="button" className={btn} disabled={page >= pages - 1} onClick={() => onPage(page + 1)}>
          Next ›
        </button>
      </div>
    </nav>
  );
}