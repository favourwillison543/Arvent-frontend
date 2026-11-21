/**
 * Where a visitor lands when there is no usable destination.
 *
 * `/home` is the workspace they signed up for; `/create` is one step inside it.
 * Defaulting to the composer made "log in" open a blank form instead of the
 * dashboard, so a returning organizer could not tell whether the login worked.
 */
const FALLBACK_RETURN_TO = "/home";

export function safeReturnTo(value: string | null | undefined) {
  if (
    !value ||
    !value.startsWith("/") ||
    value.startsWith("//") ||
    value.includes("\\")
  ) {
    return FALLBACK_RETURN_TO;
  }

  try {
    const destination = new URL(value, "https://arvent.invalid");
    return destination.origin === "https://arvent.invalid"
      ? `${destination.pathname}${destination.search}${destination.hash}`
      : FALLBACK_RETURN_TO;
  } catch {
    return FALLBACK_RETURN_TO;
  }
}
