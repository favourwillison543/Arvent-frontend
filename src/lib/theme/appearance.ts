/* Organizer appearance preference: the stored choice and how it resolves.
   Kept framework-free so the same rules feed the inline bootstrap script, the
   provider and any future server render. */

export type Appearance = "light" | "dark" | "system";
export type ResolvedAppearance = "light" | "dark";

export const APPEARANCE_COOKIE = "arvent-appearance";

/** Arvent is light-first: a first-time visitor gets the light workspace. */
export const DEFAULT_APPEARANCE = "light" as const satisfies Appearance;

const APPEARANCES: readonly Appearance[] = ["light", "dark", "system"];

export function isAppearance(value: unknown): value is Appearance {
  return (
    typeof value === "string" && APPEARANCES.includes(value as Appearance)
  );
}

/** Anything unrecognised (missing cookie, bad value) falls back to light. */
export function parseAppearance(value: string | null | undefined): Appearance {
  return isAppearance(value) ? value : DEFAULT_APPEARANCE;
}

/** `system` follows the device; the other two are already resolved. */
export function resolveAppearance(
  appearance: Appearance,
  systemPrefersDark: boolean,
): ResolvedAppearance {
  if (appearance === "system") return systemPrefersDark ? "dark" : "light";
  return appearance;
}

/** Reads the preference out of a `document.cookie` string. */
export function appearanceFromCookie(cookie: string): Appearance {
  const match = cookie.match(
    new RegExp(`(?:^|;\\s*)${APPEARANCE_COOKIE}=([^;]+)`),
  );
  return parseAppearance(match?.[1]?.trim());
}

/** A year-long, site-wide cookie. Not httpOnly: the browser needs to read it
    before the first paint so the shell never flashes the wrong theme. */
export function appearanceCookie(preference: Appearance): string {
  return `${APPEARANCE_COOKIE}=${preference}; path=/; max-age=31536000; samesite=lax`;
}

/**
 * Runs as the first script in `<body>`, i.e. before the app markup is parsed.
 * It puts the resolved appearance on `<html>` so CSS can pick the token set on
 * the very first paint. No framework, no imports, cannot throw.
 */
export const appearanceInitScript = `(function(){try{
var match=document.cookie.match(/(?:^|;\\s*)${APPEARANCE_COOKIE}=([^;]+)/);
var preference=match?match[1].trim():null;
if(preference!=="light"&&preference!=="dark"&&preference!=="system"){preference="${DEFAULT_APPEARANCE}";}
var dark=preference==="dark"||(preference==="system"&&window.matchMedia("(prefers-color-scheme: dark)").matches);
var root=document.documentElement;
root.dataset.appearance=dark?"dark":"light";
root.dataset.appearancePreference=preference;
}catch(error){}})();`;
