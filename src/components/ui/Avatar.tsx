/* Initials avatar with a deterministic colour per name. */

const COLORS = [
  "#e8c878",
  "#f0a58d",
  "#c9b2e6",
  "#9fd3f0",
  "#b7dc6a",
  "#ff9fd8",
];

export function Avatar({ name, size = 40 }: { name: string; size?: number }) {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");
  const color = COLORS[(name.charCodeAt(0) + name.length) % COLORS.length];

  return (
    <span
      aria-hidden
      className="flex lowercase shrink-0 items-center justify-center rounded-full text-xs font-bold text-poster-ink"
      style={{ width: size, height: size, background: color }}
    >
      {initials}
    </span>
  );
}
