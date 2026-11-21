"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import { useAuth } from "@/hooks/useAuth";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import FormError from "@/components/ui/FormError";
import { describeError } from "@/lib/http/errorMessage";
import { ApiError } from "@/lib/http/errors";
import { normalizeNigerianPhone } from "@/lib/utils/phone";
import { safeReturnTo } from "@/lib/utils/returnTo";
import { authSchema, loginSchema, type AuthValues } from "@/lib/validation/auth";

const RETURN_TO_STORAGE_KEY = "arvent:auth-return-to";
const RETURN_TO_TTL_MS = 10 * 60 * 1000;

const subscribeToNothing = () => () => {};
/** False on the server and during hydration, true once the browser owns the tree. */
function useIsHydrated() {
  return useSyncExternalStore(
    subscribeToNothing,
    () => true,
    () => false,
  );
}

/** Where to land after signing in: the `returnTo` query, else a recent stored intent. */
function readReturnTo(queryDestination: string | null) {
  if (queryDestination) return safeReturnTo(queryDestination);
  if (typeof window === "undefined") return "/home";

  try {
    const storedValue = sessionStorage.getItem(RETURN_TO_STORAGE_KEY);
    const stored = storedValue
      ? (JSON.parse(storedValue) as { path?: string; expiresAt?: number })
      : null;
    if (stored?.expiresAt && stored.expiresAt > Date.now()) {
      return safeReturnTo(stored.path);
    }
  } catch {
    return "/home";
  }

  return "/home";
}

/** The fields this form renders: a server message has to land on one of them. */
const FORM_FIELDS = ["name", "email", "phone", "password"] as const;
type FormField = (typeof FORM_FIELDS)[number];

/**
 * The API fails a field once per rule, in class-validator's own wording — a
 * short password arrives as three entries ("must be longer than or equal to 10
 * characters", "must be a string", …). Zod already covers every rule the API
 * documents, so this only has to turn the leftovers into one sentence a person
 * can act on, and drop the ones that are about the request rather than the
 * value.
 */
function fieldSentence(message: string): string | undefined {
  const minimum = /must be longer than or equal to (\d+) characters/i.exec(message);
  if (minimum) return `Use at least ${minimum[1]} characters.`;

  const maximum = /must be shorter than or equal to (\d+) characters/i.exec(message);
  if (maximum) return `Use no more than ${maximum[1]} characters.`;

  if (/must be an email/i.test(message)) return "Enter a valid email address.";

  // "must be a string", "property phoneNumber should not exist": nothing about
  // the value the visitor is looking at, so nothing to show them.
  if (/must be a string|should not exist/i.test(message)) return undefined;

  return message.charAt(0).toUpperCase() + message.slice(1);
}

/** `errors: [{ field, message }]` → one message per input. */
function fieldErrors(error: unknown): Partial<Record<FormField, string>> {
  if (!(error instanceof ApiError)) return {};

  const mapped: Partial<Record<FormField, string>> = {};

  for (const entry of error.errors ?? []) {
    const field = FORM_FIELDS.find((name) => name === entry.field);

    if (!field || mapped[field]) continue;

    const sentence = fieldSentence(entry.message);
    if (sentence) mapped[field] = sentence;
  }

  return mapped;
}

type AuthFormProps = {
  mode: "login" | "register";
  /**
   * `page` draws the whole screen (`/login`, `/register`); `dialog` draws the
   * card alone, inside the sign-in modal.
   */
  presentation?: "page" | "dialog";
  /** Where to land after signing in when there is no `?returnTo=` to read. */
  returnTo?: string;
  /** Called after a successful sign-in instead of navigating away. */
  onAuthenticated?: () => void;
  /** Called after sign-up instead of routing to the log-in page. */
  onRegistered?: () => void;
  /** The sign-up hand-off notice: the account exists, the session does not. */
  justRegistered?: boolean;
};

