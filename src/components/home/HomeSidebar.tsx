
"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";

type NavItem = {
  href: string;
  label: string;
  icon: () => React.JSX.Element;
};

const items: NavItem[] = [
  { href: "/home", label: "Home", icon: HomeIcon },
  { href: "/discover", label: "Explore", icon: CompassIcon },
  // Moments live on the home page (next to the events they belong to) until the
  // API grows a public Moments list, so this points at that section instead of
  // a wall that has nothing to show.
  { href: "/home#moments", label: "Moments", icon: MomentIcon },
  { href: "/create", label: "Create event", icon: PlusIcon },
];

const settingsItem: NavItem = {
  href: "/settings",
  label: "Settings",
  icon: SettingsIcon,
};

export default function HomeSidebar() {
  const [expanded, setExpanded] = useState(false);
  const [hash, setHash] = useState("");
  const pathname = usePathname();

  const { user, isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    const updateHash = () => setHash(window.location.hash);

    updateHash();

    window.addEventListener("hashchange", updateHash);

    return () => {
      window.removeEventListener("hashchange", updateHash);
    };
  }, [pathname]);

  const mobileAccountItem: NavItem = isAuthenticated
    ? settingsItem
    : { href: "/login", label: "Log in", icon: LoginIcon };

  return (
    <>
      <aside
        onMouseEnter={() => setExpanded(true)}
        onMouseLeave={() => setExpanded(false)}
        className={`organizer-sidebar sticky top-0 z-40 hidden h-dvh shrink-0 flex-col items-stretch overflow-hidden border-r border-border bg-dashboard/45 p-2 pt-5 backdrop-blur-xl transition-[width] duration-200 ease-out lg:flex dark:bg-white/[0.04] ${
          expanded ? "w-60" : "w-16"
        }`}
      >
        <Link
          href="/home"
          aria-label="Arvent home"
          className={`relative mb-10 flex h-8 shrink-0 items-center ${
            expanded ? "justify-start px-2" : "justify-center"
          }`}
        >
          {/* The brand files are baked-in SVG ink, so each appearance gets the
              cut that is readable on it. CSS picks the pair (see the `dark`
              variant in globals.css), which means the logo is already correct
              on the first paint instead of flipping after hydration. */}
          <Image
            src="/brand/arvent-mark.svg"
            alt=""
            aria-hidden="true"
            width={32}
            height={32}
            unoptimized
            className={`h-8 w-8 shrink-0 object-contain transition-opacity duration-150 dark:hidden ${
              expanded ? "opacity-0" : "opacity-100"
            }`}
          />

          <Image
            src="/brand/arvent-mark-white.svg"
            alt=""
            aria-hidden="true"
            width={32}
            height={32}
            unoptimized
            className={`hidden h-8 w-8 shrink-0 object-contain transition-opacity duration-150 dark:block ${
              expanded ? "opacity-0" : "opacity-100"
            }`}
          />

          <Image
            src="/brand/arvent-wordmark.svg"
            alt=""
            aria-hidden="true"
            width={176}
            height={28}
            unoptimized
            className={`absolute h-7 max-w-none object-contain object-left transition-all duration-150 dark:hidden ${
              expanded
                ? "left-2 w-44 opacity-100"
                : "left-1/2 w-44 -translate-x-1/2 opacity-0"
            }`}
          />

          <Image
            src="/brand/arvent-wordmark-white.svg"
            alt=""
            aria-hidden="true"
            width={176}
            height={28}
            unoptimized
            className={`absolute hidden h-7 max-w-none object-contain object-left transition-all duration-150 dark:block ${
              expanded
                ? "left-2 w-44 opacity-100"
                : "left-1/2 w-44 -translate-x-1/2 opacity-0"
            }`}
          />
        </Link>

        <nav
          className="flex flex-1 flex-col items-stretch gap-3"
          aria-label="App"
        >
          {items.map((item) => (
            <NavLink
              key={item.href}
              item={item}
              pathname={pathname}
              hash={hash}
              expanded={expanded}
              desktopRail
            />
          ))}
        </nav>

        <div className="mt-auto space-y-3 border-t border-border pt-4">
          {isAuthenticated ? (
            <>
              <NavLink
                item={settingsItem}
                pathname={pathname}
                hash={hash}
                expanded={expanded}
                desktopRail
              />

              <Link
                href="/settings"
                aria-label={`Profile: ${user?.name || "Your account"}`}
                className={`flex h-12 min-w-0 items-center rounded-field transition hover:bg-muted ${
                  expanded ? "justify-start gap-3 px-2" : "justify-center"
                }`}
              >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-foreground text-sm font-bold text-background">
                  {user?.name?.trim().slice(0, 1).toUpperCase() || "A"}
                </span>

                <span
                  className={`min-w-0 overflow-hidden whitespace-nowrap transition-opacity duration-150 ${
                    expanded ? "opacity-100" : "w-0 opacity-0"
                  }`}
                >
                  <span className="block text-xs text-muted-foreground">
                    Profile
                  </span>
                  <span className="block truncate text-sm font-semibold">
                    {user?.name || "Your account"}
                  </span>
                </span>
              </Link>
            </>
          ) : isLoading ? (
            <div
              aria-hidden="true"
              className="mx-auto size-9 animate-pulse rounded-full bg-muted"
            />
          ) : (
            <div className="grid gap-2">
              <NavLink
                item={{
                  href: "/login",
                  label: "Log in",
                  icon: LoginIcon,
                }}
                pathname={pathname}
                hash={hash}
                expanded={expanded}
                desktopRail
              />

              <NavLink
                item={{
                  href: "/register",
                  label: "Create account",
                  icon: PlusIcon,
                }}
                pathname={pathname}
                hash={hash}
                expanded={expanded}
                desktopRail
              />
            </div>
          )}
        </div>
      </aside>

      <nav
        className="organizer-bottom-nav fixed inset-x-0 bottom-0 z-40 flex justify-around border-t border-border bg-dashboard/45 px-2 py-2 backdrop-blur-xl lg:hidden dark:bg-white/[0.04]"
        aria-label="App"
      >
        {[...items, mobileAccountItem].map((item) => (
          <NavLink
            key={item.href}
            item={item}
            pathname={pathname}
            hash={hash}
            expanded
          />
        ))}
      </nav>
    </>
  );
}

