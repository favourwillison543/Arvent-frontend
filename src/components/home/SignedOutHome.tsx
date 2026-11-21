"use client";

import Button from "@/components/ui/Button";
import { useAuthDialog } from "@/components/auth/AuthDialog";
import { HOME_WRAP } from "@/components/event-dashboard/gutters";

/**
 * `/home` without a session.
 *
 * The route used to bounce straight to the log in card, which told a first-time
 * visitor nothing about what they were being asked to join. This screen answers
 * that first — what lives here, and the two ways in — and only then offers the
 * buttons, so the workspace stays browsable without an account.
 *
 * Both buttons open the sign-in card in place: the reader stays on the
 * workspace they were looking at, and the card closes back onto it once they are
 * in. It is deliberately three pieces of type and two buttons.
 */
export default function SignedOutHome() {
  const { openAuth } = useAuthDialog();

  return (
    <div className="workspace-dashboard min-h-dvh overflow-hidden bg-dashboard">
      {/* No `pb-24` here: the workspace frame already reserves the bottom of the
          screen (`pb-float`, released to `lg:pb-12`). This screen is the signed-out
          twin of `HomeDashboard`, which carries the same frame padding and no
          bottom of its own, so the two never disagree about where the page ends. */}
      <div className={`${HOME_WRAP} relative z-10 pt-5 sm:pt-8 lg:pb-8`}>
        <section className="mt-10 max-w-2xl sm:mt-14">
          <h1 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-5xl">
            Sign in to see your events.
          </h1>

          <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            Arvent keeps the events you&apos;re hosting, their guest lists and
            your Moments in one place. Create an account to start your first
            event, or log in and pick up where you left off.
          </p>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button
              size="lg"
              onClick={() => openAuth({ mode: "register", returnTo: "/create" })}
            >
              Create an account
            </Button>

            <Button
              variant="outline"
              size="lg"
              onClick={() => openAuth({ mode: "login", returnTo: "/home" })}
            >
              Log in
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}