export default function AuthForm({
  mode,
  presentation = "page",
  returnTo: fallbackReturnTo,
  onAuthenticated,
  onRegistered,
  justRegistered: justRegisteredProp = false,
}: AuthFormProps) {
  const isRegister = mode === "register";
  const params = useSearchParams();
  const router = useRouter();
  const { login, register, logout, isLoggingIn, isRegistering, isLoggingOut } = useAuth();
  const { register: registerField, handleSubmit, setError, clearErrors, formState: { errors } } = useForm<AuthValues>({
    resolver: zodResolver(isRegister ? authSchema : loginSchema) as Resolver<AuthValues>,
    defaultValues: { name: "", email: "", phone: "", password: "" },
  });
  const error = errors.root?.server?.message;
  const busy = isLoggingIn || isRegistering || isLoggingOut;
  const queryDestination = params.get("returnTo");
  /** Set by the sign-up flow: the account exists, the session does not. */
  const justRegistered =
    (justRegisteredProp || params.get("registered") === "1") && !isRegister;
  const [returnTo] = useState(() =>
    readReturnTo(queryDestination ?? fallbackReturnTo ?? null),
  );
  const returnToReady = useIsHydrated();

  useEffect(() => {
    if (!returnToReady) return;

    try {
      sessionStorage.setItem(
        RETURN_TO_STORAGE_KEY,
        JSON.stringify({
          path: returnTo,
          expiresAt: Date.now() + RETURN_TO_TTL_MS,
        }),
      );
    } catch {}

    if (!queryDestination) return;

    // Drop the one-shot `returnTo` param so a refresh doesn't replay it.
    const cleanUrl = new URL(window.location.href);
    cleanUrl.searchParams.delete("returnTo");
    window.history.replaceState(
      null,
      "",
      `${cleanUrl.pathname}${cleanUrl.search}${cleanUrl.hash}`,
    );
  }, [returnTo, returnToReady, queryDestination]);

  const submit = handleSubmit(async (values) => {
    clearErrors();
    try {
      if (isRegister) {
        await register({
          name: values.name,
          email: values.email,
          // "0803 123 4567" and "+2348031234567" are the same number; the API
          // stores E.164, so the form hands it the canonical form.
          phoneNumber: normalizeNigerianPhone(values.phone),
          password: values.password,
        });

        /*
         * Signing up does not sign in. The API starts a session on register,
         * so it is ended here: `/login` sends a signed-in visitor straight to
         * /home, and arriving there on a session nobody chose — with a password
         * typed once, unchecked — is how an account gets created on a mistyped
         * email. A 401 means there was nothing to end; any other failure is
         * already covered by the proxy expiring the rejected pair.
         *
         * The stored `returnTo` is deliberately kept: the login that follows
         * reads it, so "sign up to see this event" still ends on that event.
         */
        try {
          await logout();
        } catch {}

        // In a dialog there is no route to change: the card becomes the log-in
        // card, with the same notice the page shows.
        if (onRegistered) {
          onRegistered();
          return;
        }

        router.replace("/login?registered=1");
        router.refresh();
        return;
      }

      await login({ email: values.email, password: values.password });
      try {
        sessionStorage.removeItem(RETURN_TO_STORAGE_KEY);
      } catch {}

      // A dialog caller (the sign-in modal) decides what happens next: usually
      // closing itself and refetching whatever the expired session interrupted.
      if (onAuthenticated) {
        onAuthenticated();
        return;
      }

      router.replace(returnTo);
      router.refresh();
    } catch (cause) {
      // A field message belongs under its input; only a failure with nowhere
      // to point — a wrong password, a rate limit — goes at the top.
      const byField = fieldErrors(cause);
      const entries = Object.entries(byField) as [FormField, string][];

      for (const [field, message] of entries) {
        setError(field, { type: "server", message });
      }

      if (!entries.length) {
        setError("root.server", {
          message: describeError(
            cause,
            isRegister
              ? "We couldn't create your account. Please try again."
              : "We couldn't sign you in. Please try again.",
          ),
        });
      }
    }
  });

  const otherHref = `/${isRegister ? "login" : "register"}`;

  const card = (
            <section className="w-full max-w-xl rounded-sheet bg-surface p-6 sm:px-8 sm:py-7">
              <h1 className="mt-3 font-display text-[clamp(1.6rem,2.6vw,2rem)] font-bold leading-[1.05] tracking-[-0.035em]">
                {isRegister ? (
                  <>
                    Make room for a{" "}
                    <span className="font-accent text-[1.1em] font-normal italic tracking-normal">
                      good time.
                    </span>
                  </>
                ) : (
                  <>
                    Welcome{" "}
                    <span className="font-accent text-[1.1em] font-normal italic tracking-normal">
                      back.
                    </span>
                  </>
                )}
              </h1>

              <p className="mt-2 text-sm text-muted-foreground">
                {isRegister
                  ? "Create your organizer account to design and share your first invitation."
                  : "Sign in to keep planning your event."}
              </p>

              {justRegistered ? (
                <p
                  role="status"
                  className="mt-4 rounded-field border border-status-going/40 bg-status-going/10 px-4 py-3 text-sm text-foreground"
                >
                  Account created. Log in with the email and password you just
                  chose.
                </p>
              ) : null}

              <form onSubmit={submit} noValidate aria-busy={busy} className="mt-4 space-y-3">
                {isRegister ? (
                  <>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Input
                        label="Your name"
                        autoComplete="name"
                        {...registerField("name")}
                        required
                        error={errors.name?.message}
                      />
                      <Input
                        label="Phone number"
                        type="tel"
                        autoComplete="tel"
                        {...registerField("phone")}
                        required
                        error={errors.phone?.message}
                      />
                    </div>
                    <Input
                      label="Email"
                      type="email"
                      autoComplete="email"
                      {...registerField("email")}
                      required
                      error={errors.email?.message}
                    />
                  </>
                ) : (
                  <Input
                    label="Email"
                    type="email"
                    autoComplete="email"
                    {...registerField("email")}
                    required
                    error={errors.email?.message}
                  />
                )}
                <Input
                  label="Password"
                  type="password"
                  autoComplete={isRegister ? "new-password" : "current-password"}
                  required
                  {...registerField("password")}
                  error={errors.password?.message}
                  hint={isRegister ? "Use at least 10 characters." : undefined}
                />
                <FormError message={error} className="rounded-field border border-destructive/40 bg-destructive/10 px-4 py-3" />
                <Button
                  type="submit"
                  fullWidth
                  size="lg"
                  disabled={busy || !returnToReady}
                >
                  {busy ? (
                    <span className="inline-flex items-center gap-2">
                      <span
                        aria-hidden="true"
                        className="size-4 animate-spin rounded-full border-2 border-current/30 border-t-current"
                      />
                      {isRegistering || isLoggingOut ? "Creating account…" : "Logging in…"}
                    </span>
                  ) : isRegister ? (
                    "Create your account"
                  ) : (
                    "Log in"
                  )}
                </Button>
              </form>

              <p className="mt-4 text-center text-sm text-muted-foreground">
                {isRegister ? "Already have an account?" : "New to Arvent?"}{" "}
                <Link
                  href={otherHref}
                  className="font-semibold text-foreground underline underline-offset-4"
                >
                  {isRegister ? "Log in" : "Sign up"}
                </Link>
              </p>

              <p className="mt-5 text-center font-display text-sm font-bold tracking-[-0.02em] text-muted-foreground">
                One link. Know who&apos;s{" "}
                <span className="font-accent text-[1.1em] font-normal italic tracking-normal">
                  actually coming.
                </span>
              </p>
            </section>
  );

  /*
   * A dialog draws the card and nothing else. The sign-in modal is opened from
   * the navbar, from a protected action, or when a session expires mid-edit:
   * the surface behind it already carries a wordmark and a way back, so a second
   * header inside the dialog would be the same link twice on one screen.
   */
  if (presentation === "dialog") {
    return <div className="w-full">{card}</div>;
  }

  return (
    // overflow-clip (not overflow-hidden) so the washes are still clipped
    // but <main> doesn't become a scroll container, which would break sticky.
    <main className="organizer-workspace relative h-dvh overflow-clip bg-background text-foreground">
      {/* soft color washes, same family as the landing page */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-32 -top-28 size-96 rounded-full bg-[#f3a6ff]/30 blur-[90px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-36 left-[8%] h-80 w-96 rounded-full bg-[#ffd27a]/35 blur-[95px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 top-1/4 size-96 rounded-full bg-[#ff7ab8]/25 blur-[100px]"
      />

      <div className="relative mx-auto h-full min-h-0 w-full max-w-page">
        <div className="flex h-full min-h-0 flex-col overflow-y-auto px-5 py-4 [scrollbar-width:none] sm:px-8 lg:px-14 lg:py-6 [&::-webkit-scrollbar]:hidden">
          <header className="flex shrink-0 items-center justify-between gap-4">
            <Link href="/" aria-label="Arvent home" className="flex w-fit items-center">
              <Image
                src="/brand/arvent-wordmark.svg"
                alt="Arvent"
                width={176}
                height={28}
                unoptimized
                priority
                className="h-7 w-auto dark:hidden"
              />
              <Image
                src="/brand/arvent-wordmark-white.svg"
                alt=""
                aria-hidden="true"
                width={176}
                height={28}
                unoptimized
                priority
                className="hidden h-7 w-auto dark:block"
              />
            </Link>
            <Link
              href="/"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
            >
              Back to home
            </Link>
          </header>

          <div className="flex flex-1 items-center justify-center py-2">{card}</div>
        </div>
      </div>
    </main>
  );
}
