"use client";

import { ArrowRight } from "lucide-react";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import Button from "@/components/ui/Button";
import Container from "@/components/ui/Container";
import { Avatar } from "@/components/ui/Avatar";
import { useAuth } from "@/hooks/useAuth";
import { useAuthDialog } from "@/components/auth/AuthDialog";

/*
 * The public links. `Moments` is a real page: the four kinds, the way into the
 * editor, and — for somebody signed in — every Moment they have made. It is not
 * a wall of other people's cards: the contract's `GET /moments` lists only the
 * caller's own Moments, so the page never pretends otherwise.
 */
const links = [
  { href: "/home", label: "My events" },
  { href: "/moments", label: "Moments" },
  { href: "/#templates", label: "Templates" },
  { href: "/#how-it-works", label: "How it works" },
];

export default function Navbar() {
  const pathname = usePathname();
  const onMoments = pathname === "/moments" || pathname.startsWith("/moments/") || pathname.startsWith("/m/");
  const { user, isAuthenticated } = useAuth();
  const { openAuth } = useAuthDialog();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  // The create button goes straight to the editor. Whether somebody needs an
  // account is decided by the create page (at save/publish), not by this bar.
  const createHref = onMoments ? "/moments/new" : "/create";
  const createLabel = onMoments ? "Create Moment" : "Create event";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock page scroll and allow Esc to close while the menu is open
  useEffect(() => {
    if (!menuOpen) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };

    const previous = document.body.style.overflow;

    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  const closeIcon = (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 font-sans transition-all duration-300 ${
          scrolled
            ? "border-b border-border bg-background/85 py-3 shadow-sm backdrop-blur-md"
            : "border-b border-transparent bg-transparent py-5"
        }`}
      >
        <Container className="flex items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            className="flex w-fit items-center"
            aria-label="Arvent home"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/brand/arvent-wordmark.svg"
              alt="Arvent"
              className="h-7 w-28 sm:h-8"
            />
          </Link>

          {/* Desktop navigation */}
          <nav
            className="hidden items-center gap-8 text-sm font-semibold text-muted-foreground lg:flex"
            aria-label="Main"
          >
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="transition hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop actions.
              Signed out: log in, plus a Create button that goes to the editor.
              Signed in: Home, Create, and the avatar. */}
          <div className="hidden items-center gap-2 lg:flex">
            {isAuthenticated && user ? (
              <>
                <Link
                  href="/home"
                  className="rounded-full px-1 py-2 text-sm font-semibold text-muted-foreground transition hover:text-foreground"
                >
                  Home
                </Link>

                <Button size="sm" href={createHref}>
                  {createLabel}
                </Button>

                <Link
                  href="/settings"
                  aria-label={`${user.name} — account settings`}
                  className="rounded-full ring-offset-2 ring-offset-background transition hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                >
                  <Avatar name={user.name} size={28} />
                </Link>
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" onClick={() => openAuth({ mode: "login" })}>
                  Log in
                </Button>

                <Button size="sm" href={createHref}>
                  {createLabel}
                </Button>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            className="group flex h-10 w-10 items-center justify-center rounded-full border-2 border-foreground bg-foreground text-background transition-transform duration-300 hover:-translate-y-0.5 active:scale-95 lg:hidden"
          >
            {/* Two bars of different length that swap on hover */}
            <span aria-hidden className="relative block h-3 w-5">
              <span className="absolute right-0 top-0 h-[2px] w-5 rounded-full bg-current transition-all duration-300 group-hover:w-3" />
              <span className="absolute bottom-0 right-0 h-[2px] w-3 rounded-full bg-current transition-all duration-300 group-hover:w-5" />
            </span>
          </button>
        </Container>
      </header>

      {/*
        Slide-out menu. It lives outside <header> on purpose: the header's
        backdrop-blur would otherwise trap "fixed" children inside it.
      */}
      <div className="md:hidden">
        {/* Dim backdrop */}
        <div
          aria-hidden
          onClick={() => setMenuOpen(false)}
          className={`fixed inset-0 z-[55] bg-black/30 transition-opacity duration-300 ${
            menuOpen ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
        />

        {/* Panel */}
        <aside
          id="mobile-menu"
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
          aria-hidden={!menuOpen}
          className={`fixed inset-y-0 right-0 z-[60] flex w-[86%] max-w-sm flex-col bg-background font-sans transition-[transform,visibility] duration-300 ease-out ${
            menuOpen ? "visible translate-x-0" : "invisible translate-x-full"
          }`}
        >
          {/* Top bar */}
          <div className="flex items-center justify-between px-5 py-5">
            <Link
              href="/"
              onClick={() => setMenuOpen(false)}
              aria-label="Arvent home"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/brand/arvent-wordmark.svg"
                alt="Arvent"
                className="h-7 w-28"
              />
            </Link>

            <button
              type="button"
              onClick={() => setMenuOpen(false)}
              aria-label="Close menu"
              tabIndex={menuOpen ? 0 : -1}
              className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-foreground bg-foreground text-background transition-transform duration-300 hover:rotate-90 active:scale-95"
            >
              {closeIcon}
            </button>
          </div>

          {/* Links */}
          <nav
            className="flex flex-1 flex-col px-5 pt-4"
            aria-label="Mobile navigation"
          >
            {links.map((link, i) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                tabIndex={menuOpen ? 0 : -1}
                className={`flex items-center justify-between border-b border-border py-5 font-display text-2xl font-semibold tracking-tight text-foreground transition-all duration-500 motion-reduce:transition-none ${
                  menuOpen
                    ? "translate-x-0 opacity-100"
                    : "translate-x-6 opacity-0"
                }`}
                style={{
                  transitionDelay: menuOpen ? `${120 + i * 70}ms` : "0ms",
                }}
              >
                {link.label}
                <span aria-hidden className="text-base text-muted-foreground">
                  <ArrowRight className="size-4" aria-hidden />
                </span>
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div
            className={`flex flex-col gap-3 px-5 pb-8 pt-6 transition-all duration-500 motion-reduce:transition-none [&>a]:w-full [&>a]:justify-center ${
              menuOpen ? "translate-x-0 opacity-100" : "translate-x-6 opacity-0"
            }`}
            style={{ transitionDelay: menuOpen ? "360ms" : "0ms" }}
          >
            {isAuthenticated && user ? (
              <>
                <Button href={createHref} onClick={() => setMenuOpen(false)}>
                  {createLabel}
                </Button>

                <Button
                  href="/home"
                  variant="ghost"
                  onClick={() => setMenuOpen(false)}
                >
                  Home
                </Button>

                <Link
                  href="/settings"
                  onClick={() => setMenuOpen(false)}
                  tabIndex={menuOpen ? 0 : -1}
                  className="flex items-center justify-center gap-2 rounded-full border-2 border-border py-2 text-sm font-semibold text-foreground"
                >
                  <Avatar name={user.name} size={28} />
                  {user.name}
                </Link>
              </>
            ) : (
              <>
                <Button href={createHref} onClick={() => setMenuOpen(false)}>
                  {createLabel}
                </Button>

                <Button
                  fullWidth
                  variant="ghost"
                  onClick={() => {
                    setMenuOpen(false);
                    openAuth({ mode: "login" });
                  }}
                >
                  Log in
                </Button>
              </>
            )}
          </div>
        </aside>
      </div>
    </>
  );
}