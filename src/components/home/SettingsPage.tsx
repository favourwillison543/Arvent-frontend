"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { useAuth } from "@/hooks/useAuth";
import { useAppearance } from "@/components/theme/AppearanceProvider";
import Button from "@/components/ui/Button";
import PageHeader from "@/components/ui/PageHeader";
import SectionHeader from "@/components/ui/SectionHeader";
import { READING_BODY } from "@/components/ui/Container";
import { SkeletonRows } from "@/components/ui/Skeleton";
import { EYEBROW } from "@/components/ui/type";
import type { Appearance } from "@/lib/theme/appearance";

const appearanceOptions: {
  id: Appearance;
  label: string;
  hint: string;
  swatch: string;
}[] = [
  {
    id: "light",
    label: "Light",
    hint: "Warm off-white canvas, white cards.",
    swatch: "linear-gradient(145deg, #f7f4eb 0 55%, #ffffff 55%)",
  },
  {
    id: "dark",
    label: "Dark",
    hint: "Charcoal canvas, slightly lighter cards.",
    swatch: "linear-gradient(145deg, #0c0c0e 0 55%, #17171a 55%)",
  },
  {
    id: "system",
    label: "System",
    hint: "Follow your device setting.",
    swatch: "linear-gradient(145deg, #f7f4eb 0 50%, #17171a 50%)",
  },
];

