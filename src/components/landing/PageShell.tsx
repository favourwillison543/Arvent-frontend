import type { ReactNode } from "react";

import Container from "@/components/ui/Container";

/**
 * The shared frame for the standalone marketing pages — contact, waitlist, terms
 * and privacy. One hero rhythm and one reading column, so they read as siblings
 * of the landing page instead of four one-off documents.
 */
export default function PageShell({
  eyebrow,
  title,
  accent,
  intro,
  children,
  wide = false,
}: {
  eyebrow?: string;
  title: string;
  accent?: string;
  intro?: string;
  children: ReactNode;
  /** Legal pages keep the narrow column; the contact and waitlist cards don't. */
  wide?: boolean;
}) {
  return (
    <div className="w-full pb-20 pt-32 sm:pb-28 sm:pt-40">
      <Container>
        <div className="mx-auto max-w-3xl text-center">
          {eyebrow && (
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">
              {eyebrow}
            </p>
          )}

          <h1 className="mt-3 font-display text-[clamp(2.2rem,5.4vw,3.6rem)] font-bold leading-[1.02] tracking-[-0.035em] text-foreground">
            {title}
            {accent && (
              <>
                {" "}
                <span className="font-accent text-[1.1em] font-normal italic tracking-normal">
                  {accent}
                </span>
              </>
            )}
          </h1>

          {intro && (
            <p className="mx-auto mt-5 max-w-xl text-base text-muted-foreground sm:text-lg">
              {intro}
            </p>
          )}
        </div>

        <div className={`mx-auto mt-12 ${wide ? "max-w-4xl" : "max-w-2xl"}`}>
          {children}
        </div>
      </Container>
    </div>
  );
}

/** One clause of a legal page: a heading and the paragraphs under it. */
export function LegalSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="border-t border-border pt-6">
      <h2 className="font-display text-xl font-bold tracking-tight">{title}</h2>
      <div className="mt-3 space-y-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
        {children}
      </div>
    </section>
  );
}