function NavLink({
  item,
  pathname,
  hash,
  expanded = false,
  desktopRail = false,
}: {
  item: NavItem;
  pathname: string;
  hash: string;
  expanded?: boolean;
  desktopRail?: boolean;
}) {
  const on =
    item.href === "/home#moments"
      ? pathname === "/home" && hash === "#moments"
      : item.href === "/home"
        ? pathname === "/home" && hash !== "#moments"
        : pathname === item.href || pathname.startsWith(`${item.href}/`);

  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      aria-label={item.label}
      aria-current={on ? "page" : undefined}
      className={[
        desktopRail
          ? "flex h-12 w-full shrink-0 items-center rounded-field transition"
          : "flex size-11 shrink-0 items-center justify-center rounded-panel transition lg:h-12 lg:w-full lg:justify-start lg:gap-3 lg:rounded-field lg:px-4",
        desktopRail &&
          (expanded ? "justify-start gap-3 px-2" : "justify-center"),
        on
          ? "bg-foreground text-background"
          : "text-muted-foreground hover:bg-muted hover:text-foreground",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <Icon />

      <span
        className={
          desktopRail
            ? `overflow-hidden whitespace-nowrap transition-opacity duration-150 ${
                expanded ? "opacity-100" : "w-0 opacity-0"
              }`
            : "hidden lg:inline"
        }
      >
        {item.label}
      </span>
    </Link>
  );
}

function HomeIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-6 shrink-0"
    >
      <path d="m3 10 9-7 9 7" />
      <path d="M5 9v12h14V9" />
      <path d="M9 21v-7h6v7" />
    </svg>
  );
}

function CompassIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-6 shrink-0"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="m15.5 8.5-2.2 4.8-4.8 2.2 2.2-4.8 4.8-2.2Z" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-6 shrink-0"
    >
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function MomentIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-6 shrink-0"
    >
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <path d="M17.5 6.5h.01" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-6 shrink-0"
    >
      <circle cx="12" cy="12" r="3" />
      <path d="m19.4 15 .1.1 1.1.9-1.5 2.6-1.4-.5a8 8 0 0 1-1.7 1l-.2 1.5h-3l-.2-1.5a8 8 0 0 1-1.7-1l-1.4.5L8 16l1.1-.9a7 7 0 0 1 0-2l-1.1-.9 1.5-2.6 1.4.5a8 8 0 0 1 1.7-1l.2-1.5h3l.2 1.5a8 8 0 0 1 1.7 1l1.4-.5 1.5 2.6-1.1.9a7 7 0 0 1-.1 1.9Z" />
    </svg>
  );
}

function LoginIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-6 shrink-0"
    >
      <path d="M10 17l5-5-5-5" />
      <path d="M15 12H3" />
      <path d="M12 3h6a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3h-6" />
    </svg>
  );
}
