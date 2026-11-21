import type { ReactNode } from "react";

/**
 * Where the product answers, and where it posts. Both the footer and the contact
 * and waitlist pages read from here, so a changed handle is one edit — and never
 * a stale link in one corner of the site.
 */
export const SUPPORT_EMAIL = "hello@arvent.app";

export type Social = {
  label: string;
  href: string;
  /** The inner shapes of a 24×24 stroked icon. */
  glyph: ReactNode;
};

export const socials: Social[] = [
  {
    label: "Instagram",
    href: "https://instagram.com/arvent",
    glyph: (
      <>
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="3.6" />
        <circle cx="17" cy="7" r="1" fill="currentColor" stroke="none" />
      </>
    ),
  },
  {
    label: "X",
    href: "https://x.com/arvent",
    glyph: <path d="M4 4l16 16M20 4L4 20" />,
  },
  {
    label: "YouTube",
    href: "https://youtube.com/@arvent",
    glyph: (
      <>
        <rect x="2.5" y="5.5" width="19" height="13" rx="4" />
        <path d="M10.5 9.5l4.5 2.5-4.5 2.5z" fill="currentColor" stroke="none" />
      </>
    ),
  },
];

/** The stroked wrapper every social glyph shares. */
export function SocialGlyph({
  children,
  size = 16,
}: {
  children: ReactNode;
  size?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}
