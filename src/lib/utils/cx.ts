/**
 * Conditional class names, without a dependency.
 *
 * Anything that isn't a non-empty string is dropped, so `cx("a", count && "b",
 * "c")` survives a `count` of `0` — the usual way `&&` guards misbehave.
 */
export function cx(...values: unknown[]): string {
  return values
    .filter((value): value is string => typeof value === "string" && value !== "")
    .join(" ");
}

export default cx;
