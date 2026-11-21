"use client";

import { Cog, Globe, Sparkles } from "lucide-react";

import { useState } from "react";

import { Chip } from "@/components/ui/Chip";
import Select from "@/components/ui/Select";
import { RsvpIcon, rsvpEmojis, rsvpIcons, rsvpStyles } from "./rsvpSymbols";
import RsvpCircles from "./RsvpCircles";
import type { EventDraft, Update } from "./draft";

const options = [
  { value: "public", label: "Public", hint: "Shows up in Browse events" },
  { value: "private", label: "Private", hint: "Only people with your link" },
] as const;

const slots = [
  { key: "rsvpGoing", label: "Going" },
  { key: "rsvpMaybe", label: "Maybe" },
  { key: "rsvpNo", label: "Can't go" },
] as const;

type SlotKey = (typeof slots)[number]["key"];

/** The card this pane's blocks sit in: panel radius, row surface, row border. */
const CARD =
  "rounded-panel border border-border bg-surface backdrop-blur-sticky";


export default function EventSettings({
  draft,
  update,
}: {
  draft: EventDraft;
  update: Update;
}) {
  const [slot, setSlot] = useState<SlotKey>("rsvpGoing");
  const custom = draft.rsvpStyleId === "custom";

  const pick = (id: string) => {
    if (id === "custom" && !custom) {
      // start the custom set from whatever preset is showing now
      const p =
        rsvpStyles.find((r) => r.id === draft.rsvpStyleId) ?? rsvpStyles[0];
      const selected =
        draft.rsvpMode === "emojis" ? p.emojis : [p.going, p.maybe, p.no];

      update("rsvpGoing", selected[0]);
      update("rsvpMaybe", selected[1]);
      update("rsvpNo", selected[2]);
    }
    update("rsvpStyleId", id);
  };

  return (
    <div className="space-y-4">
      {/* One row per setting, the way the create screen reads: a glyph, the
          question, then the answer as a control at the trailing edge. The
          selected option's explanation sits under it, so nothing the old pair
          of cards said is lost. */}
      <div className={`${CARD} px-4 py-3`}>
        <div className="flex items-center gap-3">
          <Globe
            aria-hidden="true"
            className="size-5 shrink-0 text-muted-foreground"
            strokeWidth={1.8}
          />

          <p id="visibility-label" className="min-w-0 flex-1 text-base font-semibold">
            Who can find this event?
          </p>

          <Select
            aria-labelledby="visibility-label"
            wrapperClassName="w-auto shrink-0"
            value={draft.visibility}
            onChange={(event) =>
              update("visibility", event.target.value as EventDraft["visibility"])
            }
          >
            {options.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </Select>
        </div>

        <p className="mt-1 pl-8 text-2xs leading-snug text-muted-foreground">
          {options.find((o) => o.value === draft.visibility)?.hint}
        </p>
      </div>

      <div className={`${CARD} p-4`}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="flex items-center gap-2 text-base font-semibold">
            <Cog
              aria-hidden="true"
              className="size-5 text-muted-foreground"
              strokeWidth={1.8}
            />
            RSVP Options
          </p>
          <Select
            aria-label="RSVP style"
            wrapperClassName="w-auto"
            value={custom ? "custom" : draft.rsvpStyleId}
            onChange={(event) => pick(event.target.value)}
          >
            {rsvpStyles.map((style) => (
              <option key={style.id} value={style.id}>
                {style.name}
              </option>
            ))}
            <option value="custom">Custom icons</option>
          </Select>
        </div>

        <div
          className="mt-3 flex gap-2"
          role="group"
          aria-label="RSVP symbol type"
        >
          {(["emojis", "icons"] as const).map((mode) => (
            <Chip
              key={mode}
              selected={draft.rsvpMode === mode}
              className="capitalize"
              icon={
                mode === "icons" ? (
                  <RsvpIcon name="sparkle" className="size-4" />
                ) : (
                  <Sparkles className="size-4" aria-hidden />
                )
              }
              onClick={() => {
                if (draft.rsvpMode === mode) return;

                const preset = rsvpStyles.find(
                  (style) => style.id === draft.rsvpStyleId,
                );

                if (custom && preset) {
                  const values =
                    mode === "emojis"
                      ? preset.emojis
                      : [preset.going, preset.maybe, preset.no];

                  update("rsvpGoing", values[0]);
                  update("rsvpMaybe", values[1]);
                  update("rsvpNo", values[2]);
                }

                update("rsvpMode", mode);
              }}
            >
              {mode}
            </Chip>
          ))}
        </div>

        {custom && (
          <div className="mt-4 space-y-3">
            <p className="text-xs text-muted-foreground">
              Choose a response, then select the symbol for it.
            </p>

            <div
              className="flex gap-2"
              role="group"
              aria-label="Button to change"
            >
              {slots
                .filter((s) => s.key !== "rsvpMaybe" || draft.allowMaybe)
                .map((s) => (
                  <Chip
                    key={s.key}
                    selected={slot === s.key}
                    className="flex-1"
                    icon={<RsvpIcon name={draft[s.key]} className="size-4" />}
                    onClick={() => setSlot(s.key)}
                  >
                    {s.label}
                  </Chip>
                ))}
            </div>

            <div className="flex flex-wrap gap-1.5">
              {(draft.rsvpMode === "emojis" ? rsvpEmojis : rsvpIcons).map(
                (e) => (
                  <button
                    key={e}
                    type="button"
                    aria-label={`Use ${e} ${draft.rsvpMode === "icons" ? "icon" : "emoji"}`}
                    onClick={() => update(slot, e)}
                    className="flex size-11 items-center justify-center rounded-field border border-border bg-surface transition-colors hover:border-foreground/30"
                  >
                    {draft.rsvpMode === "icons" ? (
                      <RsvpIcon name={e} />
                    ) : (
                      <span className="text-xl">{e}</span>
                    )}
                  </button>
                ),
              )}
            </div>
          </div>
        )}

        <div className="mt-4">
          <RsvpCircles draft={draft} />
        </div>
      </div>
    </div>
  );
}
