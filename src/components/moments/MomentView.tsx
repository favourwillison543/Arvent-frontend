import { ArrowRight } from "lucide-react";
import Link from "next/link";

import type { CSSProperties, ReactNode } from "react";

import ThemeShell from "@/components/create-event/ThemeShell";
import { defaultDraft } from "@/components/create-event/draft";
import { fonts } from "@/components/create-event/themes";
import { Avatar } from "@/components/ui/Avatar";

import { dotDate, kinds, longDate, type Moment } from "./data";
import MomentCard from "./MomentCard";

const CSS = `
.mm-a{animation:mm-up .9s cubic-bezier(.2,.8,.2,1) both}
@keyframes mm-up{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:none}}
@media (prefers-reduced-motion:reduce){.mm-a{animation:none}}
`;

/*
  The page people receive. It sits inside ThemeShell, which supplies the
  theme background, the readable text color and the effect.
*/
export default function MomentView({
  moment: m,
  stat,
  inviteHref,
  children,
}: {
  moment: Moment;
  stat?: number | null;
  inviteHref?: string;
  children?: ReactNode;
}) {
  const font = fonts.find((f) => f.id === m.fontId) ?? fonts[0];
  const meta = kinds[m.kind];

  const title = m.title.trim() || meta.titlePlaceholder;
  const message = m.message.trim() || meta.messagePlaceholder;
  const when = m.kind === "save-the-date" ? dotDate(m.date) : longDate(m.date);
  const line = [when, m.place].filter(Boolean).join(" · ");

  let step = 0;
  const delay = (): CSSProperties => ({ animationDelay: `${100 + step++ * 130}ms` });

  return (
    <ThemeShell draft={{ ...defaultDraft, themeId: m.themeId, effectId: m.effectId }}>
      <style>{CSS}</style>

      <main className="mx-auto flex min-h-dvh max-w-md flex-col items-center px-5 pb-14 pt-10 text-center">
        {m.from && (
          <div className="mm-a flex items-center gap-2.5" style={delay()}>
            <span className="ev-muted text-sm">From</span>
            <Avatar name={m.from} size={28} />
            <span className="text-sm font-semibold">{m.from}</span>
          </div>
        )}

        <div className="mm-a mt-8 w-full" style={delay()}>
          <MomentCard moment={m} />
        </div>

        <div className="mt-10 w-full space-y-4">
          <p className="mm-a ev-muted text-xs font-semibold uppercase tracking-[0.32em]" style={delay()}>
            {meta.eyebrow}
          </p>

          <h1
            className={`mm-a break-words text-4xl leading-[1.02] tracking-[-0.02em] sm:text-5xl ${font.className}`}
            style={delay()}
          >
            {title}
          </h1>

          {line && (
            <p className="mm-a text-base font-semibold" style={delay()}>
              {line}
            </p>
          )}

          <p
            className="mm-a mx-auto max-w-sm whitespace-pre-line text-base leading-relaxed opacity-90"
            style={delay()}
          >
            {message}
          </p>

          {stat ? (
            <div className="mm-a ev-card mx-auto inline-block px-5 py-4" style={delay()}>
              <b className="font-display text-4xl">{stat}</b>
              <span className="ev-muted ml-2 text-sm">people celebrated with us</span>
            </div>
          ) : null}

          {inviteHref && (
            <div className="mm-a" style={delay()}>
              <a href={inviteHref} className="ev-cta inline-flex items-center gap-2">
                Open the invitation <ArrowRight className="size-4" aria-hidden />
              </a>
            </div>
          )}

          {children && (
            <div className="mm-a flex justify-center pt-2" style={delay()}>
              {children}
            </div>
          )}
        </div>

        <Link href="/" className="ev-faint mt-12 text-2xs font-semibold uppercase tracking-[0.2em]">
          Made with Arvent
        </Link>
      </main>
    </ThemeShell>
  );
}
