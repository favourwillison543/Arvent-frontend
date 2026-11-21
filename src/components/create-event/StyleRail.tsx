"use client";

import { useEffect, useState } from "react";

import GuestSettings from "./GuestSettings";
import DesignerArtwork from "./DesignerArtwork";
import { Chip } from "@/components/ui/Chip";
import { Icon } from "@/components/ui/Icon";
import { ActionRail, RailButton } from "@/components/ui/ActionRail";
import { effects } from "./effects";
import { themeStyle, themes } from "./themes";
import type { EventDraft, Update } from "./draft";

type PanelId = "theme" | "effect" | "settings" | null;
type Filter = "all" | "light" | "seasonal" | "dark" | "trending" | "formal" | "fun";

const seasonalThemes = new Set([
  "ember",
  "sunrise",
  "copper",
  "terracotta",
  "night-sky",
  "wildflower",
]);
const trendingThemes = new Set([
  "aurora",
  "ocean",
  "holographic",
  "velvet",
  "candy",
  "orchid",
]);
const funThemes = new Set([
  "checker",
  "citrus",
  "citrus-grove",
  "wildflower",
  "candy",
  "holographic",
]);
/* Traditional ceremonies, conventions and the quieter, more formal parties. */
const formalThemes = new Set([
  "traditional-gold",
  "heritage-emerald",
  "aso-oke",
  "convention-slate",
  "summit-hall",
  "expo-hall",
  "ivory-linen",
  "champagne-silk",
  "monochrome",
  "midnight-velvet",
]);

function matchesFilter(
  themeId: string,
  themeMode: "light" | "dark",
  filter: Filter,
) {
  if (filter === "all") return true;
  if (filter === "light" || filter === "dark") return themeMode === filter;
  if (filter === "seasonal") return seasonalThemes.has(themeId);
  if (filter === "trending") return trendingThemes.has(themeId);
  if (filter === "formal") return formalThemes.has(themeId);
  return funThemes.has(themeId);
}

function FilterIcon({ name }: { name: Filter }) {
  const icons: Record<Filter, string> = {
    all: "confetti",
    light: "sun",
    seasonal: "flower",
    dark: "moon",
    trending: "flame",
    formal: "crown",
    fun: "sparkle",
  };
  return <DesignerArtwork name={icons[name]} className="mr-1.5 size-4" />;
}

export default function StyleRail({
  draft,
  update,
  onPreview,
}: {
  draft: EventDraft;
  update: Update;
  onPreview: () => void;
}) {
  const [open, setOpen] = useState<PanelId>(null);
  const [filter, setFilter] = useState<Filter>("all");
  const theme = themes.find((t) => t.id === draft.themeId) ?? themes[0];

  useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(null);

    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const toggle = (id: Exclude<PanelId, null>) =>
    setOpen((o) => (o === id ? null : id));

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-rail"
          aria-hidden
          onClick={() => setOpen(null)}
        />
      )}

      {/* The panel opens *above* the floating tool rail on a phone, not at the
          bottom edge. At `bottom-float` (0.75rem) it sat on the browser's own
          chrome and covered the rail it belongs to (`z-sheet` over `z-rail`), so
          the tools it opened from could not be seen. The rail now sits `0.5rem`
          over the tab bar and is about `3.6rem` tall, so the panel clears the
          nav, the rail and one thumb of air. */}
      {open && (
        <div
          role="dialog"
          aria-label={open}
          className="ev-panel z-sheet fixed inset-x-3 bottom-[calc(var(--app-bottom-nav-h,0px)+env(safe-area-inset-bottom)+4.75rem)] max-h-[52vh] overflow-y-auto p-5 lg:inset-x-auto lg:bottom-auto lg:right-36 lg:top-16 lg:max-h-[82vh] lg:w-[min(70vw,68rem)]"
        >
          {open === "theme" && (
            <>
              <h3 className="font-display text-lg font-bold">Theme</h3>

              <div className="mt-4 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {(
                  [
                    "all",
                    "light",
                    "seasonal",
                    "dark",
                    "trending",
                    "formal",
                    "fun",
                  ] as Filter[]
                ).map((f) => (
                  <Chip
                    key={f}
                    selected={filter === f}
                    className="capitalize"
                    icon={<FilterIcon name={f} />}
                    onClick={() => setFilter(f)}
                  >
                    {f}
                  </Chip>
                ))}
              </div>

              <div className="mt-4 grid grid-cols-5 gap-3 sm:grid-cols-7 lg:grid-cols-9">
                {themes
                  .filter((t) => matchesFilter(t.id, t.mode, filter))
                  .map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      title={t.name}
                      aria-label={t.name}
                      aria-pressed={draft.themeId === t.id}
                      data-on={draft.themeId === t.id}
                      onClick={() => update("themeId", t.id)}
                      className="ev-sel aspect-square min-w-0 rounded-full border shadow-inner"
                      style={{ ...themeStyle(t), borderColor: "var(--line)" }}
                    />
                  ))}
              </div>
            </>
          )}

          {open === "effect" && (
            <>
              <h3 className="font-display text-lg font-bold">Effect</h3>

              <div className="mt-4 grid grid-cols-4 gap-2 sm:grid-cols-6 lg:grid-cols-8">
                {effects.map((e) => (
                  <button
                    key={e.id}
                    type="button"
                    aria-pressed={draft.effectId === e.id}
                    data-on={draft.effectId === e.id}
                    onClick={() => update("effectId", e.id)}
                    className="ev-sel flex min-w-0 flex-col items-center gap-2 rounded-panel border border-border bg-surface p-3 text-center text-xs font-semibold backdrop-blur-sticky transition-colors"
                  >
                    <span
                      className="flex size-16 items-center justify-center rounded-full bg-[radial-gradient(circle_at_30%_25%,rgba(255,255,255,.22),transparent_52%),linear-gradient(145deg,#392248,#12111a)] text-brand"
                      aria-hidden
                    >
                      <DesignerArtwork name={e.icon} className="size-10" />
                    </span>
                    {e.name}
                  </button>
                ))}
              </div>
            </>
          )}

          {open === "settings" && (
            <>
              <h3 className="font-display text-lg font-bold">Settings</h3>
              <div className="mt-4">
                <GuestSettings draft={draft} update={update} />
              </div>
            </>
          )}
        </div>
      )}

      <ActionRail label="Event tools">
        <RailButton
          label="Theme"
          on={open === "theme"}
          onClick={() => toggle("theme")}
          icon={
            <span
              className="size-6 rounded-full border"
              style={{ ...themeStyle(theme), borderColor: "var(--line)" }}
            />
          }
        />

        <RailButton
          label="Effect"
          on={open === "effect"}
          onClick={() => toggle("effect")}
          icon={
            <DesignerArtwork
              name={
                effects.find((effect) => effect.id === draft.effectId)?.icon ??
                "sparkle"
              }
              className="size-6"
            />
          }
        />

        <RailButton
          label="Settings"
          on={open === "settings"}
          onClick={() => toggle("settings")}
          icon={<Icon name="sliders" size={24} />}
        />

        <RailButton
          label="Preview"
          onClick={onPreview}
          icon={<Icon name="eye" size={24} />}
        />
      </ActionRail>
    </>
  );
}