export default function SettingsPage() {
  const router = useRouter();
  const { user, isLoading, logout, isLoggingOut } = useAuth();
  const { appearance, resolved, setAppearance } = useAppearance();
  const [error, setError] = useState("");

  const signOut = async () => {
    setError("");
    try {
      await logout();
      router.replace("/");
    } catch {
      setError("We couldn’t sign you out. Please try again.");
    }
  };

  return (
    <main className="min-h-dvh bg-dashboard">
      {/* No bottom padding here: the workspace frame already reserves the mobile
          tab bar's height once (`pb-float`). Settings used to add `pb-28` on top
          of it, which parked 190px of nothing under the last card on a phone. */}
      {/* No back link: the sidebar and the phone's bottom bar both already go
          to /home, and settings was the only screen inside the workspace that
          repeated them. */}
      <PageHeader
        width="narrow"
        eyebrow="Your workspace"
        title="Settings"
        description="Manage your Arvent account and see how your workspace and invitations are styled."
      />

      <div className={`${READING_BODY} mt-7`}>
        <div className="grid gap-5 lg:grid-cols-[14rem_minmax(0,1fr)]">
          <nav
            aria-label="Settings sections"
            className="flex gap-2 overflow-x-auto lg:flex-col"
          >
            <a
              href="#account"
              className="shrink-0 rounded-field bg-surface px-4 py-3 text-sm font-semibold text-foreground"
            >
              Account
            </a>
            <a
              href="#appearance"
              className="shrink-0 rounded-field px-4 py-3 text-sm font-semibold text-muted-foreground transition hover:bg-surface hover:text-foreground"
            >
              Appearance
            </a>
            <a
              href="#workspace"
              className="shrink-0 rounded-field px-4 py-3 text-sm font-semibold text-muted-foreground transition hover:bg-surface hover:text-foreground"
            >
              Workspace
            </a>
            <a
              href="#invitations"
              className="shrink-0 rounded-field px-4 py-3 text-sm font-semibold text-muted-foreground transition hover:bg-surface hover:text-foreground"
            >
              Invitations
            </a>
          </nav>

          <div className="min-w-0 space-y-5">
            <section
              id="account"
              className="scroll-mt-6 rounded-panel border border-border bg-surface p-5 sm:p-7"
            >
              <SectionHeader
                title="Account"
                description="Your organizer profile."
              />

              {isLoading ? (
                <SkeletonRows count={3} className="mt-6" />
              ) : user ? (
                <dl className="mt-6 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-field bg-dashboard p-4">
                    <dt className={EYEBROW}>
                      Name
                    </dt>
                    <dd className="mt-1 break-words font-semibold">
                      {user.name}
                    </dd>
                  </div>
                  <div className="rounded-field bg-dashboard p-4">
                    <dt className={EYEBROW}>
                      Email
                    </dt>
                    <dd className="mt-1 break-words font-semibold">
                      {user.email}
                    </dd>
                  </div>
                </dl>
              ) : (
                <p className="mt-5 text-sm text-muted-foreground">
                  Sign in to view your organizer account details.
                </p>
              )}

              {user && (
                <div className="mt-6 border-t border-border pt-5">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => void signOut()}
                    disabled={isLoggingOut}
                  >
                    {isLoggingOut ? "Signing out…" : "Sign out"}
                  </Button>
                  {error && (
                    <p role="alert" className="mt-3 text-sm text-destructive">
                      {error}
                    </p>
                  )}
                </div>
              )}
            </section>

            <section
              id="appearance"
              className="scroll-mt-6 rounded-panel border border-border bg-surface p-5 sm:p-7"
            >
              <SectionHeader
                className="max-w-xl"
                title="Appearance"
                description="Choose how your workspace looks. This applies to your dashboard, event settings and every panel inside them. Invitations keep the design you picked for each event."
              />

              <fieldset className="mt-5">
                <legend className="text-xs font-bold uppercase tracking-[.16em] text-muted-foreground">
                  Theme
                </legend>

                <div className="mt-3 grid gap-2.5 sm:grid-cols-3">
                  {appearanceOptions.map((option) => (
                    <label
                      key={option.id}
                      className="flex cursor-pointer flex-col gap-2 rounded-panel border border-border bg-dashboard p-3 transition hover:border-muted-foreground has-[:checked]:border-foreground has-[:checked]:shadow-[3px_3px_0_var(--foreground)] has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-ring"
                    >
                      <input
                        type="radio"
                        name="appearance"
                        value={option.id}
                        checked={appearance === option.id}
                        onChange={() => setAppearance(option.id)}
                        className="sr-only"
                      />
                      <span
                        aria-hidden="true"
                        className="h-10 rounded-field border border-border"
                        style={{ background: option.swatch }}
                      />
                      <span className="text-sm font-semibold">
                        {option.label}
                      </span>
                      <span className="text-xs leading-5 text-muted-foreground">
                        {option.hint}
                      </span>
                    </label>
                  ))}
                </div>
              </fieldset>

              <p aria-live="polite" className="mt-3 text-xs text-muted-foreground">
                {resolved === "dark"
                  ? "Your workspace is using the dark theme."
                  : "Your workspace is using the light theme."}
              </p>
            </section>

            <section
              id="workspace"
              className="scroll-mt-6 rounded-panel border border-border bg-surface p-5 sm:p-7"
            >
              <SectionHeader
                title="Workspace"
                description="Warm off-white and charcoal surfaces with lime actions, in either appearance."
              />
              <div className="mt-5 flex items-center gap-3 rounded-field bg-dashboard p-4">
                <span
                  aria-hidden="true"
                  className="size-9 rounded-full"
                  style={{ background: "linear-gradient(145deg, var(--foreground) 0 45%, var(--brand) 46% 62%, var(--dashboard) 63%)" }}
                />
                <div>
                  <p className="text-sm font-semibold">Arvent workspace</p>
                  <p className="text-xs text-muted-foreground">
                    Off-white · charcoal · lime
                  </p>
                </div>
              </div>
            </section>

            <section
              id="invitations"
              className="scroll-mt-6 rounded-panel border border-border bg-surface p-5 sm:p-7"
            >
              <SectionHeader
                className="max-w-2xl"
                title="Invitations"
                description="Each event has its own background theme and poster design. Choose them separately while creating an event."
              />
              <Button
                href="/create"
                className="mt-5"
              >
                Design an invitation
              </Button>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
