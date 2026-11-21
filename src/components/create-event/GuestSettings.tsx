import { Stepper, Toggle } from "./controls";
import type { EventDraft, Update } from "./draft";
import MemoriesSettings from "./MemoriesSettings";

export default function GuestSettings({
  draft,
  update,
}: {
  draft: EventDraft;
  update: Update;
}) {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium">Guests each person can bring</p>
          <p className="mt-0.5 text-xs text-muted-foreground">Set to 0 for no plus-ones.</p>
        </div>

        <Stepper
          label="Plus-ones per guest"
          value={draft.plusOnes}
          min={0}
          max={5}
          onChange={(v) => update("plusOnes", v)}
        />
      </div>

      <Toggle
        label="Show guest list"
        hint="Guests can see who else is coming."
        checked={draft.showGuestList}
        onChange={(v) => update("showGuestList", v)}
      />

      <Toggle
        label="Approve guests first"
        hint="People request to join and you decide."
        checked={draft.requireApproval}
        onChange={(v) => update("requireApproval", v)}
      />

      <Toggle
        label="Ask for WhatsApp number"
        hint="Handy for reminders and updates."
        checked={draft.askWhatsapp}
        onChange={(v) => update("askWhatsapp", v)}
      />

      <Toggle
        label={'Allow "Maybe" RSVPs'}
        checked={draft.allowMaybe}
        onChange={(v) => update("allowMaybe", v)}
      />

      <MemoriesSettings draft={draft} update={update} />
    </div>
  );
}
