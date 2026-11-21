"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { X } from "lucide-react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";

import { SESSION_EXPIRED_EVENT } from "@/lib/auth/sessionEvents";
import { Spinner } from "@/components/ui/Spinner";
import { DIALOG_SCRIM } from "@/components/ui/Modal";

/**
 * The card is a form library and a schema; nobody needs them until the dialog
 * opens. Loading it on demand keeps the landing page's first paint free of
 * react-hook-form.
 */
const AuthForm = dynamic(() => import("./AuthForm"), {
  ssr: false,
  loading: () => (
    <div className="grid min-h-40 place-items-center">
      <Spinner label="Loading the form" />
    </div>
  ),
});

export type AuthMode = "login" | "register";

type OpenOptions = {
  mode?: AuthMode;
  /** Where to go once signed in. Omit to stay on the page. */
  returnTo?: string;
  /** A line above the form explaining why it opened. */
  notice?: string;
};

type DialogState = {
  open: boolean;
  mode: AuthMode;
  returnTo?: string;
  notice?: string;
  justRegistered: boolean;
};

const AuthDialogContext = createContext<{
  openAuth: (options?: OpenOptions) => void;
  closeAuth: () => void;
  /** Whether the card is on screen — a route that only exists to open it needs this. */
  isOpen: boolean;
} | null>(null);

/**
 * Signing in is a moment, not a destination.
 *
 * Every "Log in" used to be a page, so a visitor reading an invitation or half
 * way through creating an event lost their place to reach one. The dialog draws
 * the same card the page does (`AuthForm presentation="dialog"`), over whatever
 * they were looking at, and closes back onto it.
 */
export function AuthDialogProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<DialogState>({
    open: false,
    mode: "login",
    justRegistered: false,
  });
  const router = useRouter();
  const pathname = usePathname();
  const queryClient = useQueryClient();

  /**
   * The expiry dialog is offered once per page view.
   *
   * A refresh that cannot be renewed is not one event but a state: every probe
   * and every background read fails the same way, so without this the dialog
   * came back a minute after it was closed. Dismissing it is an answer; asking
   * again is noise. A successful sign-in, or an explicit "Log in", re-arms it.
   */
  const askedForExpiry = useRef(false);

  /** The card is already asking for a log in; an expiry has nothing to add. */
  const openRef = useRef(state.open);
  useEffect(() => {
    openRef.current = state.open;
  }, [state.open]);

  const openAuth = useCallback((options: OpenOptions = {}) => {
    askedForExpiry.current = false;
    setState({
      open: true,
      mode: options.mode ?? "login",
      returnTo: options.returnTo,
      notice: options.notice,
      justRegistered: false,
    });
  }, []);

  const closeAuth = useCallback(() => {
    setState((current) => ({ ...current, open: false }));
  }, []);

  /*
   * A session that could not be renewed says so once, and the answer is a log
   * in right here — not a redirect that throws away the half-typed event.
   * A card that is already on screen is already asking, so it is left alone:
   * the expiry line would replace whatever it is saying (a failed log-in, a
   * half-typed code) with a claim about a session that is already gone.
   */
  const onAuthPage = pathname === "/login" || pathname.startsWith("/login/");

  useEffect(() => {
    const onExpired = () => {
      if (onAuthPage || openRef.current || askedForExpiry.current) return;

      askedForExpiry.current = true;
      setState({
        open: true,
        mode: "login",
        notice: "Your session expired. Log in again and we’ll pick up right here.",
        justRegistered: false,
      });
    };

    window.addEventListener(SESSION_EXPIRED_EVENT, onExpired);
    return () => window.removeEventListener(SESSION_EXPIRED_EVENT, onExpired);
  }, [onAuthPage]);

  // Esc closes, and the page behind the card does not scroll while it is open.
  useEffect(() => {
    if (!state.open) return;

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeAuth();
    };

    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [state.open, closeAuth]);

  const api = useMemo(
    () => ({ openAuth, closeAuth, isOpen: state.open }),
    [openAuth, closeAuth, state.open],
  );

  /** The dialog can ask for the other card without a route: sign-up ends on log-in. */
  const switchToLogin = useCallback(() => {
    setState((current) => ({
      ...current,
      mode: "login",
      notice: undefined,
      justRegistered: true,
    }));
  }, []);

  const { returnTo } = state;

  const signedIn = useCallback(() => {
    askedForExpiry.current = false;
    setState((current) => ({ ...current, open: false }));
    // Everything cached was fetched as the previous visitor.
    void queryClient.invalidateQueries();

    if (returnTo) router.push(returnTo);
    else router.refresh();
  }, [returnTo, queryClient, router]);

  return (
    <AuthDialogContext.Provider value={api}>
      {children}

      {state.open && (
        <div className="fixed inset-0 z-[70] flex items-end justify-center p-3 sm:items-center sm:p-6">
          <button
            type="button"
            aria-label="Close"
            onClick={closeAuth}
            className={`absolute inset-0 cursor-default ${DIALOG_SCRIM}`}
          />

          <div
            role="dialog"
            aria-modal="true"
            aria-label={state.mode === "register" ? "Create your account" : "Log in"}
            className="relative flex max-h-[92svh] w-full max-w-xl flex-col overflow-y-auto rounded-t-sheet border border-border bg-background text-foreground shadow-2xl sm:rounded-sheet"
          >
            <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-3">
              {/* The wordmark, not the name typed out: the card is the brand's. */}
              <Image
                src="/brand/arvent-wordmark.svg"
                alt="Arvent"
                width={176}
                height={28}
                unoptimized
                className="h-6 w-auto dark:hidden"
              />
              <Image
                src="/brand/arvent-wordmark-white.svg"
                alt=""
                aria-hidden="true"
                width={176}
                height={28}
                unoptimized
                className="hidden h-6 w-auto dark:block"
              />
              <button
                type="button"
                onClick={closeAuth}
                aria-label="Close"
                className="grid size-10 place-items-center rounded-full text-muted-foreground transition hover:bg-muted hover:text-foreground"
              >
                <X aria-hidden="true" size={20} strokeWidth={1.8} />
              </button>
            </div>

            {state.notice && (
              <p
                role="status"
                className="border-b border-border bg-muted/60 px-5 py-3 text-sm leading-relaxed text-foreground"
              >
                {state.notice}
              </p>
            )}

            {/* The card, not the page: same fields, same validation, no chrome. */}
            <div className="px-5 py-5 [&_section]:max-w-none [&_section]:rounded-none [&_section]:bg-transparent [&_section]:p-0">
              <AuthForm
                mode={state.mode}
                presentation="dialog"
                returnTo={state.returnTo}
                justRegistered={state.justRegistered}
                onRegistered={switchToLogin}
                onAuthenticated={signedIn}
              />
            </div>
          </div>
        </div>
      )}
    </AuthDialogContext.Provider>
  );
}

/** Open the sign-in card from anywhere under the provider. */
export function useAuthDialog() {
  const context = useContext(AuthDialogContext);

  if (!context) {
    throw new Error("useAuthDialog must be used inside <AuthDialogProvider>");
  }

  return context;
}
